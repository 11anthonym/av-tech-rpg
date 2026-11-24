import test from 'node:test';
import assert from 'node:assert/strict';
import {newSession,resolveAction,describeAction} from '../src/domain/session.ts';
import type {Session} from '../src/domain/session.ts';
import type {ActionId} from '../src/content/ids.ts';
import {workdayContent} from '../src/content/workday.ts';
import {pressureDefinition,seededUnit,canUseWorkaround,getShiftPrepSkillBonus} from '../src/domain/workday.ts';
import {freshSave,parseSave,SaveRepository,SAVE_KEY,M4A_SAVE_KEY} from '../src/persistence/save.ts';
import {getArea} from '../src/world/areas.ts';
import {legacyReference} from './legacy-reference.ts';

const act=(s:Session,id:ActionId)=>resolveAction(s,id).state;
function arrival(seed=173,route:'route.garageRoute'|'route.loadingZoneGamble'|'route.circleForCurb'='route.garageRoute'){let s=newSession();s.travel.seed=seed;s=act(s,'shop.brief-supervisor');
  for(let i=0;i<3;i++){s=act(s,'shop.pickup-equipment');s=act(s,'shop.load-van');}
  for(const id of [route,'garage.brief-supervisor'] as const)s=act(s,id);
  for(let i=0;i<3;i++){s=act(s,'garage.unload-equipment');s=act(s,'garageToLobby');}
  for(const id of ['garageToLobby','security.check-in','lobbyToConferenceRoom','conference.review-assignment'] as const)s=act(s,id);
  return s;
}
function checkpoint(s:Session){return parseSave(JSON.stringify({...freshSave(),session:s,position:getArea(s.areaId).spawn})).session;}
function assemble(s:Session,response:'careful'|'quick'|'leave'='leave'){
  for(let i=0;i<4;i++){
    if(i===2){const p=pressureDefinition(s);s=act(s,`pressure.${response==='careful'?p.carefulOption.id:response==='quick'?p.quickOption.id:'leave'}` as ActionId);}
    s=act(s,'conference.pickup-part');s=act(s,i<2?'install.cart1':'install.cart2');
  }
  return act(s,'conference.verify');
}
function close(s:Session,finish:'tidy'|'rush'='rush'){
  s=act(s,`finish.${finish}`);s=act(s,'reward.drill');return act(s,'centerCityConferenceRoomToShop');
}

test('generated install content matches canonical IDs, pressures, tools and requirements',()=>{
  const ref=legacyReference();
  assert.deepEqual(JSON.parse(JSON.stringify(workdayContent.assembly)),ref.readGameJson('content.tutorial.assembly'));
  assert.deepEqual(JSON.parse(JSON.stringify(workdayContent.installPressures)),ref.readGameJson('content.tutorial.installPressures'));
  assert.deepEqual(workdayContent.rewardTools.map(t=>t.id),ref.readGameJson('content.tutorial.rewardTools'));
});

test('physical components require the briefing, free hands, correct cart and frame-before-display order',()=>{
  let s=arrival();const initial=structuredClone(s);
  for(const id of ['install.cart1','conference.verify','finish.rush','centerCityConferenceRoomToShop','pressure.leave'] as const)assert.equal(act(s,id),s,id);
  s=act(s,'conference.pickup-part');assert.equal(s.workday.carriedPart,'cart-1-frame');
  assert.equal(act(s,'conference.pickup-part'),s);assert.equal(act(s,'install.cart2'),s);
  s=act(s,'install.cart1');assert.equal(s.energy,61);assert.deepEqual(s.workday.assembled,['cart-1-frame']);
  assert.equal(act(s,'install.cart1'),s);s=checkpoint(s);
  s=act(act(s,'conference.pickup-part'),'install.cart1');assert.equal(s.flags.supervisorLeft,true);
  assert.equal(act(s,'conference.pickup-part'),s); // handle the newly discovered pressure first
  assert.equal(resolveAction(s,'conference.review-assignment').event.choices?.length,3);
  assert.deepEqual(initial,arrival());
});

