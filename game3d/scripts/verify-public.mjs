// Functional acceptance of the actual public build, with the SAME normal-input
// cargo assertions as CI. This manual audit has per-action limits; it does not
// replace or relax the M3 test's 240-second automated performance budget.
import { firefox,expect } from '@playwright/test';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { prepareVan,ready,snapshot } from '../e2e/flows/shop-prep.ts';
const url=process.env.PUBLIC_GAME_URL??'https://11anthonym.github.io/av-tech-rpg/3d/';
const out=path.resolve(process.env.PUBLIC_QA_OUTPUT??fileURLToPath(new URL('../live-release-results/public-acceptance/',import.meta.url)));await fs.mkdir(out,{recursive:true});
const browser=await firefox.launch({headless:process.platform!=='linux',firefoxUserPrefs:{'webgl.force-enabled':true}});
const context=await browser.newContext({baseURL:url,viewport:{width:1280,height:720},...(process.env.RECORD_VIDEO==='1'?{recordVideo:{dir:out,size:{width:960,height:540}}}:{})});
const page=await context.newPage(),errors=[];const started=Date.now();
page.setDefaultTimeout(30000);
page.on('pageerror',error=>errors.push(error.message));page.on('console',message=>{if(message.type()==='error')errors.push(message.text());});
page.on('response',response=>{if(response.status()>=400)errors.push(`${response.status()} ${response.url()}`);});
const evidence={outputPath:name=>path.join(out,name),attach:async(name,{body})=>{await fs.writeFile(path.join(out,`${name}.json`),body);}};
let result;
try {
  await page.goto('../');await page.waitForFunction(()=>window.AV_TECH_RPG_READY===true);
  await page.getByRole('button',{name:'New Career',exact:true}).click();
  await page.locator('.technician-card').filter({has:page.getByRole('heading',{name:'Alex',exact:true})}).getByRole('button',{name:'Start First Day'}).click();
  await expect(page.locator('#tech-name')).toContainText('Alex');
  const career=await page.evaluate(()=>localStorage.getItem('av-tech-rpg-save-v1'));
  // The currently deployed M3 shop predates the wider left aisle. The audit
  // uses the open right aisle, with identical cargo/progression assertions.
  const prepared=await prepareVan(page,evidence,{wideApproach:true});
  await page.getByRole('button',{name:'Pause / settings'}).click();
  const quality=[];
  for(const [value,width] of [['balanced',1088],['high',1280],['low',832]]) {
    await page.getByRole('combobox',{name:'Graphics quality'}).selectOption(value);
    await expect.poll(async()=>(await snapshot(page)).performance?.renderWidth,{timeout:15000}).toBe(width);
    quality.push((await snapshot(page)).performance);
  }
  await page.getByRole('slider',{name:'Camera sensitivity'}).focus();await page.keyboard.press('ArrowRight');
  const sensitivity=await page.getByRole('slider',{name:'Camera sensitivity'}).inputValue();
  await page.getByRole('button',{name:'Resume',exact:true}).click();await page.reload();await ready(page);
  await page.getByRole('button',{name:'Pause / settings'}).click();
  await expect(page.getByRole('slider',{name:'Camera sensitivity'})).toHaveValue(sensitivity);
  await expect(page.getByRole('combobox',{name:'Graphics quality'})).toHaveValue('low');
  await page.getByRole('button',{name:'Resume',exact:true}).click();
  const restored=await snapshot(page);expect(restored.session.loaded).toEqual(prepared.session.loaded);
  expect(await page.evaluate(()=>localStorage.getItem('av-tech-rpg-save-v1'))).toBe(career);
  await context.storageState({path:path.join(out,'completed-browser-state.json')});
  await page.getByRole('link',{name:'Original 2D career'}).click();await page.waitForFunction(()=>window.AV_TECH_RPG_READY===true);
  expect(await page.evaluate(()=>localStorage.getItem('av-tech-rpg-save-v1'))).toBe(career);
  await page.getByRole('button',{name:'Continue Career',exact:true}).click();await expect(page.locator('#tech-name')).toContainText('Alex');
  await page.screenshot({path:path.join(out,'continued-2d.png')});expect(errors).toEqual([]);
  result={url,elapsedSeconds:(Date.now()-started)/1000,browser:`Firefox ${browser.version()}`,host:{platform:os.platform(),release:os.release(),cpu:os.cpus()[0]?.model},
    note:'Actual hosted normal-input functional audit, not the timed CI replay or a physical-GPU benchmark.',build:restored.build,prepared,restored,quality,errors};
  console.log(JSON.stringify({build:result.build,seconds:result.elapsedSeconds,loaded:restored.session.loaded,errors}));
}catch(error){result={url,elapsedSeconds:(Date.now()-started)/1000,error:String(error),errors};await page.screenshot({path:path.join(out,'failed.png'),timeout:10000}).catch(()=>{});throw error;}
finally {
  await fs.writeFile(path.join(out,'verification.json'),JSON.stringify(result,null,2));
  // Close the page directly. A second cross-origin navigation solely for
  // cleanup can leave Firefox's recording context waiting on disposed handles.
  try {await page.close();await context.close();} finally {await browser.close();}
}
