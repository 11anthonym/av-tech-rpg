import {test,expect} from '@playwright/test';
import {ready,snapshot} from './flows/shop-prep.ts';
import {writeFile} from 'node:fs/promises';

test.afterEach(async({page},info)=>{
  if(!page.isClosed()){
    if(info.status!==info.expectedStatus)await page.screenshot({path:info.outputPath('failure.png'),timeout:5000}).catch(()=>{});
    await page.goto('about:blank');
  }
});
test('public 3D: deployed build, real assets, graphics, animation, Shift, camera and reload',async({page},info)=>{
  test.setTimeout(150000);const errors:string[]=[],assets:string[]=[];
  page.on('console',message=>{if(message.type()==='error')errors.push(message.text());});
  page.on('requestfailed',request=>{const failure=request.failure()?.errorText??'Unknown network failure';if(!['net::ERR_ABORTED','NS_BINDING_ABORTED'].includes(failure))errors.push(`${failure} ${request.url()}`);});
  page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`);if(/\.(glb|env)$/.test(r.url()))assets.push(r.url());});
  await page.goto(`./?debug=1&release=${process.env.EXPECTED_BUILD??'current'}`);await ready(page);
  const initial=await snapshot(page);if(process.env.EXPECTED_BUILD)expect(initial.build).toContain(process.env.EXPECTED_BUILD.slice(0,7));
  for(const name of ['technician.glb','supervisor.glb','shop-lighting.env'])expect(assets.some(a=>a.endsWith('/'+name))).toBe(true);
  await page.locator('#debug-panel').evaluate(e=>e.setAttribute('hidden',''));
  await page.getByRole('button',{name:'Pause / settings'}).click();const graphics=[];
  for(const [value,width] of [['balanced',1088],['high',1280],['low',832]] as const){
    await page.getByRole('combobox',{name:'Graphics quality'}).selectOption(value);await expect.poll(async()=>(await snapshot(page)).performance?.renderWidth).toBe(width);graphics.push({quality:value,metrics:(await snapshot(page)).performance});
  }
  await page.getByRole('button',{name:'Resume',exact:true}).click();
  await page.keyboard.down('d');await expect.poll(async()=>(await snapshot(page)).character?.speed).toBeGreaterThan(1.3);
  await page.keyboard.down('Shift');await expect.poll(async()=>(await snapshot(page)).character?.speed).toBeGreaterThan(2.4);
  await expect.poll(async()=>(await snapshot(page)).character?.walkWeight).toBeGreaterThan(.8);
  await page.keyboard.up('Shift');await expect.poll(async()=>{const speed=(await snapshot(page)).character!.speed;return speed>1.3&&speed<1.5;}).toBe(true);await page.keyboard.up('d');
  const previous=(await snapshot(page)).camera;await page.mouse.move(500,350);await page.mouse.down();await page.mouse.move(650,350,{steps:12});await page.mouse.up();await page.mouse.wheel(0,200);
  await expect.poll(async()=>Math.abs((await snapshot(page)).camera.yaw-previous.yaw)).toBeGreaterThan(.3);await expect.poll(async()=>(await snapshot(page)).camera.distance).not.toBe(previous.distance);
  await page.getByRole('button',{name:'Pause / settings'}).click();const saved=await snapshot(page);await page.getByRole('button',{name:'Resume',exact:true}).click();
  await page.reload();await ready(page);const resumed=await snapshot(page);expect(resumed.build).toBe(initial.build);expect(resumed.session).toEqual(saved.session);expect(resumed.performance?.quality).toBe('low');expect(resumed.camera.yaw).toBeCloseTo(saved.camera.yaw,2);
  await page.locator('#debug-panel').evaluate(e=>e.setAttribute('hidden',''));await page.screenshot({path:info.outputPath('live-3d-shop.png')});
  expect(errors).toEqual([]);expect(resumed.errors).toEqual([]);
  const observations=JSON.stringify({build:resumed.build,assets,graphics,metrics:resumed.performance,errors},null,2);
  await writeFile(info.outputPath('live-3d-observations.json'),observations);
  await info.attach('live-3d-observations',{body:observations,contentType:'application/json'});
});
