import {test,expect} from '@playwright/test';
import {arriveAtClient,restored} from './flows/site-arrival.ts';
import {go,interact,snapshot} from './flows/shop-prep.ts';
import {SAVE_KEY} from '../src/persistence/save.ts';
import type {Page} from '@playwright/test';

test.use({video:process.platform==='linux'||process.env.RECORD_VIDEO==='1'?{mode:'on',size:{width:960,height:540}}:'off'});
test.afterEach(async({page},info)=>{
  if(page.isClosed())return;
  if(info.status!==info.expectedStatus){
    const state=await page.evaluate(()=>window.__AV3D__?.snapshot()).catch(()=>undefined);
    await info.attach('failure-state',{body:JSON.stringify(state??{unavailable:true}),contentType:'application/json'});
    await page.screenshot({path:info.outputPath('failure-before-cleanup.png'),timeout:5000}).catch(()=>{});
  }
  await page.goto('about:blank');
});
async function stage(page:Page){await go(page,'s',2,-1.4,false);await go(page,'a',0,-4.7,false);}
async function order(page:Page){await go(page,'s',2,-1.4,false);await go(page,'d',0,-3,true);await go(page,'w',2,-.4,true);await interact(page,'conference.review-assignment');}
const close=(page:Page)=>page.locator('#close-result').click();
const choose=(page:Page,action:string)=>page.locator(`button[data-action="${action}"]`).click();

test('complete workday: ordinary input through both carts, closeout, rewards, return and a consequential next shift',async({page},info)=>{
  // This is the new full-day replay. The existing M3 240-second stress gate is unchanged.
  test.setTimeout(900000);
  const {career,errors}=await arriveAtClient(page,info);
  const finish=info.project.name==='firefox'?'rush':'tidy';
  for(let index=0;index<4;index++){
    if(index===2){
      await order(page);await expect(page.locator('button[data-action="pressure.leave"]')).toBeVisible();
      await page.screenshot({path:info.outputPath('pressure-decision.png')});await choose(page,'pressure.leave');await close(page);
      const response=(await snapshot(page)).session.workday.pressure;expect(response?.controlled).toBe(false);
      await page.reload();await restored(page);expect((await snapshot(page)).session.workday.pressure).toEqual(response);
    }
    await stage(page);await interact(page,'conference.pickup-part');
    const held=(await snapshot(page)).session.workday.carriedPart;expect(held).toBeTruthy();
    await expect.poll(async()=>(await snapshot(page)).character?.carryPoseError??1).toBeLessThan(.08);
    await page.keyboard.press('e');expect((await snapshot(page)).session.workday.carriedPart).toBe(held);
    if(index===0){await page.reload();await restored(page);expect((await snapshot(page)).session.workday.carriedPart).toBe(held);}
    const cart=index<2?1:2;
    await go(page,'d',0,cart===1?1:4,true);await go(page,'w',2,.5,true);
    await interact(page,cart===1?'install.cart1':'install.cart2');await close(page);
    const state=await snapshot(page);expect(state.session.workday.assembled).toHaveLength(index+1);
    expect(state.installation?.carts[cart-1]?.frame).toBe(true);
    if(index%2===1)expect(state.installation?.carts[cart-1]?.display).toBe(true);
    if(index===1)expect(state.supervisor?.visible).toBe(false);
    const energy=state.session.energy;await page.keyboard.press('e');expect((await snapshot(page)).session.energy).toBe(energy);
    if(index===1){await page.reload();await restored(page);expect((await snapshot(page)).supervisor?.visible).toBe(false);}
    await page.screenshot({path:info.outputPath(`installed-${index+1}.png`)});
  }
  await order(page);await choose(page,'conference.verify');await close(page);
  await page.reload();await restored(page);expect((await snapshot(page)).session.workday.verified).toBe(true);
  await interact(page,'conference.review-assignment');await page.screenshot({path:info.outputPath('closeout-decision.png')});
  await choose(page,`finish.${finish}`);await close(page);
  const paid=(await snapshot(page)).session;expect(paid.career.cash).toBe(finish==='tidy'?152:141);expect(paid.career.xp).toBe(40);
  await page.reload();await restored(page);expect((await snapshot(page)).session.career).toEqual(paid.career);
  await interact(page,'conference.review-assignment');await choose(page,'reward.drill');await close(page);
  await interact(page,'conference.review-assignment');await expect(page.locator('#decision-options button')).toHaveCount(0);await close(page);
  expect((await snapshot(page)).session.tools).toEqual(['screwdriver','drill']);
  await go(page,'s',2,-4.4,false);await go(page,'d',0,0,true);await interact(page,'centerCityConferenceRoomToShop');
  await expect(page.locator('#app')).toHaveAttribute('data-area','shop');expect((await snapshot(page)).supervisor?.visible).toBe(true);
  await go(page,'w',2,-1,true);await interact(page,'shop.inspect-workbench');
  await choose(page,'shift.clock-out');await page.screenshot({path:info.outputPath('shift-summary.png')});await close(page);
  await page.reload();await restored(page);
  const morning=(await snapshot(page)).session;expect(morning.career.shiftsCompleted).toBe(1);expect(morning.career.day).toBe(2);
  expect(morning.career.cash).toBe(paid.career.cash);expect(morning.career.xp).toBe(40);
  expect(morning.career.callbacks).toBe(finish==='rush'?1:0);expect(morning.career.risks.length).toBe(finish==='rush'?1:0);
  const saved=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)!),SAVE_KEY);expect(saved.version).toBe(4);
  await go(page,'s',2,-4,false);await go(page,'a',0,-5.5,false);await interact(page,'shop.brief-supervisor');
  await expect(page.locator('#result-copy')).toContainText(finish==='rush'?'rushed through closeout':'clean first-day handoff');
  await choose(page,'morning.accept');await page.screenshot({path:info.outputPath('later-shift-consequence.png')});await close(page);
  await page.reload();await restored(page);
  const final=(await snapshot(page)).session;
  expect(final.career.nextAssignment).toBe(finish==='rush'?'callbackCleanupDispatch':'serviceDispatch');
  expect(final.career.shiftsCompleted).toBe(1);expect(final.career.xp).toBe(40);expect(final.workday.assembled).toHaveLength(4);
  await info.attach('completed-day',{body:JSON.stringify(await snapshot(page),null,2),contentType:'application/json'});
  expect(await page.evaluate(()=>localStorage.getItem('av-tech-rpg-save-v1'))).toBe(career);expect(errors).toEqual([]);
  await page.getByRole('link',{name:'Original 2D career'}).click();await page.waitForFunction(()=>(window as Window&{AV_TECH_RPG_READY?:boolean}).AV_TECH_RPG_READY);
  expect(await page.evaluate(()=>localStorage.getItem('av-tech-rpg-save-v1'))).toBe(career);
  await page.getByRole('button',{name:'Continue Career',exact:true}).click();await expect(page.locator('#tech-name')).toContainText('Alex');
});
