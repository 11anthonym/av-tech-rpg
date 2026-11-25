import {expect} from '@playwright/test';
import type {Page,TestInfo} from '@playwright/test';
import {go,interact,snapshot,approach} from './shop-prep.ts';
import {restored} from './site-arrival.ts';
const close=(page:Page)=>page.locator('#close-result').click();

// Continue the fresh keyboard-played first day. No storage fixtures, teleport,
// reducer calls or state setters; observability only reads the live state.
export async function diagnoseService(page:Page,info:Pick<TestInfo,'outputPath'|'attach'>){
  const start=(await snapshot(page)).session;
  await go(page,'s',2,-3.6,false);await go(page,'d',0,0,true);await approach(page,'w','shop.inspect-workbench');
  await interact(page,'shop.inspect-workbench');await page.locator('button[data-action="service.prep-review"]').click();await close(page);
  await page.reload();await restored(page);expect((await snapshot(page)).session.service?.preparation).toBe('review');
  async function van(){
    await go(page,'s',2,-3.6,false);await go(page,'d',0,2.5,true);await go(page,'w',2,7.7,true);
    await go(page,'d',0,7.5,true);await go(page,'s',2,4.3,false);await interact(page,'shop.choose-route');
    await expect(page.locator('#app')).toHaveAttribute('data-area','serviceOffice');await close(page);
  }
  await van();expect((await snapshot(page)).supervisor?.visible).toBe(false);
  await go(page,'a',0,-3,false);await approach(page,'w','service-client');await interact(page,'service-client');await close(page);
  await interact(page,'service-client');await page.locator('button[data-action="client-symptom-timeline"]').click();await close(page);
  await go(page,'s',2,-3.8,false);await go(page,'d',0,4.7,true);await go(page,'w',2,2.8,true);await go(page,'a',0,2.3,false);
  await interact(page,'service-display');await expect(page.locator('#result-title')).toHaveText('Display failure pattern');
  await page.screenshot({path:info.outputPath('service-display-finding.png')});await close(page);
  await go(page,'d',0,4.7,true);await go(page,'s',2,-3.8,false);await go(page,'a',0,-4.8,false);
  await go(page,'w',2,1,true);await go(page,'d',0,-3,true);await approach(page,'w','service-room-pressure');
  await interact(page,'service-room-pressure');await expect(page.locator('#result-title')).toHaveText('Inline coupler path');
  await page.screenshot({path:info.outputPath('service-coupler-finding.png')});await close(page);
  await page.reload();await restored(page);const traced=(await snapshot(page)).session;
  expect(traced.service?.evidence.map(e=>e.id)).toContain('inline-coupler-path');
  await interact(page,'service-room-pressure');await close(page);expect((await snapshot(page)).session.energy).toBe(traced.energy);
  await go(page,'a',0,-4.8,false);await go(page,'s',2,-3.8,false);await go(page,'d',0,3.2,true);await approach(page,'w','service-pickup');
  await interact(page,'service-pickup');await expect(page.locator('#result-title')).toHaveText('Replacement kit condition');
  await page.screenshot({path:info.outputPath('service-kit-finding.png')});await close(page);
  const diagnosed=(await snapshot(page)).session;expect(diagnosed.service?.evidence).toHaveLength(4);
  expect(diagnosed.energy).toBe(start.energy-3);expect(diagnosed.career).toEqual(start.career);
  await go(page,'s',2,-4.5,false);await go(page,'a',0,0,false);await interact(page,'serviceOfficeToShop');await close(page);
  await page.reload();await restored(page);await van();
  expect({...((await snapshot(page)).session.service),history:[]}).toEqual({...diagnosed.service,history:[]});
  expect((await snapshot(page)).session.career).toEqual(start.career);
  await page.screenshot({path:info.outputPath('service-room-resumed.png')});
  await info.attach('service-diagnosis',{body:JSON.stringify(await snapshot(page),null,2),contentType:'application/json'});
  expect((await snapshot(page)).errors).toEqual([]);
}
