import { test, expect } from "@playwright/test";
import type { Page } from "@playwright/test";
import type { Diagnostics } from "../src/app.ts";
import { shopLoad } from "../src/content/ids.ts";
const snapshot = (page: Page): Promise<Diagnostics> => page.evaluate(() => window.__AV3D__!.snapshot());
async function ready(page: Page) { await expect(page.locator("#app")).toHaveAttribute("data-ready","true",{timeout:30000}); }
async function go(page: Page, key: string, axis: number, target: number, greater: boolean) {
  await page.keyboard.down(key);
  try { await page.waitForFunction(({axis,target,greater}) => {
    const value=window.__AV3D__!.snapshot().position[axis]!; return greater ? value>target : value<target;
  },{axis,target,greater},{timeout:30000}); } finally { await page.keyboard.up(key); }
}
async function interact(page: Page, actionId: string) {
  await expect.poll(async()=>(await snapshot(page)).actionId).toBe(actionId);
  await page.keyboard.press("e");
}
test.afterEach(async({page})=>{ if(!page.isClosed()) await page.goto("about:blank"); });

test("first shift: brief, three physical carry/load trips, constraints and reload checkpoints", async({page},info)=>{
  test.setTimeout(240000);
  const errors:string[]=[]; page.on("pageerror",e=>errors.push(e.message));
  page.on("console",m=>{if(m.type()==="error") errors.push(m.text());});
  page.on("response",r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`);});
  await page.goto("./?debug=1"); await ready(page);
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
  await go(page,"d",0,-2,true); await go(page,"w",2,3.4,true); await go(page,"a",0,-5.5,false);
  for(let i=0;i<3;i++) {
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
    await go(page,"d",0,-2,true); await go(page,"w",2,6.7,true); await go(page,"d",0,2.5,true);
    await go(page,"w",2,7.7,true); await go(page,"d",0,5.8,true);
    await interact(page,"shop.load-van");
    await expect.poll(async()=>(await snapshot(page)).session.loaded.length).toBe(i+1);
    expect((await snapshot(page)).session.carry).toEqual([]);
    await interact(page,"shop.load-van"); // Review is idempotent.
    await expect(page.getByRole("heading",{name:"Van #3 cargo"})).toBeVisible();
    await page.getByRole("button",{name:"Back to shop"}).click();
    await page.reload(); await ready(page);
    await page.locator("#debug-panel").evaluate(e=>e.setAttribute("hidden",""));
    expect((await snapshot(page)).session.loaded).toEqual(shopLoad.slice(0,i+1));
    if(i<2) {
      await go(page,"a",0,2.5,false); await go(page,"s",2,6.7,false); await go(page,"a",0,-2,false);
      await go(page,"s",2,3.4,false); await go(page,"a",0,-5.5,false);
    }
  }
  await expect(page.locator("#objective")).toContainText("ready for Center City East");
  const final=await snapshot(page);
  expect(final.session.loaded).toEqual([...shopLoad]); expect(final.session.energy).toBe(94);
  expect(final.cargo.every(c=>c.place==="loaded")).toBe(true);
  expect(final.session.tools).toEqual(["screwdriver"]); expect(final.errors).toEqual([]); expect(errors).toEqual([]);
  await page.mouse.move(900,400); await page.mouse.down(); await page.mouse.move(272,400,{steps:16}); await page.mouse.up();
  await page.waitForFunction(()=>Math.abs(window.__AV3D__!.snapshot().camera.yaw)>3);
  await page.screenshot({path:info.outputPath("van-ready.png")});
  await info.attach("shop-checkpoints",{body:JSON.stringify(final,null,2),contentType:"application/json"});
});
