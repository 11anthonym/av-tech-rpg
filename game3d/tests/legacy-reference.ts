import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';

// Reuse the original game's established VM harness, before its test registry.
// Only presentation is stubbed. Rules, modifiers, rewards and recovery are real.
export function legacyReference(){
  const filename=fileURLToPath(new URL('../../scripts/qa-unit.js',import.meta.url));
  const context:any={require:createRequire(filename),__dirname:path.dirname(filename),console,URLSearchParams};vm.createContext(context);
  const prefix=fs.readFileSync(filename,'utf8').split('const tests = [];')[0]!;
  vm.runInContext(prefix+'\nglobalThis.reference={runGame,readGameJson,resetGameState};',context,{filename});
  const ref=context.reference as {runGame:(s:string)=>any;readGameJson:(s:string)=>any;resetGameState:()=>void};
  ref.resetGameState();
  ref.runGame(`showModal=()=>{};render=()=>{};notify=()=>{};showResults=()=>{};state.energy=71;state.clock='MON 9:06 AM';state.flags.tutorialInstallPressureSeed=173;`);
  return {...ref,readGameJson:(expression:string)=>JSON.parse(ref.runGame(`JSON.stringify(${expression})`))};
}
