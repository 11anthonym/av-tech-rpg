import test from 'node:test';
import assert from 'node:assert/strict';
import {morning} from './first-shift.ts';
import {resolveAction,describeAction} from '../src/domain/session.ts';
import type {Session} from '../src/domain/session.ts';
import type {ActionId} from '../src/content/ids.ts';
import {serviceContent as content} from '../src/content/service.ts';
import {knownServiceConditions,serviceConditions,serviceClock,validService} from '../src/domain/service.ts';
import {controlled,methodStatus,responseOptions} from '../src/domain/service-rules.ts';
import {freshSave,parseSave,SaveRepository,SAVE_KEY,M5A_SAVE_KEY} from '../src/persistence/save.ts';
import {getArea} from '../src/world/areas.ts';
import {legacyReference} from './legacy-reference.ts';

function checkpoint(s:Session){return parseSave(JSON.stringify({...freshSave(),session:s,position:getArea(s.areaId).spawn})).session;}
function act(s:Session,id:ActionId){const r=resolveAction(s,id);assert.notEqual(r.event.outcome,'blocked',`${id}: ${r.event.message}`);return checkpoint(r.state);}
function room(seed=173){let s=morning('tidy',seed);for(const id of ['service.prep-review','service.depart','service-client','client-symptom-timeline','service-display','service-room-pressure','service-pickup'] as const)s=act(s,id);return s;}
function install(s:Session){for(let i=0;i<2;i++){s=act(s,'service.take-item');assert.equal(resolveAction(s,'service.take-item').state,s);assert.equal(resolveAction(s,'serviceOfficeToShop').state,s);s=act(s,'service.install');assert.equal(resolveAction(s,'service.install').state,s);}return s;}
function handlePressure(s:Session){for(const c of knownServiceConditions(s))if(!controlled(s,c.id)&&!s.service!.responses.some(r=>r.conditionId===c.id))s=act(s,`service.response.${c.id}.${responseOptions(c.id)[0]!.id}`);return s;}
function recover(s:Session,choice='stabilize'){for(let i=0;i<s.service!.incidents.length;i++)if(!s.service!.incidents[i]!.recovery)s=act(s,`service.recover.${i}.${choice}`);return s;}

test('repair definitions, response and recovery costs come directly from the original rules',()=>{
  const ref=legacyReference();for(const key of ['checks','swapItems','finalVerification'] as const)assert.deepEqual(JSON.parse(JSON.stringify(content[key])),ref.readGameJson(`content.serviceDispatch.${key}`));
  for(const condition of content.roomConditions)assert.deepEqual(JSON.parse(JSON.stringify(responseOptions(condition.id))),ref.readGameJson(`getServiceConditionResponseOptions(getServiceRoomConditionById('${condition.id}'))`));
});

