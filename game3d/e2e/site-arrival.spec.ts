import {test} from '@playwright/test';
import {arriveAtClient} from './flows/site-arrival.ts';
// Keep exportable footage on the Linux production-browser runner. Windows
// Firefox recording teardown is tracked separately from gameplay assertions.
test.use({video:process.platform==='linux'?{mode:'on',size:{width:960,height:540}}:'off'});

test.afterEach(async({page},info)=>{
  if(page.isClosed())return;
  if(info.status!==info.expectedStatus){
    const state=await page.evaluate(()=>window.__AV3D__?.snapshot()).catch(()=>undefined);
    await info.attach('failure-state',{body:JSON.stringify(state??{unavailable:true}),contentType:'application/json'});
    await page.screenshot({path:info.outputPath('failure-before-cleanup.png'),timeout:5000}).catch(()=>{});
  }
  await page.goto('about:blank');
});

test('first workday arrival: fresh preparation, route, three deliveries, security and client floor',async({page},info)=>{
test.setTimeout(600000);await arriveAtClient(page,info);
});
