import type { MoveInput } from "./movement.ts";

const movementCodes = new Set(["KeyW", "KeyA", "KeyS", "KeyD", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"]);
const isUiTarget = (target: EventTarget | null) => target instanceof HTMLElement &&
  Boolean(target.closest("input, textarea, select, button, a, dialog, [contenteditable='true']"));

export class PlayerInput {
  private keys = new Set<string>();
  private abort = new AbortController();
  private enabled = true;
  private dragging = false;
  private pointerId: number | null = null;
  private orbitX = 0;
  private orbitY = 0;
  private zoom = 0;
  private interaction = false;
  private canvas: HTMLCanvasElement;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const signal = this.abort.signal;
    window.addEventListener("keydown", event => {
      if (!this.enabled || isUiTarget(event.target)) return;
      if (movementCodes.has(event.code) || event.code === "KeyE") event.preventDefault();
      if (movementCodes.has(event.code)) this.keys.add(event.code);
      if (event.code === "KeyE" && !event.repeat) this.interaction = true;
    }, { signal });
    window.addEventListener("keyup", event => this.keys.delete(event.code), { signal });
    window.addEventListener("blur", () => this.clear(), { signal });
    document.addEventListener("visibilitychange", () => { if (document.hidden) this.clear(); }, { signal });
    document.addEventListener("focusin", event => { if (isUiTarget(event.target)) this.clear(); }, { signal });
    canvas.addEventListener("pointerdown", event => {
      if (!this.enabled || event.button !== 0) return;
      canvas.focus();
      this.dragging = true;
      this.pointerId = event.pointerId;
      canvas.setPointerCapture(event.pointerId);
    }, { signal });
    canvas.addEventListener("pointermove", event => {
      if (this.enabled && this.dragging) { this.orbitX += event.movementX; this.orbitY += event.movementY; }
    }, { signal });
    canvas.addEventListener("pointerup", () => this.stopDrag(), { signal });
    canvas.addEventListener("lostpointercapture", () => { this.dragging = false; this.pointerId = null; }, { signal });
    canvas.addEventListener("wheel", event => {
      if (!this.enabled) return;
      event.preventDefault();
      this.zoom += Math.sign(event.deltaY) * 0.4;
    }, { passive: false, signal });
  }

  private stopDrag() {
    if (this.pointerId !== null && this.canvas.hasPointerCapture(this.pointerId)) this.canvas.releasePointerCapture(this.pointerId);
    this.dragging = false;
    this.pointerId = null;
  }
  clear() { this.keys.clear(); this.stopDrag(); this.orbitX = this.orbitY = this.zoom = 0; this.interaction = false; }
  setEnabled(enabled: boolean) { this.enabled = enabled; if (!enabled) this.clear(); }
  movement(): MoveInput {
    const has = (...codes: string[]) => codes.some(code => this.keys.has(code));
    return { x: Number(has("KeyD", "ArrowRight")) - Number(has("KeyA", "ArrowLeft")),
      z: Number(has("KeyW", "ArrowUp")) - Number(has("KeyS", "ArrowDown")) };
  }
  consumeCamera() {
    const result = { x: this.orbitX, y: this.orbitY, zoom: this.zoom };
    this.orbitX = this.orbitY = this.zoom = 0;
    return result;
  }
  consumeInteraction(): boolean { const result = this.interaction; this.interaction = false; return result; }
  dispose() { this.clear(); this.abort.abort(); }
}