test('paid negotiated, hardware and unresolved replays retain actual 2D clock, check, energy, pay and XP behavior',()=>{
  for(const method of ['negotiate-verification-window','stage-clean-swap'] as const)for(const final of ['full','skip'] as const){
    let s=room();const ref=legacyReference(),start=structuredClone(s);
    ref.runGame(`Object.assign(state,createInitialState());state.technician={...content.technicians[0],characterStats:${JSON.stringify({...content.baseSkills,install:s.career.installSkill})},traits:${JSON.stringify(s.career.traits)}};state.tools=${JSON.stringify(s.tools)};state.sceneId='serviceOffice';state.clock='TUE 10:49 AM';state.energy=${s.energy};state.burnout=${s.burnout};state.flags.currentAreaId='serviceOffice';state.flags.serviceBrief=true;state.flags.serviceInspected=true;state.flags.serviceClientContext=true;state.flags.servicePreparation='review';state.flags.serviceRoomSeed=${s.travel.seed};state.flags.serviceRoomConditions=${JSON.stringify(serviceConditions(s).map(c=>c.id))};state.flags.serviceKnownRoomConditions=${JSON.stringify(knownServiceConditions(s).map(c=>c.id))};state.flags.serviceDiagnosticEvidence=${JSON.stringify(s.service!.evidence.map(e=>({id:e.id,source:'normal room inspection',clock:'TUE 10:49 AM'})))};`);
    function compare(){assert.equal(s.energy,ref.runGame('state.energy'),`${method}/${final} energy: ${JSON.stringify({ours:s.service!.checks,legacy:ref.readGameJson('state.flags.fieldTaskResults || {}')})}`);assert.equal(serviceClock(s),ref.runGame('getServiceClockMinutes()'),`${method}/${final} clock`);}
    s=act(s,`service.method.${method}`);ref.runGame(`chooseServiceRepairMethod('${method}')`);compare();
    for(const c of knownServiceConditions(s))if(!controlled(s,c.id)&&!s.service!.responses.some(r=>r.conditionId===c.id)){
      const option=responseOptions(c.id)[0]!.id;s=act(s,`service.response.${c.id}.${option}`);ref.runGame(`resolveServiceConditionResponse('${c.id}','${option}')`);compare();
    }
    for(let i=0;i<2;i++){
      s=act(s,'service.take-item');ref.runGame('pickUpServiceReplacementGear()');compare();
      s=act(s,'service.install');ref.runGame('installServicePart()');compare();
      const expected=ref.readGameJson(`Object.values(state.flags.fieldTaskResults).find(c=>c.id==='${s.service!.checks.at(-1)!.id}')`),actual=s.service!.checks.at(-1)!;
      assert.deepEqual({successful:actual.successful,difficulty:actual.difficulty,energyCost:actual.energyCost},{successful:expected.successful,difficulty:expected.difficulty,energyCost:expected.energyCost});
    }
    s=act(s,`service.test.${final}`);ref.runGame(`resolveServiceFinalVerification('${final}')`);compare();
    for(let i=0;i<s.service!.incidents.length;i++)if(!s.service!.incidents[i]!.recovery){s=act(s,`service.recover.${i}.stabilize`);ref.runGame(`resolveServiceIncidentRecovery(getServiceRoomIncidentId(getServiceRoomIncidentEntries()[${i}],${i}),'stabilize')`);compare();}
    s=act(s,'service.closeout');ref.runGame('showServiceResults()');compare();
    assert.equal(s.career.cash-start.career.cash,ref.runGame('state.cash'));assert.equal(s.career.xp-start.career.xp,ref.runGame('state.xp'));
  }
});

test('three equivalent starting careers produce distinct paid repairs and persistent follow-up causes',()=>{
  const base=room(),cash=base.career.cash,xp=base.career.xp;
  let careful=act(base,'service.method.negotiate-verification-window');careful=handlePressure(careful);careful=install(careful);careful=act(careful,'service.test.full');careful=recover(careful);careful=act(careful,'service.closeout');
  let hardware=act(base,'service.method.stage-clean-swap');hardware=handlePressure(hardware);hardware=install(hardware);hardware=act(hardware,'service.test.full');hardware=recover(hardware);hardware=act(hardware,'service.closeout');
  let unresolved=act(base,'service.method.negotiate-verification-window');unresolved=install(unresolved);unresolved=act(unresolved,'service.test.skip');unresolved=recover(unresolved,'carry');unresolved=act(unresolved,'service.closeout');
  for(let s of [careful,hardware,unresolved]){
    assert.equal(s.career.cash,cash+96);assert.equal(s.career.xp,xp+s.service!.closeout!.xp);assert.equal(s.service!.installed.length,2);assert.equal(s.service!.carried,null);
    for(const id of ['service.closeout','service.take-item','service.install','service.test.full','service.method.ticket-swap'] as const)assert.equal(resolveAction(s,id).state,s);
    s=act(s,'serviceOfficeToShop');const report=resolveAction(s,'shop.inspect-workbench').event.message;assert.match(report,/Service|Paid/);assert.equal(checkpoint(s).career.cash,cash+96);
    assert.equal(describeAction(s,'service.depart').available,false);assert.equal(s.career.shiftsCompleted,1,'Service handoff must not double-close the first shift');
  }
  assert.equal(careful.service!.closeout!.risky,false);assert.equal(hardware.service!.closeout!.risky,false);assert.equal(unresolved.service!.closeout!.risky,true);
  assert.equal(unresolved.career.nextAssignment,'callbackCleanupDispatch');assert.match(unresolved.career.risks.at(-1)!.cause,/skipped/);
  assert.notEqual(serviceClock(careful),serviceClock(hardware));assert.notEqual(careful.energy,hardware.energy);assert.notDeepEqual(careful.career.reputation,unresolved.career.reputation);
  assert.match(resolveAction(act(unresolved,'serviceOfficeToShop'),'shop.brief-supervisor').event.message,/callback cleanup.*saved cause/);
});

