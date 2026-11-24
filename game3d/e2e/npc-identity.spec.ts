import {test,expect} from '@playwright/test';
import {ready,go,snapshot} from './flows/shop-prep.ts';
import {characterCast} from '../src/content/cast.ts';

test.use({video:process.platform==='linux'||process.env.RECORD_VIDEO==='1'?{mode:'on',size:{width:960,height:540}}:'off'});
test.afterEach(async({page})=>{if(!page.isClosed())await page.goto('about:blank');});
test('two recognizable people retain identity and independent idle through pause and reload',async({page},info)=>{
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('./?debug=1');await ready(page);
  await page.getByRole('button',{name:'Pause / settings'}).click();await page.getByRole('combobox',{name:'Graphics quality'}).selectOption('low');
  await page.getByRole('checkbox',{name:'Show diagnostics'}).uncheck();await page.getByRole('button',{name:'Resume',exact:true}).click();
  await go(page,'a',0,-5.3,false);
  const initial=await snapshot(page);expect(initial.supervisor).toMatchObject({identity:characterCast.supervisor.identity,asset:characterCast.supervisor.asset,
    meshes:characterCast.supervisor.meshes,joints:characterCast.supervisor.joints,height:characterCast.supervisor.height,visible:true});
  expect(initial.character?.model).toBe('Rocketbox Andre / tee');
  await page.screenshot({path:info.outputPath('distinct-cast-shop.png')});
  await page.getByRole('button',{name:'Pause / settings'}).click();
  const paused=await snapshot(page);await page.waitForFunction(tick=>window.__AV3D__!.snapshot().loopTicks>tick+4,paused.loopTicks);
  expect((await snapshot(page)).supervisor?.idleFrame).toBe(paused.supervisor?.idleFrame);
  await page.getByRole('button',{name:'Resume',exact:true}).click();
  await expect.poll(async()=>(await snapshot(page)).supervisor?.idleFrame).not.toBe(paused.supervisor?.idleFrame);
  await page.reload();await ready(page);expect((await snapshot(page)).supervisor?.identity).toBe(initial.supervisor?.identity);
  expect(errors).toEqual([]);
  await info.attach('cast-cost-observation',{body:JSON.stringify(await snapshot(page),null,2),contentType:'application/json'});
});
test('a missing supervisor fails explicitly instead of silently cloning the technician',async({page})=>{
  await page.route('**/supervisor.glb',route=>route.fulfill({status:404,body:'missing NPC'}));
  await page.goto('./?debug=1');await expect(page.locator('#error-panel')).toBeVisible({timeout:30000});
  expect((await snapshot(page)).supervisor).toBeNull();await expect(page.locator('#error-copy')).toContainText('supervisor.glb');
});
