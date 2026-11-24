import { test } from "@playwright/test";
import { prepareVan } from "./flows/shop-prep.ts";
test.afterEach(async({page},info)=>{
  if(page.isClosed()) return;
  // Preserve the failing game before stopping WebGL. The automatic screenshot
  // runs later; navigating first can erase the scene and its diagnostics.
  if(info.status!==info.expectedStatus) {
    const state=await page.evaluate(()=>window.__AV3D__?.snapshot()).catch(()=>undefined);
    await info.attach("failure-state",{body:JSON.stringify(state??{unavailable:true}),contentType:"application/json"});
    await page.screenshot({path:info.outputPath("failure-before-cleanup.png"),timeout:5000}).catch(()=>{});
  }
  await page.goto("about:blank");
});

test("first shift: brief, three physical carry/load trips, constraints and reload checkpoints", async({page},info)=>{
  test.setTimeout(240000);
  await prepareVan(page,info);
});
