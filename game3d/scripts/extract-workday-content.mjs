// Small audited bridge to canonical 2D content; no runtime dependency on window.
import fs from 'node:fs/promises';
import vm from 'node:vm';
const context={window:{}};vm.createContext(context);
vm.runInContext(await fs.readFile(new URL('../../src/content/data.js',import.meta.url),'utf8'),context);
const c=context.window.GAME_CONTENT;
const data={assembly:c.tutorial.assembly,installPressures:c.tutorial.installPressures,
  rewardTools:c.tutorial.rewardTools.map(id=>c.tools[id])};
await fs.writeFile(new URL('../src/content/workday.ts',import.meta.url),
  '// Generated from src/content/data.js by scripts/extract-workday-content.mjs.\nexport const workdayContent = '+JSON.stringify(data,null,2)+' as const;\n');
