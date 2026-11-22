import { createRenderer } from "./render/renderer.ts";
import { createAreaView } from "./render/area-view.ts";
import { createTechnicianVisual } from "./player/visual.ts";
import { CharacterController } from "./player/controller.ts";
import { FollowCamera } from "./player/camera.ts";
import { PlayerInput } from "./player/input.ts";
import { GameHud } from "./ui/hud.ts";
import { SaveRepository } from "./persistence/save.ts";
import type { SaveData, StoragePort } from "./persistence/save.ts";
import { resolveAction } from "./domain/session.ts";
import { actions } from "./content/ids.ts";
import { shop } from "./world/shop.ts";
import { selectInteraction } from "./world/interactions.ts";
import type { InteractionDefinition, Vec3 } from "./world/shop.ts";

declare const __BUILD_VERSION__: string;
export interface Diagnostics {
  build: string; areaId: string; position: number[]; camera: SaveData["camera"];
  cameraPosition: number[]; actualCameraDistance: number; actionId: string | null;
  completedActions: string[]; paused: boolean; frames: number; activeMeshes: number; webgl: number; errors: string[];
  character: CharacterController["character"] | null;
  performance: { readyMs: number; sampledFrames: number; frameMs: { p50: number; p95: number; max: number }; drawCalls: number; vertices: number; graphics: { vendor: string; renderer: string; version: string } } | null;
}
declare global { interface Window { __AV3D__?: { snapshot(): Diagnostics } } }

