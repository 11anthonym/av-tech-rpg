import { createRenderer } from "./render/renderer.ts";
import { createAreaView } from "./render/area-view.ts";
import { createTechnicianVisual } from "./player/visual.ts";
import { CharacterController } from "./player/controller.ts";
import { FollowCamera } from "./player/camera.ts";
import { PlayerInput } from "./player/input.ts";
import { GameHud } from "./ui/hud.ts";
import { SaveRepository } from "./persistence/save.ts";
import type { SaveData, StoragePort } from "./persistence/save.ts";
import { resolveAction, describeAction, objective } from "./domain/session.ts";
import type { Session } from "./domain/session.ts";
import { createShopProgress } from "./render/shop-progress.ts";
import { getArea,npcPlacement } from './world/areas.ts';
import type { ActionId,AreaId } from './content/ids.ts';
import { selectInteraction } from "./world/interactions.ts";
import type { InteractionDefinition, Vec3 } from "./world/shop.ts";
import { SettingsRepository, graphicsPresets } from "./persistence/settings.ts";
import { FrameClock, MAX_FRAME_SECONDS } from "./player/frame-clock.ts";
import {carrying,supervisorPresent} from './domain/workday.ts';
import {createWorkdayView} from './render/workday-view.ts';

declare const __BUILD_VERSION__: string;
export interface Diagnostics {
  build: string; areaId: string; position: number[]; camera: SaveData["camera"];
  cameraPosition: number[]; actualCameraDistance: number; actionId: string | null;
  completedActions: string[]; paused: boolean; transitioning:boolean; frames: number; loopTicks: number; activeMeshes: number; webgl: number; errors: string[];
  session: Session;
  supervisor: { meshes: number; joints: number; position: number[];visible:boolean;identity:string;asset:string;idleFrame:number;height:number } | null;
  installation:ReturnType<ReturnType<typeof createWorkdayView>['snapshot']>|null;
  cargo: ReturnType<ReturnType<typeof createShopProgress>["snapshot"]>;
  character: CharacterController["character"] | null;
  performance: ({ readyMs: number; sampledFrames: number; frameMs: { p50: number; p95: number; p99: number; max: number } } & ReturnType<ReturnType<typeof createRenderer>["metrics"]>) | null;
}
declare global { interface Window { __AV3D__?: { snapshot(): Diagnostics } } }

