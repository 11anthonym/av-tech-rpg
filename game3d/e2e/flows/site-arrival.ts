import {expect} from '@playwright/test';
import type {Page,TestInfo} from '@playwright/test';
import {prepareVan,go,interact,ready,snapshot} from './shop-prep.ts';
export async function restored(page:Page){
  await ready(page);
  await page.locator('#debug-panel').evaluate(element=>element.setAttribute('hidden',''));
}

export async function arriveAtClient(page:Page,info:TestInfo){
  const errors:string[]=[];let humanLoads=0,lightingLoads=0;
  page.on('pageerror',error=>errors.push(error.message));
  page.on('console',message=>{if(message.type()==='error')errors.push(message.text());});
  page.on('response',response=>{if(response.status()>=400)errors.push(`${response.status()} ${response.url()}`);});
  page.on('request',request=>{if(request.url().endsWith('/technician.glb'))humanLoads++;if(request.url().endsWith('/shop-lighting.env'))lightingLoads++;});
  await page.goto('../');await page.waitForFunction(()=>(window as Window&{AV_TECH_RPG_READY?:boolean}).AV_TECH_RPG_READY===true);
  await page.getByRole('button',{name:'New Career',exact:true}).click();
  await page.locator('.technician-card').filter({has:page.getByRole('heading',{name:'Alex',exact:true})}).getByRole('button',{name:'Start First Day'}).click();
  const career=await page.evaluate(()=>localStorage.getItem('av-tech-rpg-save-v1'));expect(career).toBeTruthy();
  await prepareVan(page,info);
  // Undo the evidence orbit using the same ordinary drag input.
  const yaw=(await snapshot(page)).camera.yaw;
  await page.mouse.move(500,400);await page.mouse.down();await page.mouse.move(500+yaw/.005,400,{steps:16});await page.mouse.up();
  await expect.poll(async()=>Math.abs((await snapshot(page)).camera.yaw)).toBeLessThan(.02);
  await go(page,'d',0,7.5,true);await go(page,'s',2,4,false);
  await interact(page,'shop.choose-route');await expect(page.getByRole('heading',{name:'Drive to Center City',exact:true})).toBeVisible();
  await page.keyboard.press('Escape');expect((await snapshot(page)).session.travel.route).toBeNull();
  await interact(page,'shop.choose-route');await page.getByRole('button',{name:/Use the reliable garage route/}).click();
  await expect(page.locator('#app')).toHaveAttribute('data-area','centerCityGarage');
  await expect(page.getByRole('heading',{name:'Garage First, Apparently'})).toBeVisible();
  await page.locator('#close-result').click();
  const bootAssets={human:humanLoads,lighting:lightingLoads};
  expect((await snapshot(page)).session.travel.parkingExpense).toBe(18);
  await go(page,'a',0,-3.8,false);await go(page,'w',2,-2.2,true);
  await interact(page,'garage.brief-supervisor');await page.locator('#close-result').click();
  await go(page,'d',0,-2,true);
  for(let i=0;i<3;i++){
    await interact(page,'garage.unload-equipment');await expect.poll(async()=>(await snapshot(page)).session.carry.length).toBe(1);
    const carried=(await snapshot(page)).session;await page.keyboard.press('e');expect((await snapshot(page)).session.energy).toBe(carried.energy);
    if(i===0){await page.reload();await restored(page);expect((await snapshot(page)).session.carry).toEqual(carried.carry);}
    await go(page,'d',0,4,true);await interact(page,'garageToLobby');
    await expect.poll(async()=>(await snapshot(page)).session.delivered.length).toBe(i+1);
    expect((await snapshot(page)).session.carry).toEqual([]);
    if(i<2)await go(page,'a',0,-2,false);
  }
  const beforeLobby={human:humanLoads,lighting:lightingLoads};
  expect(beforeLobby.human).toBe(bootAssets.human+1); // The explicit reload, never a portal.
  await page.screenshot({path:info.outputPath('garage-delivered.png')});
  await interact(page,'garageToLobby');await expect(page.locator('#app')).toHaveAttribute('data-area','centerCityLobby');
  expect({human:humanLoads,lighting:lightingLoads}).toEqual(beforeLobby);
  // Walk to the elevator before checking in: it must remain locked.
  await go(page,'d',0,3,true);await go(page,'w',2,1.5,true);await interact(page,'lobbyToConferenceRoom');
  expect((await snapshot(page)).areaId).toBe('centerCityLobby');expect((await snapshot(page)).session.flags.securityChecked).toBe(false);
  await go(page,'s',2,-1.5,false);await go(page,'a',0,-3,false);await go(page,'w',2,-1.3,true);
  await interact(page,'security.check-in');await page.locator('#close-result').click();
  const checked=(await snapshot(page)).session;
  await interact(page,'security.check-in');await page.locator('#close-result').click();expect((await snapshot(page)).session.energy).toBe(checked.energy);
  await page.reload();await restored(page);expect((await snapshot(page)).session.flags.securityChecked).toBe(true);
  await go(page,'s',2,-1.5,false);await go(page,'d',0,3,true);await go(page,'w',2,1.5,true);
  const beforeLift={human:humanLoads,lighting:lightingLoads};
  await interact(page,'lobbyToConferenceRoom');await expect(page.locator('#app')).toHaveAttribute('data-area','centerCityConferenceRoom');
  expect({human:humanLoads,lighting:lightingLoads}).toEqual(beforeLift);
  await go(page,'a',0,-3,false);await go(page,'w',2,-.4,true);await interact(page,'conference.review-assignment');
  await page.locator('#close-result').click();
  const final=await snapshot(page);expect(final.session.energy).toBe(71);expect(final.session.loaded).toEqual([]);expect(final.session.carry).toEqual([]);
  expect(final.session.delivered).toHaveLength(3);expect(final.session.travel.clockMinutes).toBe(546);expect(final.session.flags.roomBrief).toBe(true);
  expect(Object.hasOwn(final.session.flags,'finished')).toBe(false);expect(final.supervisor?.joints).toBe(80);
  await page.reload();await restored(page);expect((await snapshot(page)).session).toEqual(final.session);
  await page.screenshot({path:info.outputPath('client-floor-ready.png')});
  expect(await page.evaluate(()=>localStorage.getItem('av-tech-rpg-save-v1'))).toBe(career);expect(errors).toEqual([]);
  await info.attach('arrival-checkpoint',{body:JSON.stringify(await snapshot(page),null,2),contentType:'application/json'});
  await page.context().storageState({path:info.outputPath('client-arrival-save.json')});
return {career,errors};
}