test('cart checks, pressure responses and closeout numerics agree with the actual 2D reducers',()=>{
  for(const seed of [1,4,7,11,173])for(const response of ['careful','quick','leave'] as const)for(const finish of ['tidy','rush'] as const){
    let s=arrival(seed);const ref=legacyReference();ref.runGame(`state.flags.tutorialInstallPressureSeed=${seed};`);
    for(let i=0;i<4;i++){
      if(i===2){const p=pressureDefinition(s),choice=response==='careful'?p.carefulOption.id:response==='quick'?p.quickOption.id:'leave';
        s=act(s,`pressure.${choice}` as ActionId);
        const roll=seededUnit(seed,`${p.id}:quick`);
        ref.runGame(`resolveTutorialInstallPressureResponse(${JSON.stringify(p.id)},${JSON.stringify(choice)},${roll});`);
      }
      const part=workdayContent.assembly[i]!;s=act(act(s,'conference.pickup-part'),i<2?'install.cart1':'install.cart2');
      ref.runGame(`getInteractions().find(item=>item.label==='Pick up next cart component').action();installCartPart(${JSON.stringify(part.destination)});`);
      assert.equal(s.energy,ref.readGameJson('state.energy'),`${seed}/${response}/${part.id}`);
      assert.equal(s.workday.checks[i]!.score,ref.readGameJson(`state.flags.skillChecks['cart-${part.id}'].score`));
      assert.equal(s.workday.checks[i]!.difficulty,ref.readGameJson(`state.flags.skillChecks['cart-${part.id}'].difficulty`));
      s=checkpoint(s);
    }
    s=act(act(s,'conference.verify'),`finish.${finish}`);ref.runGame(`finishJob('${finish}');`);
    const old=ref.readGameJson('({cash:state.cash,xp:state.xp,reputation:state.reputation,energy:state.energy,burnout:state.burnout,callbacks:state.stats.callbacks,overtimeDays:state.stats.overtimeDays})');
    assert.deepEqual({cash:s.career.cash,xp:s.career.xp,reputation:s.career.reputation,energy:s.energy,burnout:s.burnout,callbacks:s.career.callbacks,overtimeDays:s.career.overtimeDays},old,`${seed}/${response}/${finish}`);
    s=checkpoint(s);assert.equal(act(s,`finish.${finish}`),s);
  }
});

test('quick fixes can succeed; competence/tools permit a clean fast closeout; the workaround is conditional',()=>{
  const seeds=Array.from({length:100},(_,i)=>i+1);
  for(const incident of [false,true]){
    const seed=seeds.find(seed=>{const s=arrival(seed),p=pressureDefinition(s);return (seededUnit(seed,`${p.id}:quick`)<p.quickOption.incidentChance)===incident;})!;
    let s=arrival(seed);s.career.installSkill=5;s.tools.push('drill');
    s=assemble(s,'quick');assert.equal(s.workday.pressure!.incident,incident);
    const before=structuredClone(s),rush=act(s,'finish.rush'),tidy=act(before,'finish.tidy');
    assert.equal(rush.energy-before.energy,-4);assert.equal(tidy.energy-before.energy,-13);
    assert.equal(rush.career.callbacks,incident?1:0);assert.equal(tidy.career.callbacks,0);
    assert.equal(rush.career.cash,141);assert.equal(tidy.career.cash,152);
    assert.equal(canUseWorkaround(before),false);assert.equal(act(before,'finish.wiley-workaround'),before);
    before.career.traits.push('makeThatWork');before.career.improvisation=4;
    assert(canUseWorkaround(before));const workaround=act(before,'finish.wiley-workaround');
    assert.equal(workaround.energy,before.energy-2);assert.equal(workaround.career.callbacks,1);
    assert.equal(workaround.career.risks[0]!.id,'usedTemporaryAdapterPermanently');
  }
});

test('one complete day reloads, pays/rewards exactly once and changes the following briefing and opportunity',()=>{
  for(const finish of ['tidy','rush'] as const){let s=close(assemble(arrival()),finish);s=checkpoint(s);
    assert.equal(s.areaId,'shop');assert.equal(s.career.xp,40);assert.deepEqual(s.tools,['screwdriver','drill']);
    for(const id of ['finish.tidy','finish.rush','reward.drill','shop.pickup-equipment','shop.load-van','shop.choose-route'] as const)assert.equal(act(s,id),s,id);
    assert(describeAction(s,'shop.inspect-workbench').available);
    s=act(s,'shift.clock-out');s=checkpoint(s);const summary=structuredClone(s.career.shiftSummary);
    assert.equal(s.career.shiftsCompleted,1);assert.equal(s.career.day,2);assert.equal(act(s,'shift.clock-out'),s);
    const briefing=resolveAction(s,'shop.brief-supervisor');
    assert.match(briefing.event.message,finish==='rush'?/left unresolved.*rushed/:/clean first-day handoff/);
    s=checkpoint(act(s,'morning.accept'));assert.equal(act(s,'morning.accept'),s);
    assert.equal(s.career.nextAssignment,finish==='rush'?'callbackCleanupDispatch':'serviceDispatch');
    assert.deepEqual(s.career.shiftSummary,summary);assert.equal(s.career.xp,40);assert.equal(s.career.cash,finish==='tidy'?152:141);
    assert.equal(s.workday.assembled.length,4);assert.equal(s.carry.length+s.loaded.length,0);assert.equal(s.delivered.length,3);
  }
});

