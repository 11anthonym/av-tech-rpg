// Audited subset of the original service call; no browser globals at runtime.
import fs from 'node:fs/promises';
import vm from 'node:vm';
const context={window:{}};vm.createContext(context);
vm.runInContext(await fs.readFile(new URL('../../src/content/data.js',import.meta.url),'utf8'),context);
const c=context.window.GAME_CONTENT, s=c.serviceDispatch;
const source=await fs.readFile(new URL('../../src/systems/service-dispatch-system.js',import.meta.url),'utf8');
for(const name of ['getServiceQuickResponseOption','getServiceConditionResponseOptions','getServiceIncidentRecoveryOptions']){
  const start=source.indexOf(`function ${name}(`),end=source.indexOf('\nfunction ',start+1);
  vm.runInContext(source.slice(start,end<0?undefined:end),context);
}
const data={title:s.title,summary:s.summary,appointment:s.appointment,diagnosticEvidence:s.diagnosticEvidence,
  roomConditions:s.roomConditions,repairApproaches:s.repairApproaches,route:c.world.routes.conshohockenService,
  checks:s.checks,swapItems:s.swapItems,finalVerification:s.finalVerification,
  baseSkills:c.technicians[0].characterStats,traitContextBonuses:c.traitContextBonuses,
  tools:Object.fromEntries(['screwdriver','toolBag','drill','handTruck'].map(id=>[id,c.tools[id]])),
  responses:Object.fromEntries(s.roomConditions.map(condition=>[condition.id,context.getServiceConditionResponseOptions(condition)])),
  recoveries:{ordinary:context.getServiceIncidentRecoveryOptions({conditionId:'room',conditionLabel:'The room incident'}),
    final:context.getServiceIncidentRecoveryOptions({conditionId:'final-verification'})}};
await fs.writeFile(new URL('../src/content/service.ts',import.meta.url),
  '// Generated from src/content/data.js and service-dispatch-system.js by scripts/extract-service-content.mjs.\nexport const serviceContent = '+JSON.stringify(data,null,2)+' as const;\n');
