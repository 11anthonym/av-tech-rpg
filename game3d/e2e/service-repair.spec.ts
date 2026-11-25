import {test,expect} from '@playwright/test';
import path from 'node:path';
import {go as walk,interact,snapshot} from './flows/shop-prep.ts';
import {restored} from './flows/site-arrival.ts';

// The dependency earns this through the full first shift and diagnosis with real input.
// Alternative careers restore that exact browser checkpoint; no fabricated flags or reducers.
test.use({storageState:process.env.SERVICE_REPLAY_SOURCE??path.resolve('test-results/service-ready.json'),
  video:process.platform==='linux'||process.env.RECORD_VIDEO==='1'?{mode:'on',size:{width:960,height:540}}:'off'});
const close=(page:import('@playwright/test').Page)=>page.locator('#close-result').click();
async function go(page:import('@playwright/test').Page,key:string,axis:number,target:number,greater:boolean){
  const current=(await snapshot(page)).position[axis]!;
  if(greater?current>target:current<target)return;
  // Exercise the shipped faster-travel control, including both carried components.
  // Keep the original waypoint deadlines and all gameplay/collision assertions.
  await page.keyboard.down('Shift');try{await walk(page,key,axis,target,greater);}finally{await page.keyboard.up('Shift');}
}
test.afterEach(async({page},info)=>{
  if(info.status!==info.expectedStatus&&!page.isClosed()){
    await page.context().storageState({path:info.outputPath('failure-browser-state.json')});
    await info.attach('failure-state',{body:JSON.stringify(await snapshot(page).catch(()=>null)),contentType:'application/json'});
    await page.screenshot({path:info.outputPath('failure.png'),timeout:5000}).catch(()=>{});
  }
  if(!page.isClosed())await page.goto('about:blank');
});
async function display(page:import('@playwright/test').Page){
  if((await snapshot(page)).actionId!=='service-display'){
    // Stay east of the staging bench; walking south from the display hits it.
    await go(page,'d',0,4.7,true);await go(page,'w',2,2.8,true);await go(page,'a',0,2.3,false);
  }
  await interact(page,'service-display');
}
async function kit(page:import('@playwright/test').Page){await go(page,'d',0,4.7,true);await go(page,'s',2,-3.8,false);await go(page,'a',0,3.2,false);await go(page,'w',2,-2.3,true);await interact(page,'service-pickup');}
async function pressure(page:import('@playwright/test').Page,document=false){
  await go(page,'d',0,4.7,true);await go(page,'s',2,-3.8,false);await go(page,'a',0,-4.8,false);await go(page,'w',2,1,true);await go(page,'d',0,-3,true);await go(page,'w',2,1.1,true);await interact(page,'service-room-pressure');
  for(let count=0;count<8;count++){
    const recover=page.locator('#decision-options button[data-action^="service.recover."]');
    const condition=page.locator('#decision-options button[data-action^="service.response."]');
    const actions=await recover.count()?await recover.first().getAttribute('data-action'):null;
    if(actions){const stem=actions.slice(0,actions.lastIndexOf('.')+1),choice=document&&actions.includes('service.recover.')?page.locator(`button[data-action="${stem}document"]`):page.locator(`button[data-action="${stem}stabilize"]`);
      await (await choice.count()?choice:page.locator(`button[data-action="${stem}carry"]`)).click();
    }else if(await condition.count()){await condition.first().click();}else break;
  }
  await close(page);
}

