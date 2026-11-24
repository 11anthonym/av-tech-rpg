// Keep 60Hz collision steps independent of rendering down to 4Hz. A longer
// stall is discarded rather than replaying seconds of held input in one frame.
export const STEP_SECONDS = 1 / 60;
export const MAX_FRAME_SECONDS = .25;
export class FrameClock {
  private remainder = 0;
  reset() { this.remainder = 0; }
  advance(elapsed: number, step: (seconds: number) => void): number {
    const accepted = Math.max(0, Math.min(MAX_FRAME_SECONDS, elapsed));
    this.remainder += accepted;
    let count = 0;
    while (this.remainder + 1e-10 >= STEP_SECONDS && count < 15) {
      step(STEP_SECONDS); this.remainder -= STEP_SECONDS; count++;
    }
    return accepted;
  }
}
