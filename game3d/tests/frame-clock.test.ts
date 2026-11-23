import test from 'node:test';
import assert from 'node:assert/strict';
import { FrameClock, STEP_SECONDS } from '../src/player/frame-clock.ts';
test('ten seconds walking covers the same distance at 60Hz and 5Hz rendering', () => {
  const walk = (frames: number, elapsed: number) => {
    const clock = new FrameClock(); let metres = 0;
    for(let i=0;i<frames;i++) clock.advance(elapsed, dt => { metres += 1.4 * dt; });
    return metres;
  };
  assert(Math.abs(walk(600,1/60)-14)<1e-8);
  assert(Math.abs(walk(50,.2)-14)<1e-8);
});
test('stalls have bounded collision work and a pause discards the partial step', () => {
  const clock=new FrameClock(); let calls=0;
  assert.equal(clock.advance(30,()=>calls++),.25); assert.equal(calls,15);
  clock.advance(STEP_SECONDS/2,()=>calls++); clock.reset();
  clock.advance(STEP_SECONDS/2,()=>calls++); assert.equal(calls,15);
  clock.advance(STEP_SECONDS/2,()=>calls++); assert.equal(calls,16);
});