for(const route of ['careful','hardware','documented'] as const)test(`service replay ${route}: physical installation, final test, paid handoff and persistent cause`,async({page},info)=>{
  test.setTimeout(300000);
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`);});
  await page.goto('./?debug=1');await restored(page);const before=(await snapshot(page)).session;
  expect(before.service?.evidence).toHaveLength(4);expect(before.service?.method).toBeNull();
  if(before.areaId==='shop'){
    await go(page,'s',2,-3.6,false);await go(page,'d',0,2.5,true);await go(page,'w',2,7.7,true);await go(page,'d',0,7.5,true);await go(page,'s',2,4.3,false);
    await interact(page,'shop.choose-route');await expect(page.locator('#app')).toHaveAttribute('data-area','serviceOffice');await close(page);
  }
  expect((await snapshot(page)).areaId).toBe('serviceOffice');
  await display(page);await expect(page.locator('#result-title')).toHaveText('Repair approaches');
  const method=route==='hardware'?'stage-clean-swap':'negotiate-verification-window';await page.locator(`button[data-action="service.method.${method}"]`).click();await close(page);
  await page.screenshot({path:info.outputPath('repair-method.png')});
  if(route!=='documented'){await pressure(page);}
  for(let component=0;component<2;component++){
    // Go around the meeting table on the same side as the replacement kit.
    const x=(await snapshot(page)).position[0]!;if(x<0){await go(page,'a',0,-4.8,false);await go(page,'s',2,-3.8,false);await go(page,'d',0,3.2,true);await go(page,'w',2,-2.3,true);await interact(page,'service-pickup');}else await kit(page);
    await page.locator('button[data-action="service.take-item"]').click();await close(page);
    const carrying=await snapshot(page);expect(carrying.serviceInstallation?.held).toBe(component===0?'replacement-display':'mount-hardware');
    await expect.poll(async()=>(await snapshot(page)).character?.carryPoseError??1).toBeLessThan(.08);
    await page.reload();await restored(page);expect((await snapshot(page)).session.service?.carried).toBe(carrying.session.service!.carried);
    await display(page);await expect(page.locator('#result-title')).toHaveText('Replacement installed');await close(page);
    expect((await snapshot(page)).serviceInstallation?.installed).toHaveLength(component+1);
    await page.screenshot({path:info.outputPath(`service-installed-${component+1}.png`)});
    const energy=(await snapshot(page)).session.energy;await interact(page,'service-display');await close(page);expect((await snapshot(page)).session.energy).toBe(energy);
  }
  await display(page);await page.locator(`button[data-action="service.test.${route==='documented'?'skip':'full'}"]`).click();await close(page);
  await page.reload();await restored(page);expect((await snapshot(page)).session.service?.finalTest).toBeTruthy();
  await pressure(page,route==='documented');
  await go(page,'a',0,-4.8,false);await go(page,'s',2,-3.8,false);await go(page,'d',0,-3,true);await go(page,'w',2,-3,true);await interact(page,'service-client');
  await page.locator('button[data-action="service.closeout"]').click();await page.screenshot({path:info.outputPath('service-paid-handoff.png')});await close(page);
  const paid=(await snapshot(page)).session;expect(paid.career.cash).toBe(before.career.cash+96);expect(paid.career.xp).toBe(before.career.xp+paid.service!.closeout!.xp);
  expect(paid.service!.closeout!.risky).toBe(route==='documented');expect(paid.career.nextAssignment).toBe(route==='documented'?'callbackCleanupDispatch':'serviceDispatch');
  await page.reload();await restored(page);expect((await snapshot(page)).session.career).toEqual(paid.career);
  await interact(page,'service-client');await expect(page.locator('button[data-action="service.closeout"]')).toHaveCount(0);await close(page);
  await go(page,'s',2,-4.5,false);await go(page,'d',0,0,true);await interact(page,'serviceOfficeToShop');await close(page);
  await go(page,'w',2,-1,true);await interact(page,'shop.inspect-workbench');await expect(page.locator('#result-copy')).toContainText(route==='documented'?'callback cleanup':'no named callback debt');
  await page.screenshot({path:info.outputPath('service-shop-follow-up.png')});await close(page);
  await page.context().storageState({path:info.outputPath(`service-${route}-saved.json`)});
  await info.attach('service-outcome',{body:JSON.stringify(await snapshot(page),null,2),contentType:'application/json'});
  expect(errors).toEqual([]);expect((await snapshot(page)).errors).toEqual([]);
  await page.goto('about:blank');
});
