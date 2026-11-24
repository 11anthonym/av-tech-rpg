import { expect } from "@playwright/test";
import type { Page, TestInfo } from "@playwright/test";
import type { Diagnostics } from "../../src/app.ts";
import { shopLoad } from "../../src/content/ids.ts";
export const snapshot = (page: Page): Promise<Diagnostics> => page.evaluate(() => window.__AV3D__!.snapshot());
export async function ready(page: Page) { await expect(page.locator("#app")).toHaveAttribute("data-ready","true",{timeout:30000}); }
export async function go(page: Page, key: string, axis: number, target: number, greater: boolean) {
  // Release each ordinary key hold before reading position. Waiting on an RAF
  // predicate with a key held let slow software rendering delay the key-up IPC
  // until after the player had walked beyond the waypoint into a nearby rack.
  // Bounded holds preserve collision and the original 30s movement deadline.
  await expect(async()=>{
    const value=(await snapshot(page)).position[axis]!;
    if(greater ? value>target : value<target)return;
    // Traverse open space efficiently, then use short holds for the final metre.
    // Every hold ends before another browser round trip, including under load.
    const distance=Math.abs(target-value);
    const delay=distance>1.5?Math.min(1500,(distance-1)/1.4*1000):200;
    await page.keyboard.press(key,{delay});
    const position=(await snapshot(page)).position[axis]!;
    expect(greater ? position>target : position<target).toBe(true);
  }).toPass({timeout:30000,intervals:[0]});
}
export async function interact(page: Page, actionId: string) {
  await expect.poll(async()=>(await snapshot(page)).actionId).toBe(actionId);
  await page.keyboard.press("e");
}
export async function prepareVan(page:Page,info:Pick<TestInfo,"outputPath"|"attach">,options:{wideApproach?:boolean}={}) {
  const errors:string[]=[]; page.on("pageerror",e=>errors.push(e.message));
  page.on("console",m=>{if(m.type()==="error") errors.push(m.text());});
  page.on("response",r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`);});
  await page.goto("./?debug=1"); await ready(page);
  expect((await snapshot(page)).supervisor).toMatchObject({meshes:5,joints:80,position:[-5,0,-1]});
  await page.locator("#debug-panel").evaluate(e=>e.setAttribute("hidden",""));
  await page.getByRole("button",{name:"Pause / settings"}).click();
  await page.getByRole("combobox",{name:"Graphics quality"}).selectOption("low");
  await page.getByRole("button",{name:"Resume",exact:true}).click();
  await go(page,"a",0,-5.5,false);
  await interact(page,"shop.brief-supervisor");
  await expect(page.getByRole("heading",{name:"We’re Already Late"})).toBeVisible();
  await page.screenshot({path:info.outputPath("supervisor-briefing.png")});
  await page.getByRole("button",{name:"Back to shop"}).click();
  await interact(page,"shop.brief-supervisor"); await page.getByRole("button",{name:"Back to shop"}).click();
  expect((await snapshot(page)).session.energy).toBe(100);
  await go(page,"d",0,options.wideApproach?2.5:-2.7,true); await go(page,"w",2,3.4,true); await go(page,"a",0,-5.5,false);
  for(let i=0;i<3;i++) {
    // Finish the approach using the same prompt a player sees. Slow browser
    // key-up delivery can leave a coarse waypoint just outside arm's reach.
    await page.keyboard.down('w');
    try {await page.waitForFunction(()=>window.__AV3D__!.snapshot().actionId==='shop.pickup-equipment',undefined,{timeout:15000});}
    finally {await page.keyboard.up('w');}
    await interact(page,"shop.pickup-equipment");
    await expect.poll(async()=>(await snapshot(page)).session.carry).toEqual([shopLoad[i]]);
    // Repeated pickup cannot duplicate a group or charge energy twice.
    await page.keyboard.press("e");
    const carried=await snapshot(page); expect(carried.session.energy).toBe(98-i*2);
    await expect.poll(async()=>(await snapshot(page)).character?.carryPoseError ?? 1).toBeLessThan(.08);
    expect(carried.cargo.filter(c=>c.place==="carried")).toHaveLength(1);
    await page.screenshot({path:info.outputPath(`carry-${i}.png`)});
    if(i===0) {
      await page.reload(); await ready(page);
      await page.locator("#debug-panel").evaluate(e=>e.setAttribute("hidden",""));
      expect((await snapshot(page)).session.carry).toEqual([shopLoad[0]]);
      expect((await snapshot(page)).session.energy).toBe(98);
    }
    if(options.wideApproach)await go(page,'d',0,2.5,true);
    else {await go(page,"d",0,-2.7,true); await go(page,"w",2,6.7,true); await go(page,"d",0,2.5,true);}
    await go(page,"w",2,7.7,true); await go(page,"d",0,5.8,true);
    await interact(page,"shop.load-van");
    expect((await snapshot(page)).position[1]).toBeCloseTo(.92,5);
    await expect.poll(async()=>(await snapshot(page)).session.loaded.length).toBe(i+1);
    expect((await snapshot(page)).session.carry).toEqual([]);
    await interact(page,"shop.load-van"); // Review is idempotent.
    await expect(page.getByRole("heading",{name:"Van #3 cargo"})).toBeVisible();
    await page.getByRole("button",{name:"Back to shop"}).click();
    await page.reload(); await ready(page);
    await page.locator("#debug-panel").evaluate(e=>e.setAttribute("hidden",""));
    expect((await snapshot(page)).session.loaded).toEqual(shopLoad.slice(0,i+1));
    if(i<2) {
      await go(page,"a",0,2.5,false);
      if(!options.wideApproach){await go(page,"s",2,6.7,false); await go(page,"a",0,-2.7,false);}
      await go(page,"s",2,3.4,false); await go(page,"a",0,-5.5,false);
    }
  }
  await expect(page.locator("#objective")).toContainText("ready for Center City East");
  const final=await snapshot(page);
  expect(final.session.loaded).toEqual([...shopLoad]); expect(final.session.energy).toBe(94);
  expect(final.cargo.every(c=>c.place==="loaded")).toBe(true);
  expect(final.session.tools).toEqual(["screwdriver"]); expect(final.errors).toEqual([]); expect(errors).toEqual([]);
  // A delayed key release can leave the player against the back wall. Walk
  // into the open aisle before testing camera recovery; retraction at that
  // wall is correct, not a failure to restore opacity.
  await go(page,'s',2,7.2,false);await go(page,'a',0,2.5,false);
  await page.mouse.move(900,400); await page.mouse.down(); await page.mouse.move(540,400,{steps:16}); await page.mouse.up();
  await page.waitForFunction(()=>window.__AV3D__!.snapshot().camera.yaw>1.7 && window.__AV3D__!.snapshot().character?.opacity===1);
  await page.screenshot({path:info.outputPath("van-ready.png")});
  await page.context().storageState({path:info.outputPath("saved-session.json")});
  await info.attach("shop-checkpoints",{body:JSON.stringify(final,null,2),contentType:"application/json"});
  return final;
}