export async function startGame(root: HTMLElement) {
  let paused = false;
  let failed = false;
  let contextLost = false;
  let frames = 0;
  let loopTicks = 0;
  let renderDirty = true;
  let applying=false;
  let pendingSpawn:Vec3|undefined;
  let pendingChoices:ActionId[]=[];
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
  let progress: ReturnType<typeof createShopProgress> | undefined;
  let supervisor: Awaited<ReturnType<Awaited<ReturnType<typeof createTechnicianVisual>>["createSupervisor"]>> | undefined;
  let technician: Awaited<ReturnType<typeof createTechnicianVisual>> | undefined;
  let workdayView:ReturnType<typeof createWorkdayView>|undefined;
  // Accessing localStorage itself can throw, so defer it through this port.
  const storage: StoragePort = { getItem: key => localStorage.getItem(key), setItem: (key, value) => localStorage.setItem(key, value) };
  const repository = new SaveRepository(storage);
  const loaded = repository.load();
  const settingsRepository = new SettingsRepository(storage);
  let settings = settingsRepository.load();
  let session = loaded.data.session;
  let currentArea=getArea(session.areaId);
  const pause = (value: boolean) => {
    paused = value;
    renderDirty = true;
    input?.setEnabled(!paused && !failed && !contextLost && !applying);
    if(!value)pendingChoices=[];
    if (value) save();
  };
  const hud = new GameHud(root, { interact: () => interact(), pause,
    choose:actionId=>{if(paused&&pendingChoices.includes(actionId))void applyAction(actionId).catch(fatal);},
    sensitivity: value => {
      settings = { ...settings, sensitivity: value };
      if (camera) camera.sensitivity = value;
      if (!settingsRepository.save(settings)) hud.notice("Settings apply in this tab; preference saving is unavailable.");
    },
    quality: value => {
      settings = { ...settings, quality: value };
      renderer?.applyQuality(value);
      frameTimes.length = 0;
      hud.notice(settingsRepository.save(settings) ? `Graphics: ${graphicsPresets[value].label}` : "Settings apply in this tab; preference saving is unavailable.");
    } }, settings);
  function save() {
    if (!controller || !camera) return;
    const ok = repository.save({ version: 4, session, position: pendingSpawn??controller.position.asArray() as unknown as Vec3,
      camera: pendingSpawn?{yaw:0,pitch:.35,distance:5.5}:{ ...camera.state } });
    hud.saving(ok ? "3D session saved" : repository.problem ?? "Saving unavailable · playing in this tab");
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
    if (paused || failed || contextLost || applying || !controller || !renderer) return;
    const target = selectInteraction(renderer.scene, controller.position, currentArea.interactions);
    if (!target) return;
    void applyAction(target.actionId).catch(fatal);
  }
  async function changeArea(id:AreaId) {
    if(!renderer||!controller)return;
    input?.setEnabled(false);area?.dispose();currentArea=getArea(id);
    area=await createAreaView(renderer.scene,currentArea);
    controller.relocate(currentArea.spawn);supervisor?.place(npcPlacement[id]);
    camera?.dispose();camera=new FollowCamera(renderer.scene,{yaw:0,pitch:.35,distance:5.5},currentArea.props.filter(prop=>prop.solid));
    camera.sensitivity=settings.sensitivity;camera.update(controller.position);controller.updateCamera(camera.actualDistance);
    renderer.prepareShadows();await renderer.scene.whenReadyAsync();hud.place(id,currentArea.label);pendingSpawn=undefined;renderDirty=true;
  }
  async function applyAction(actionId:ActionId) {
    if(applying||failed||contextLost)return;applying=true;
    try {
      const previousArea=session.areaId,result=resolveAction(session,actionId);session=result.state;
      if(session.areaId!==previousArea){pendingSpawn=getArea(session.areaId).spawn;save();await changeArea(session.areaId);}
      technician?.setCarrying(carrying(session));progress?.update(session);workdayView?.update(session);
      updateSupervisor();renderer?.prepareShadows();hud.loadout(session);save();
      lastAction=`${actionId}:${result.event.outcome}`;renderDirty=true;
      if(result.event.dialog){pendingChoices=result.event.choices?.map(choice=>choice.actionId)??[];pause(true);
        hud.result(result.event.message,result.event.outcome==='reviewed',result.event.title,result.event.choices);}
      else hud.notice(result.event.message);
    } finally {applying=false;input?.setEnabled(!paused&&!failed&&!contextLost);}
  }
  function updateSupervisor(){
    const visible=supervisorPresent(session);supervisor?.setVisible(visible);area?.setPropEnabled('supervisor',visible);
    camera?.setObstacles(currentArea.props.filter(prop=>prop.solid&&(prop.id!=='supervisor'||visible)));
  }
  const snapshot = (): Diagnostics => ({ build: __BUILD_VERSION__, areaId: session.areaId,
    position: controller?.position.asArray() ?? [], camera: { ...(camera?.state ?? loaded.data.camera) },
    cameraPosition: camera?.camera.position.asArray() ?? [], actualCameraDistance: camera?.actualDistance ?? 0,
    actionId: active?.actionId ?? null, completedActions: [...session.completedActions], paused,transitioning:applying,
    session: structuredClone(session), supervisor: supervisor?.snapshot() ?? null, cargo: progress?.snapshot() ?? [],installation:workdayView?.snapshot()??null,
    character: controller?.character ?? null,
    performance: renderer ? { readyMs, sampledFrames: frameTimes.length, frameMs: percentiles(frameTimes), ...renderer.metrics() } : null,
    frames, loopTicks, activeMeshes: renderer?.scene.getActiveMeshes().length ?? 0,
    webgl: renderer?.engine.webGLVersion ?? 0, errors: [...errors] });
  // Read-only observability is available on explicit debug URLs, never a state setter.
  if (new URLSearchParams(location.search).has("debug")) window.__AV3D__ = { snapshot };
  window.addEventListener("error", event => fatal(event.error ?? event.message), { signal: abort.signal });
  window.addEventListener("unhandledrejection", event => fatal(event.reason), { signal: abort.signal });
  window.addEventListener("pagehide", save, { signal: abort.signal });
  window.addEventListener("blur", save, { signal: abort.signal });
  const dispose = () => {
    save(); abort.abort(); input?.dispose(); camera?.dispose(); progress?.dispose();workdayView?.dispose();supervisor?.dispose(); controller?.dispose();
    area?.dispose(); renderer?.dispose(); hud.dispose(); delete window.__AV3D__;
  };
  try {
    renderer = createRenderer(hud.canvas, settings.quality, () => { renderDirty = true; });
    input = new PlayerInput(hud.canvas);
    await renderer.ready;
    area = await createAreaView(renderer.scene, currentArea);
    hud.notice("Loading technician and movement clips…");
    technician = await createTechnicianVisual(renderer.scene);
    controller = new CharacterController(renderer.scene, loaded.data.position, technician);
    technician.setCarrying(carrying(session));
    supervisor = await technician.createSupervisor();
    supervisor.place(npcPlacement[session.areaId]);
    progress = createShopProgress(renderer.scene, technician.root);
    workdayView=createWorkdayView(renderer.scene,technician.root);workdayView.update(session);
    progress.update(session); hud.loadout(session);
    camera = new FollowCamera(renderer.scene, loaded.data.camera, currentArea.props.filter(prop => prop.solid));
    camera.sensitivity = settings.sensitivity;
    updateSupervisor();
    camera.update(controller.position);
    controller.updateCamera(camera.actualDistance);
    renderer.prepareShadows();
    hud.place(session.areaId,currentArea.label);
    await renderer.scene.whenReadyAsync();
    renderer.engine.onContextLostObservable.add(() => {
      contextLost = true; input?.setEnabled(false); save(); hud.notice("Graphics interrupted. Waiting for the browser to recover…");
    });
    renderer.engine.onContextRestoredObservable.add(() => {
      contextLost = false; input?.setEnabled(!paused && !failed); hud.notice("Graphics restored");
    });
    const clock = new FrameClock();
    let sinceUi = 0;
    let sinceSave = 0;
    let lastRenderedAt = performance.now();
    renderer.engine.runRenderLoop(() => {
      loopTicks += 1;
      if (failed || contextLost || applying || !renderer || !input || !controller || !camera || !area) return;
      try {
        if (document.hidden || (paused && !renderDirty)) { clock.reset(); return; }
        const rawDelta = Math.max(renderer.engine.getDeltaTime() / 1000, 0.001);
        const delta = Math.min(rawDelta, MAX_FRAME_SECONDS);
        if (frames > 3 && !paused) { frameTimes.push(renderer.engine.getDeltaTime()); if (frameTimes.length > 180) frameTimes.shift(); }
        if (!paused && !document.hidden) {
          camera.orbit(input.consumeCamera());
          clock.advance(rawDelta, step => controller!.step(input!.movement(), camera!.state.yaw, step, carrying(session)));
        } else clock.reset();
        camera.update(controller.position, paused || document.hidden ? 0 : delta);
        controller.updateCamera(camera.actualDistance);
        progress?.cameraOpacity(controller.character.opacity);
        workdayView?.cameraOpacity(controller.character.opacity);
        sinceUi += delta;
        if (sinceUi >= 0.1 || frames === 0) {
          active = paused ? undefined : selectInteraction(renderer.scene, controller.position, currentArea.interactions);
          area.focus(active?.meshId);
          progress?.focus(active?.meshId);
          const action = active ? describeAction(session, active.actionId) : undefined;
          hud.interaction(action?.label, action?.available ?? false, objective(session));
          if (hud.diagnosticsVisible) hud.diagnostics({ ...snapshot(), lastAction });
          sinceUi = 0;
        }
        if (input.consumeInteraction()) interact();
        // Babylon measures animation time between scene renders, while the
        // engine loop keeps ticking during a static menu. Match the gait to
        // simulation time on resume instead of advancing across the pause.
        const renderedAt = performance.now();
        renderer.scene.animationTimeScale = paused ? 0 : delta * 1000 / Math.max(1, renderedAt - lastRenderedAt);
        renderer.scene.render();
        lastRenderedAt = renderedAt;
        renderDirty = false;
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
  return { p50: sorted[Math.floor(sorted.length * 0.5)] ?? 0, p95: sorted[Math.floor(sorted.length * 0.95)] ?? 0, p99: sorted[Math.floor(sorted.length * 0.99)] ?? 0, max: sorted.at(-1) ?? 0 };
}
