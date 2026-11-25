// Audited subset of the original service call; no browser globals at runtime.
import fs from 'node:fs/promises';
import vm from 'node:vm';
const context={window:{}};vm.createContext(context);
vm.runInContext(await fs.readFile(new URL('../../src/content/data.js',import.meta.url),'utf8'),context);
const c=context.window.GAME_CONTENT, s=c.serviceDispatch;
const data={title:s.title,summary:s.summary,appointment:s.appointment,diagnosticEvidence:s.diagnosticEvidence,
  roomConditions:s.roomConditions,repairApproaches:s.repairApproaches,route:c.world.routes.conshohockenService};
await fs.writeFile(new URL('../src/content/service.ts',import.meta.url),
  '// Generated from src/content/data.js by scripts/extract-service-content.mjs.\nexport const serviceContent = '+JSON.stringify(data,null,2)+' as const;\n');
