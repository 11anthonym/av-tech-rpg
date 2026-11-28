import {test} from '@playwright/test';
import {arriveAtClient} from './flows/site-arrival.ts';
import {completeWorkday} from './flows/complete-workday.ts';
import {diagnoseService} from './flows/service-diagnosis.ts';
import path from 'node:path';
test.use({video:process.platform==='linux'||process.env.RECORD_VIDEO==='1'?{mode:'on',size:{width:960,height:540}}:'off'});
test.afterEach(async({page},info)=>{
  if(page.isClosed())return;
  if(info.status!==info.expectedStatus){
    await page.context().storageState({path:info.outputPath('failure-browser-state.json')}).catch(()=>{});
    const state=await page.evaluate(()=>window.__AV3D__?.snapshot()).catch(()=>undefined);
    await info.attach('failure-state',{body:JSON.stringify(state??{unavailable:true}),contentType:'application/json'});
    await page.screenshot({path:info.outputPath('failure-before-cleanup.png'),timeout:5000}).catch(()=>{});
  }
  await page.goto('about:blank');
});

test('complete workday: ordinary input through both carts, closeout, rewards, return and a consequential next shift',async({page},info)=>{
  test.setTimeout(900000);
  const {career,errors}=await arriveAtClient(page,info);
  await completeWorkday(page,info,info.project.name==='firefox'?'rush':'tidy',career,errors,
    info.project.name==='chromium'?async()=>{
      await diagnoseService(page,info);
      // An ordinary-input earned checkpoint, shared by alternative service replays.
      await page.context().storageState({path:path.resolve('test-results/service-ready.json')});
    }:undefined);
});
