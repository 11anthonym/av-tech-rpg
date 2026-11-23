// Actual production-browser evidence, driven only by normal keyboard/mouse input.
// Start `pnpm preview` first. `M2_VIDEO=1` adds the short walking/turning recording.
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { firefox } from '@playwright/test';
const out = fileURLToPath(new URL('../../docs/qa/m2/', import.meta.url));
await fs.mkdir(out, { recursive: true });
const video = process.env.M2_VIDEO === '1';
const base = process.env.M2_BASE_URL ?? 'http://127.0.0.1:4173/av-tech-rpg/3d/';
const browser = await firefox.launch({ firefoxUserPrefs: { 'webgl.force-enabled': true } });
const context = await browser.newContext({ viewport: { width: 1280, height: 720 },
  ...(video ? { recordVideo: { dir: path.join(out, 'raw-video'), size: { width: 960, height: 540 } } } : {}) });
const errors = [], warnings = [], marks = {};
const page = await context.newPage();
const recording = page.video();
const snapshot = () => page.evaluate(() => window.__AV3D__.snapshot());
const waitFrames = async (count = 8) => {
  const prior = (await snapshot()).frames;
  await page.waitForFunction(({ prior, count }) => window.__AV3D__.snapshot().frames >= prior + count, { prior, count }, { timeout: 60000 });
};
async function walk(key, axis, target, greater) {
  await page.keyboard.down(key);
  try {
    await page.waitForFunction(({ axis, target, greater }) => {
      const value = window.__AV3D__.snapshot().position[axis]; return greater ? value > target : value < target;
    }, { axis, target, greater }, { timeout: 60000 });
    marks[`walk-${key}-${target}`] = await snapshot();
  } finally { await page.keyboard.up(key); }
  await waitFrames(5);
}
page.on('pageerror', e => errors.push(e.message));
page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); else if (m.type() === 'warning') warnings.push(m.text()); });
page.on('response', r => { if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`); });
try {
  await page.goto(base + '?debug=1');
  await page.waitForFunction(() => document.querySelector('#app')?.dataset.ready === 'true' || !document.querySelector('#error-panel')?.hidden, null, { timeout: 60000 });
  if (await page.locator('#error-panel').isVisible()) throw new Error(await page.locator('#error-copy').innerText());
  // Only hide the read-only diagnostics overlay. No game state/test setter.
  await page.locator('#debug-panel').evaluate(e => { e.hidden = true; });
  await waitFrames(8);
  marks.initial = await snapshot(); console.log('READY', marks.initial.performance);
  await page.screenshot({ path: path.join(out, 'shop-follow.png') });
  await page.keyboard.down('w');
  await page.waitForFunction(() => window.__AV3D__.snapshot().position[2] > -2.6, null, { timeout: 60000 });
  marks.walking = await snapshot();
  await page.screenshot({ path: path.join(out, 'technician-walking.png') });
  await page.keyboard.up('w');
  await walk('d', 0, 1.9, true);
  await walk('s', 2, -3.5, false);
  await walk('a', 0, 0, false);
  await walk('w', 2, -0.85, true);
  await page.keyboard.down('w'); await waitFrames(12); await page.keyboard.up('w');
  await waitFrames(10); marks.blocked = await snapshot();
  await page.keyboard.press('e'); await page.locator('#result-dialog').waitFor({ state: 'visible' });
  await page.getByRole('button', { name: 'Back to shop' }).click();
  await page.screenshot({ path: path.join(out, 'workbench.png') });
  console.log('WALK/TURNS/COLLISION/INTERACTION CAPTURED');
  if (!video) {
    await walk('d', 0, 2.7, true); await walk('w', 2, 1.6, true);
    await page.mouse.move(600, 380); await page.mouse.down(); await page.mouse.move(750, 380, { steps: 12 }); await page.mouse.up();
    await waitFrames(8); await page.screenshot({ path: path.join(out, 'van-loading-bay.png') });
    // Return orbit, turn toward camera and zoom using the same public controls.
    await page.mouse.move(750, 380); await page.mouse.down(); await page.mouse.move(600, 380, { steps: 12 }); await page.mouse.up();
    await walk('s', 2, 1.1, false);
    for (let i = 0; i < 9; i++) { await page.mouse.wheel(0, -100); await waitFrames(2); }
    await waitFrames(12);
    await page.screenshot({ path: path.join(out, 'technician-front.png') });
    marks.front = await snapshot();
    await waitFrames(120);
    marks.measured = await snapshot();
    const resources = await page.evaluate(() => performance.getEntriesByType('resource').map(r => ({
      url: r.name, durationMs: r.duration, transferBytes: r.transferSize, encodedBytes: r.encodedBodySize, decodedBytes: r.decodedBodySize,
    })));
    const report = { capturedAt: new Date().toISOString(), base,
      commit: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
      browser: `Firefox ${browser.version()}`, viewport: { width:1280, height:720 }, recording: false,
      host: { platform: os.platform(), release: os.release(), cpu: os.cpus()[0]?.model, logicalCPUs: os.cpus().length, memoryBytes: os.totalmem() },
      marks, resources, errors, warnings, note: 'Local virtual-machine/software-renderer observations, including automated screenshots. Not physical target-GPU FPS acceptance.' };
    await fs.writeFile(path.join(out, 'browser-measurements.json'), JSON.stringify(report, null, 2) + '\n');
    console.log('MEASURED', marks.measured.performance, 'ERRORS', errors.length);
  }
  if (errors.length) throw new Error(errors.join('\n'));
  await page.goto('about:blank');
} catch (error) {
  console.error('CAPTURE FAILED', error); throw error;
} finally {
  if (!page.isClosed()) await page.goto('about:blank', { timeout: 10000 }).catch(() => {});
  await context.close();
  if (recording) {
    await recording.saveAs(path.join(out, 'walking-turning.webm')); await recording.delete();
    await fs.rm(path.join(out, 'raw-video'), { recursive: false }).catch(() => {});
    console.log('VIDEO', path.join(out, 'walking-turning.webm'));
  }
  await browser.close();
}
