import type { GraphicsQuality, Settings } from "../persistence/settings.ts";
import type { Session } from "../domain/session.ts";

interface HudCallbacks {
  interact(): void;
  pause(paused: boolean): void;
  sensitivity(value: number): void;
  quality(value: GraphicsQuality): void;
}

export class GameHud {
  readonly canvas: HTMLCanvasElement;
  private root: HTMLElement;
  private prompt: HTMLButtonElement;
  private debug: HTMLElement;
  private pauseDialog: HTMLDialogElement;
  private resultDialog: HTMLDialogElement;
  private abort = new AbortController();

  constructor(root: HTMLElement, callbacks: HudCallbacks, settings: Settings) {
    this.root = root;
    root.innerHTML = `
      <canvas id="game-view" tabindex="0" aria-label="3D shop. Use WASD or arrow keys to walk, drag to orbit, wheel to zoom, and E to interact."></canvas>
      <header class="topbar"><div><span class="eyebrow">AV TECH RPG · FIRST SHIFT</span><h1>Radnor Rack &amp; Wire</h1>
        <p class="stage-note">Service bench · systems test · Van 3 loading bay</p></div>
        <nav><a id="legacy-link">Original 2D career</a><button id="pause-button">Pause / settings</button></nav></header>
      <div id="notice" role="status" class="notice">Loading shop…</div>
      <footer><div class="controls"><span><kbd>WASD</kbd> / arrows · Walk</span><span>Drag · Orbit</span><span>Wheel · Zoom</span></div>
        <div class="interaction"><p id="objective">Talk to the supervisor.</p><button id="interact-button" disabled>Approach equipment</button></div>
        <p id="loadout" role="status"></p>
        <p id="save-status" role="status">3D session only</p></footer>
      <pre id="debug-panel" hidden aria-label="3D diagnostics"></pre>
      <dialog id="pause-dialog"><h2>Paused</h2><p>Movement and camera controls are paused while this panel is open.</p>
        <label>Graphics quality <select id="graphics-quality"><option value="high">High · full resolution</option>
          <option value="balanced">Balanced · 85% resolution</option><option value="low">Low · 65% resolution</option></select></label>
        <p class="settings-help">Lower settings draw fewer pixels and simpler shadows. Use Low if walking or camera movement feels choppy.</p>
        <label>Camera sensitivity <input id="sensitivity" type="range" min="0.4" max="2" step="0.1" value="${settings.sensitivity}"></label>
        <label class="checkbox"><input id="show-debug" type="checkbox"> Show diagnostics</label>
        <button id="resume-button">Resume</button></dialog>
      <dialog id="result-dialog"><h2 id="result-title">Workbench</h2><p id="result-copy"></p><button id="close-result">Back to shop</button></dialog>
      <section id="error-panel" hidden role="alert"><h2>The 3D scene could not continue</h2><p id="error-copy"></p>
        <p>Your original 2D career has not been changed.</p><button id="reload-button">Reload 3D scene</button></section>`;
    const get = <T extends HTMLElement>(selector: string) => root.querySelector<T>(selector)!;
    this.canvas = get<HTMLCanvasElement>("#game-view");
    this.prompt = get<HTMLButtonElement>("#interact-button");
    this.debug = get("#debug-panel");
    this.pauseDialog = get<HTMLDialogElement>("#pause-dialog");
    this.resultDialog = get<HTMLDialogElement>("#result-dialog");
    get<HTMLAnchorElement>("#legacy-link").href = import.meta.env.BASE_URL.startsWith("/av-tech-rpg/")
      ? new URL("../", new URL(import.meta.env.BASE_URL, location.origin)).href
      : "https://11anthonym.github.io/av-tech-rpg/";
    const signal = this.abort.signal;
    const quality = get<HTMLSelectElement>("#graphics-quality");
    quality.value = settings.quality;
    quality.addEventListener("change", () => callbacks.quality(quality.value as GraphicsQuality), { signal });
    this.prompt.addEventListener("click", () => callbacks.interact(), { signal });
    get("#pause-button").addEventListener("click", () => { callbacks.pause(true); this.pauseDialog.showModal(); }, { signal });
    const resumeIfClosed=()=>{
      if(!this.pauseDialog.open&&!this.resultDialog.open){callbacks.pause(false);this.canvas.focus();}
    };
    const close=(dialog:HTMLDialogElement)=>{dialog.close();resumeIfClosed();};
    // The native close event is queued. Restore focus/input in the initiating
    // event too, so an immediate next key is not lost against the old button.
    get("#resume-button").addEventListener("click", () => close(this.pauseDialog), { signal });
    get("#close-result").addEventListener("click", () => close(this.resultDialog), { signal });
    for (const dialog of [this.pauseDialog, this.resultDialog]) {
      dialog.addEventListener("close", resumeIfClosed, { signal });
      dialog.addEventListener('cancel',event=>{event.preventDefault();close(dialog);},{signal});
    }
    get<HTMLInputElement>("#sensitivity").addEventListener("input", event => callbacks.sensitivity(Number((event.target as HTMLInputElement).value)), { signal });
    const debugToggle = get<HTMLInputElement>("#show-debug");
    debugToggle.checked = new URLSearchParams(location.search).has("debug");
    this.debug.hidden = !debugToggle.checked;
    debugToggle.addEventListener("change", () => { this.debug.hidden = !debugToggle.checked; }, { signal });
    get("#reload-button").addEventListener("click", () => location.reload(), { signal });
  }
  ready(message: string) {
    this.root.dataset.ready = "true";
    this.notice(message);
    this.canvas.focus();
  }
  notice(message: string) { this.root.querySelector("#notice")!.textContent = message; }
  saving(message: string) { this.root.querySelector("#save-status")!.textContent = message; }
  interaction(label: string | undefined, available: boolean, objective: string) {
    const text = label ? `${label} · E` : "Approach equipment";
    if (this.prompt.textContent !== text) this.prompt.textContent = text;
    this.prompt.disabled = !label || !available;
    const node = this.root.querySelector("#objective")!;
    if (node.textContent !== objective) node.textContent = objective;
  }
  loadout(state: Session) {
    this.root.querySelector("#loadout")!.textContent = `Hands ${state.carry.length}/1: ${state.carry[0] ?? "Empty"} · Van ${state.loaded.length}/3 · Energy ${state.energy}/100 · Kit: screwdriver`;
  }
  result(message: string, reviewed: boolean, title?: string) {
    this.root.querySelector("#result-title")!.textContent = title ?? (reviewed ? "Workbench already checked" : "Workbench checked");
    this.root.querySelector("#result-copy")!.textContent = message;
    this.resultDialog.showModal();
  }
  diagnostics(snapshot: unknown) { if (!this.debug.hidden) this.debug.textContent = JSON.stringify(snapshot, null, 2); }
  get diagnosticsVisible() { return !this.debug.hidden; }
  fatal(error: unknown) {
    this.root.dataset.ready = "false";
    this.pauseDialog.close();
    this.resultDialog.close();
    this.root.querySelector<HTMLElement>("#error-panel")!.hidden = false;
    this.root.querySelector("#error-copy")!.textContent = error instanceof Error ? error.message : String(error);
  }
  dispose() { this.abort.abort(); this.root.replaceChildren(); }
}