test('skills, tool ownership and discovered evidence gate methods without silently substituting choices',()=>{
  const s=room();assert.equal(methodStatus(s,content.repairApproaches.find(m=>m.id==='isolate-coupler')!).available,false);
  assert.equal(methodStatus(s,content.repairApproaches.find(m=>m.id==='stage-clean-swap')!).available,true);
  assert.equal(resolveAction(s,'service.method.isolate-coupler').state,s);assert.equal(resolveAction(s,'service.method.invented').state,s);
  let t=act(s,'service.method.ticket-swap');assert.equal(resolveAction(t,'service.method.verify-path').state,t);assert.equal(resolveAction(t,'service.test.full').state,t);
  t=act(t,'service.take-item');const energy=t.energy;t=act(t,'service.put-item');assert.equal(t.energy,energy);assert.equal(t.service!.installed.length,0);
});

test('every deterministic room pressure can be recovered, or honestly documented, without rerolling on reload',()=>{
  for(const seed of [1,2,3,173,888]){
    let s=act(room(seed),'service.method.ticket-swap');
    for(const c of knownServiceConditions(s))if(!controlled(s,c.id)){
      const quick=responseOptions(c.id).find(o=>o.incidentChance);if(quick){s=act(s,`service.response.${c.id}.${quick.id}`);const copy=checkpoint(s);assert.deepEqual(copy.service,s.service);assert.equal(resolveAction(copy,`service.response.${c.id}.${quick.id}`).state,copy);}
    }
    s=install(s);s=act(s,'service.test.full');s=recover(s);s=act(s,'service.closeout');assert.equal(validService(s),true);
  }
});

test('action replay rejects forged payouts, equipment, costs, history, risk causes and archived careers',()=>{
  let s=install(act(room(),'service.method.stage-clean-swap'));s=act(s,'service.test.skip');s=recover(s);s=act(s,'service.closeout');
  for(const corrupt of [
    {...s,career:{...s.career,cash:s.career.cash+96}}, {...s,energy:s.energy+1},
    {...s,service:{...s.service,installed:[]}}, {...s,service:{...s.service,history:[...s.service!.history,'service.closeout']}},
    {...s,service:{...s.service,closeout:{...s.service!.closeout,cause:'invented'}}},
    {...s,service:{...s.service,baseline:{...s.service!.baseline,career:{...s.service!.baseline.career,cash:9999}}}},
  ])assert.throws(()=>checkpoint(corrupt as Session));
});

test('real M5-A evidence migrates once into v6 and preserves original v5 and 2D bytes',()=>{
  const s=room(),old={preparation:s.service!.preparation,started:true,briefed:true,evidence:s.service!.evidence};
  const bytes=JSON.stringify({...freshSave(),version:5,session:{...s,service:old},position:getArea(s.areaId).spawn});
  const values=new Map([[M5A_SAVE_KEY,bytes],['av-tech-rpg-save-v1','untouched career']]);
  const repo=new SaveRepository({getItem:k=>values.get(k)??null,setItem:(k,v)=>{values.set(k,v);}});const loaded=repo.load();assert.equal(repo.problem,undefined);
  assert.equal(loaded.data.version,6);assert.equal(loaded.data.session.energy,s.energy);assert.deepEqual(loaded.data.session.service!.evidence,old.evidence);assert(repo.save(loaded.data));
  assert.equal(values.get(M5A_SAVE_KEY),bytes);assert.equal(values.get('av-tech-rpg-save-v1'),'untouched career');assert(values.has(SAVE_KEY));
});
