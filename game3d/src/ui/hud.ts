interface HudCallbacks {
  interact(): void;
  pause(paused: boolean): void;
  sensitivity(value: number): void;
}

export class GameHud {
  readonly canvas: HTMLCanvasElement;
  private root: HTMLElement;
  private prompt: HTMLButtonElement;
  private debug: HTMLElement;
  private pauseDialog: HTMLDialogElement;
  private resultDialog: HTMLDialogElement;
  private abort = new AbortController();

  constructor(root: HTMLElement, callbacks: HudCallbacks) {
    this.root = root;
    root.innerHTML = `
      <canvas id="game-view" tabindex="0" aria-label="3D shop. Use WASD or arrow keys to walk, drag to orbit, wheel to zoom, and E to interact."></canvas>
      <header class="topbar"><div><span class="eyebrow">AV TECH RPG · M1 ENGINEERING SCENE</span><h1>Trunkslammer Shop</h1>
        <p class="stage-note">Placeholder assets · realistic characters and shop art arrive in M2</p></div>
        <nav><a id="legacy-link">Original 2D career</a><button id="pause-button">Pause / settings</button></nav></header>
      <div id="notice" role="status" class="notice">Loading shop…</div>
      <footer><div class="controls"><span><kbd>WASD</kbd> / arrows · Walk</span><span>Drag · Orbit</span><span>Wheel · Zoom</span></div>
        <div class="interaction"><p id="objective">Walk to the highlighted workbench.</p><button id="interact-button" disabled>Approach workbench</button></div>
        <p id="save-status" role="status">3D session only</p></footer>
      <pre id="debug-panel" hidden aria-label="3D diagnostics"></pre>
      <dialog id="pause-dialog"><h2>Paused</h2><p>Movement and camera controls are paused while this panel is open.</p>
        <label>Camera sensitivity <input id="sensitivity" type="range" min="0.4" max="2" step="0.1" value="1"></label>
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
    get<HTMLAnchorElement>("#legacy-link").href = new URL("../", new URL(import.meta.env.BASE_URL, location.origin)).href;
    const signal = this.abort.signal;
    this.prompt.addEventListener("click", () => callbacks.interact(), { signal });
    get("#pause-button").addEventListener("click", () => { callbacks.pause(true); this.pauseDialog.showModal(); }, { signal });
    get("#resume-button").addEventListener("click", () => this.pauseDialog.close(), { signal });
    get("#close-result").addEventListener("click", () => this.resultDialog.close(), { signal });
    for (const dialog of [this.pauseDialog, this.resultDialog]) {
      dialog.addEventListener("close", () => { callbacks.pause(false); this.canvas.focus(); }, { signal });
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
  interaction(label: string | undefined, completed: boolean) {
    const text = label ? `${label} · E` : "Approach workbench";
    if (this.prompt.textContent !== text) this.prompt.textContent = text;
    this.prompt.disabled = !label;
    const objective = completed ? "Workbench checked. You can return to review it." : "Walk to the workbench and inspect it.";
    const node = this.root.querySelector("#objective")!;
    if (node.textContent !== objective) node.textContent = objective;
  }
  result(message: string, reviewed: boolean) {
    this.root.querySelector("#result-title")!.textContent = reviewed ? "Workbench already checked" : "Workbench checked";
    this.root.querySelector("#result-copy")!.textContent = message;
    this.resultDialog.showModal();
  }
  diagnostics(snapshot: unknown) { if (!this.debug.hidden) this.debug.textContent = JSON.stringify(snapshot, null, 2); }
  fatal(error: unknown) {
    this.root.dataset.ready = "false";
    this.pauseDialog.close();
    this.resultDialog.close();
    this.root.querySelector<HTMLElement>("#error-panel")!.hidden = false;
    this.root.querySelector("#error-copy")!.textContent = error instanceof Error ? error.message : String(error);
  }
  dispose() { this.abort.abort(); this.root.replaceChildren(); }
}