test('overnight recovery, stayed-late fatigue and skipped-day costs match the legacy shift rules',()=>{
  for(const choice of ['clock-out','prep','recovery-day'] as const){const start=close(assemble(arrival(),'careful'),'tidy');
    const ref=legacyReference();ref.runGame(`state.energy=${start.energy};state.burnout=${start.burnout};state.cash=${start.career.cash};state.xp=${start.career.xp};state.reputation=${JSON.stringify(start.career.reputation)};state.flags.finished=true;state.flags.reward='drill';state.sceneId='shop';state.flags.currentAreaId='shop';state.flags.endShiftPending=true;state.flags.endShiftSource='Two Quick Carts';completeShift('${choice}');`);
    const next=checkpoint(act(start,`shift.${choice}`));
    assert.equal(next.energy,ref.readGameJson('state.energy'),choice);assert.equal(next.burnout,ref.readGameJson('state.burnout'),choice);
    assert.deepEqual(next.career.reputation,ref.readGameJson('state.reputation'),choice);
    assert.equal(next.career.callbacks,ref.readGameJson('state.stats.callbacks'),choice);
    for(const key of ['stayLatePrepDays','recoveryDays','overnightRests'] as const)assert.equal(next.career[key],ref.readGameJson(`state.stats.${key}`),`${choice}/${key}`);
    assert.equal(next.career.nextShiftPrep,ref.readGameJson('Boolean(state.flags.shiftPrepActive)'),choice);
    for(const skill of ['documentation','fieldcraft','installation'])assert.equal(getShiftPrepSkillBonus(next,skill),ref.readGameJson(`getShiftPrepSkillBonus('${skill}')`),`${choice}/${skill}`);
    if(choice==='prep')assert.equal(next.career.risks[0]!.id,'exhaustion-service');
    assert.equal(next.career.fatigue,choice==='prep'?56:0);
    assert.equal(next.career.day,choice==='recovery-day'?3:2);
  }
});

test('shift previews show exhaustion costs without changing the saved career',()=>{
  const s=close(assemble(arrival(),'careful'),'tidy'),before=structuredClone(s),menu=resolveAction(s,'shop.inspect-workbench');
  assert.equal(menu.state,s);assert.deepEqual(s,before);
  const preview=menu.event.choices!.find(choice=>choice.actionId==='shift.prep')!.detail;
  const actual=act(s,'shift.prep');assert.match(preview,new RegExp(`morning energy ${actual.energy}`));
  assert.match(preview,/Overexertion adds a callback/);
});

test('every route can complete a saved workday even when overnight recovery removes route burnout',()=>{
  for(const route of ['route.garageRoute','route.loadingZoneGamble','route.circleForCurb'] as const){
    const first=arrival(173,route);let s=close(assemble(first,'careful'),'rush');
    s=checkpoint(act(s,'shift.clock-out'));s=checkpoint(act(s,'morning.accept'));
    assert.equal(s.career.day,2);assert.equal(s.career.xp,40);assert.equal(s.career.cash,141);
    assert.deepEqual(s.travel.route,first.travel.route);
    assert.equal(s.burnout,0);assert.equal(s.travel.clockMinutes,438);
  }
});

test('v3 arrival migration preserves all old bytes and rejects damaged v4 rewards, inventory and phase clocks',()=>{
  const original=arrival(),old={...freshSave(),version:3,session:structuredClone(original),position:getArea(original.areaId).spawn};
  delete (old.session as any).career;delete (old.session as any).workday;
  const bytes=JSON.stringify(old),values=new Map([[M4A_SAVE_KEY,bytes],['av-tech-rpg-save-v1','legacy career bytes']]);
  const repo=new SaveRepository({getItem:key=>values.get(key)??null,setItem:(key,value)=>{values.set(key,value);}});
  assert(repo.save(repo.load().data));assert.equal(values.get(M4A_SAVE_KEY),bytes);assert.equal(values.get('av-tech-rpg-save-v1'),'legacy career bytes');
  assert.equal(JSON.parse(values.get(SAVE_KEY)!).version,4);
  const complete=close(assemble(original),'rush');
  for(const damage of [(s:Session)=>s.career.cash++,(s:Session)=>s.workday.assembled.push('cart-1-frame'),
    (s:Session)=>{s.workday.carriedPart='cart-1-frame';},(s:Session)=>{s.career.nextAssignment='serviceDispatch';},
    (s:Session)=>{s.flags.supervisorLeft=false;},(s:Session)=>s.travel.clockMinutes++]){
    const bad=structuredClone(complete);damage(bad);assert.throws(()=>checkpoint(bad));
  }
});
