// Optional visual review of the *output* checkpoint from the normal-input test.
// Serve the staged site on 4174 first; no synthetic session/game-state setter.
import fs from 'node:fs/promises';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { firefox } from '@playwright/test';
const out = new URL('../../docs/qa/m3/', import.meta.url);
const browser = await firefox.launch({ firefoxUserPrefs: { 'webgl.force-enabled': true } });
const context = await browser.newContext({ storageState: JSON.parse(await fs.readFile(new URL('saved-session.json',out),'utf8')), viewport: {width:1280,height:720} });
const page = await context.newPage();
const errors=[]; page.on('pageerror',e=>errors.push(e.message));
const snapshot=()=>page.evaluate(()=>window.__AV3D__.snapshot());
async function go(key,axis,target,greater) {
  await page.keyboard.down(key);
  try { await page.waitForFunction(({axis,target,greater})=>{
    const value=window.__AV3D__.snapshot().position[axis]; return greater ? value>target : value<target;
  },{axis,target,greater},{timeout:30000}); } finally { await page.keyboard.up(key); }
}
try {
  await page.goto('http://127.0.0.1:4174/av-tech-rpg/3d/?debug=1');
  await page.waitForFunction(()=>document.querySelector('#app')?.dataset.ready==='true',null,{timeout:30000});
  await page.locator('#debug-panel').evaluate(e=>e.setAttribute('hidden',''));
  const restored=await snapshot();
  if(restored.session.loaded.length!==3 || restored.session.carry.length) throw Error('Checkpoint did not restore');
  // Saved checkpoint has yaw zero. Walk back around the racks and shelving.
  await go('a',0,2.5,false); await go('s',2,6.7,false); await go('a',0,-7.5,false);
  await go('s',2,-4,false); await go('d',0,-4.4,true);
  await page.getByRole('button',{name:'Pause / settings'}).click();
  await page.getByRole('combobox',{name:'Graphics quality'}).selectOption('high');
  await page.getByRole('button',{name:'Resume',exact:true}).click();
  const start=(await snapshot()).frames;
  await page.waitForFunction(n=>window.__AV3D__.snapshot().frames>n+12,start);
  await page.screenshot({path:fileURLToPath(new URL('supervisor.png',out))});
  const reviewed=await snapshot();
  await fs.writeFile(new URL('replay-diagnostics.json',out),JSON.stringify({
    browser:`Firefox ${browser.version()}`,host:{platform:os.platform(),release:os.release(),cpu:os.cpus()[0]?.model,cores:os.cpus().length},
    note:'Completed-session checkpoint replay for visual inspection. Main golden path and recording start fresh. Timings include quality-switch shader warmup; not a hardware benchmark.',
    restored,reviewed,errors,
  },null,2)+'\n');
  if(errors.length)throw Error(errors.join('\n'));
  console.log(JSON.stringify({loaded:reviewed.session.loaded,renderer:reviewed.performance.graphics,errors}));
} finally { await page.goto('about:blank').catch(()=>{}); await context.close(); await browser.close(); }