export async function startGame(root: HTMLElement) {
  let paused = false;
  let failed = false;
  let contextLost = false;
  let frames = 0;
  const started = performance.now();
  let readyMs = 0;
  const frameTimes: number[] = [];
  let active: InteractionDefinition | undefined;
  let lastAction = "";
  const errors: string[] = [];
  const abort = new AbortController();
  let renderer: ReturnType<typeof createRenderer> | undefined;
  let input: PlayerInput | undefined;
  let controller: CharacterController | undefined;
  let camera: FollowCamera | undefined;
  let area: Awaited<ReturnType<typeof createAreaView>> | undefined;
  // Accessing localStorage itself can throw, so defer it through this port.
  const storage: StoragePort = { getItem: key => localStorage.getItem(key), setItem: (key, value) => localStorage.setItem(key, value) };
  const repository = new SaveRepository(storage);
  const loaded = repository.load();
  let session = loaded.data.session;
  const pause = (value: boolean) => {
    paused = value;
    input?.setEnabled(!paused && !failed && !contextLost);
    if (value) save();
  };
  const hud = new GameHud(root, { interact: () => interact(), pause,
    sensitivity: value => { if (camera) camera.sensitivity = value; } });
  function save() {
    if (!controller || !camera) return;
    const ok = repository.save({ version: 1, session, position: controller.position.asArray() as unknown as Vec3, camera: { ...camera.state } });
    hud.saving(ok ? "3D session saved" : "Saving unavailable · playing in this tab");
  }
  function fatal(error: unknown) {
    if (failed) return;
    failed = true;
    errors.push(error instanceof Error ? error.message : String(error));
    input?.setEnabled(false);
    renderer?.engine.stopRenderLoop();
    hud.fatal(error);
  }
  function interact() {
    if (paused || failed || contextLost || !controller || !renderer) return;
    const target = selectInteraction(renderer.scene, controller.position, shop.interactions);
    if (!target) return;
    const result = resolveAction(session, target.actionId);
    session = result.state;
    lastAction = `${target.actionId}:${result.event.outcome}`;
    pause(true);
    hud.result(result.event.message, result.event.outcome === "reviewed");
  }
  const snapshot = (): Diagnostics => ({ build: __BUILD_VERSION__, areaId: session.areaId,
    position: controller?.position.asArray() ?? [], camera: { ...(camera?.state ?? loaded.data.camera) },
    cameraPosition: camera?.camera.position.asArray() ?? [], actualCameraDistance: camera?.actualDistance ?? 0,
    actionId: active?.actionId ?? null, completedActions: [...session.completedActions], paused,
    character: controller?.character ?? null,
    performance: renderer ? { readyMs, sampledFrames: frameTimes.length, frameMs: percentiles(frameTimes), ...renderer.metrics() } : null,
    frames, activeMeshes: renderer?.scene.getActiveMeshes().length ?? 0,
    webgl: renderer?.engine.webGLVersion ?? 0, errors: [...errors] });
  // Read-only observability is available on explicit debug URLs, never a state setter.
  if (new URLSearchParams(location.search).has("debug")) window.__AV3D__ = { snapshot };
  window.addEventListener("error", event => fatal(event.error ?? event.message), { signal: abort.signal });
  window.addEventListener("unhandledrejection", event => fatal(event.reason), { signal: abort.signal });
  window.addEventListener("pagehide", save, { signal: abort.signal });
  window.addEventListener("blur", save, { signal: abort.signal });
  const dispose = () => {
    save(); abort.abort(); input?.dispose(); camera?.dispose(); controller?.dispose();
    area?.dispose(); renderer?.dispose(); hud.dispose(); delete window.__AV3D__;
  };
  try {
    renderer = createRenderer(hud.canvas);
    input = new PlayerInput(hud.canvas);
    area = await createAreaView(renderer.scene, shop);
    hud.notice("Loading technician and movement clips…");
    controller = new CharacterController(renderer.scene, loaded.data.position, await createTechnicianVisual(renderer.scene));
    camera = new FollowCamera(renderer.scene, loaded.data.camera);
    camera.update(controller.position);
    renderer.prepareShadows();
    await renderer.scene.whenReadyAsync();
    renderer.engine.onContextLostObservable.add(() => {
      contextLost = true; input?.setEnabled(false); save(); hud.notice("Graphics interrupted. Waiting for the browser to recover…");
    });
    renderer.engine.onContextRestoredObservable.add(() => {
      contextLost = false; input?.setEnabled(!paused && !failed); hud.notice("Graphics restored");
    });
    let accumulator = 0;
    let sinceUi = 0;
    let sinceSave = 0;
    renderer.engine.runRenderLoop(() => {
      if (failed || contextLost || !renderer || !input || !controller || !camera || !area) return;
      try {
        const delta = Math.min(renderer.engine.getDeltaTime() / 1000, 0.1);
        if (frames > 3) { frameTimes.push(renderer.engine.getDeltaTime()); if (frameTimes.length > 180) frameTimes.shift(); }
        if (!paused && !document.hidden) {
          camera.orbit(input.consumeCamera());
          accumulator += delta;
          while (accumulator >= 1 / 60) { controller.step(input.movement(), camera.state.yaw, 1 / 60); accumulator -= 1 / 60; }
        } else accumulator = 0;
        camera.update(controller.position);
        sinceUi += delta;
        if (sinceUi >= 0.1 || frames === 0) {
          active = paused ? undefined : selectInteraction(renderer.scene, controller.position, shop.interactions);
          area.focus(active?.meshId);
          const completed = session.completedActions.includes("shop.inspect-workbench");
          const action = active ? actions[active.actionId] : undefined;
          hud.interaction(action ? completed ? action.reviewLabel : action.label : undefined, completed);
          hud.diagnostics({ ...snapshot(), lastAction });
          sinceUi = 0;
        }
        if (input.consumeInteraction()) interact();
        renderer.scene.animationsEnabled = !paused && !document.hidden;
        renderer.scene.render();
        frames += 1;
        if (frames === 3) {
          readyMs = performance.now() - started;
          if (renderer.scene.getActiveMeshes().length === 0) throw new Error("The shop has no visible active geometry");
          hud.ready(loaded.message);
        }
        sinceSave += delta;
        if (sinceSave >= 3) { save(); sinceSave = 0; }
      } catch (error) { fatal(error); }
    });
  } catch (error) { fatal(error); }
  return { dispose };
}

function percentiles(values: number[]) {
  const sorted = [...values].sort((a, b) => a - b);
  return { p50: sorted[Math.floor(sorted.length * 0.5)] ?? 0, p95: sorted[Math.floor(sorted.length * 0.95)] ?? 0, max: sorted.at(-1) ?? 0 };
}
