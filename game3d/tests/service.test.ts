import test from 'node:test';
import assert from 'node:assert/strict';
import {newSession,resolveAction,describeAction} from '../src/domain/session.ts';
import type {Session} from '../src/domain/session.ts';
import type {ActionId} from '../src/content/ids.ts';
import {serviceContent} from '../src/content/service.ts';
import {knownServiceConditions,serviceClock,serviceConditions} from '../src/domain/service.ts';
import {freshSave,parseSave,SaveRepository,SAVE_KEY,M4B_SAVE_KEY} from '../src/persistence/save.ts';
import {getArea} from '../src/world/areas.ts';
import {legacyReference} from './legacy-reference.ts';

const act=(s:Session,id:ActionId)=>resolveAction(s,id).state;
function morning(finish:'tidy'|'rush'='tidy'){
  let s=newSession();s=act(s,'shop.brief-supervisor');
  for(let i=0;i<3;i++){s=act(s,'shop.pickup-equipment');s=act(s,'shop.load-van');}
  for(const id of ['route.garageRoute','garage.brief-supervisor'] as const)s=act(s,id);
  for(let i=0;i<3;i++){s=act(s,'garage.unload-equipment');s=act(s,'garageToLobby');}
  for(const id of ['garageToLobby','security.check-in','lobbyToConferenceRoom','conference.review-assignment'] as const)s=act(s,id);
  for(let i=0;i<4;i++){if(i===2)s=act(s,'pressure.leave');s=act(s,'conference.pickup-part');s=act(s,i<2?'install.cart1':'install.cart2');}
  for(const id of ['conference.verify',`finish.${finish}`,'reward.drill','centerCityConferenceRoomToShop','shift.clock-out','morning.accept'] as const)s=act(s,id);
  return s;
}
function checkpoint(s:Session){return parseSave(JSON.stringify({...freshSave(),session:s,position:getArea(s.areaId).spawn})).session;}

test('service content, preparation effort and seeded pressures match the actual 2D reference',()=>{
  const ref=legacyReference();
  for(const key of ['appointment','diagnosticEvidence','roomConditions','repairApproaches'])
    assert.deepEqual(JSON.parse(JSON.stringify(serviceContent[key as keyof typeof serviceContent])),ref.readGameJson(`content.serviceDispatch.${key}`));
  assert.deepEqual(JSON.parse(JSON.stringify(serviceContent.route)),ref.readGameJson('content.world.routes.conshohockenService'));
  for(const prep of ['review','josh','none'] as const){
    let s=act(morning(),`service.prep-${prep}`);s=act(s,'service.depart');s=act(s,'service-client');
    const before=s.energy;s=act(s,'service-display');
    ref.runGame(`state.flags.servicePreparation=${JSON.stringify(prep)};state.flags.serviceRoomSeed=${s.travel.seed};ensureServiceRoomConditions();`);
    assert.equal(before-s.energy,ref.runGame('getServiceDiagnosisEnergyCost(3)'));
    assert.deepEqual(serviceConditions(s).map(c=>c.id),ref.readGameJson('getRolledServiceRoomConditionIds()'));
    assert.equal(serviceClock(s),584);assert.equal(checkpoint(s).energy,s.energy);
  }
});

test('first-day callback gates new service, preparation is single-use, and room prerequisites are enforced',()=>{
  const start=newSession();assert.equal(act(start,'service.prep-review'),start);
  const callback=morning('rush');assert.equal(act(callback,'service.prep-review'),callback);
  assert.match(describeAction(callback,'service.depart').label,/callback/);
  let s=morning();assert.equal(act(s,'service.depart'),s);
  s=act(s,'service.prep-josh');const selected=structuredClone(s);assert.equal(act(s,'service.prep-review'),s);assert.deepEqual(s,selected);
  s=act(s,'service.depart');assert.equal(act(s,'service-display'),s);
  s=act(s,'service-client');assert.equal(act(s,'service-room-pressure'),s);
  s=act(s,'service-display');assert.equal(s.service!.preparation,'josh');
  assert.notEqual(s,selected);assert.equal(selected.areaId,'shop');assert.equal(selected.service!.started,false);
});

test('physical findings retain canonical times and effort through reload, revisit and van return without payouts',()=>{
  let s=morning();const cash=s.career.cash,xp=s.career.xp,energy=s.energy;
  for(const id of ['service.prep-review','service.depart','service-client','service-display','service-room-pressure','service-pickup','client-symptom-timeline'] as const){
    s=checkpoint(act(s,id));if(['service-display','service-room-pressure','service-pickup','client-symptom-timeline'].includes(id))assert.deepEqual(act(s,id),s);
  }
  assert.equal(serviceClock(s),649);assert.equal(s.energy,energy-3);assert.equal(s.service!.evidence.length,4);
  assert.equal(s.career.cash,cash);assert.equal(s.career.xp,xp);assert.equal(s.career.shiftsCompleted,1);
  const known=knownServiceConditions(s);assert(known.length>0);
  const saved=structuredClone(s.service);s=checkpoint(act(s,'serviceOfficeToShop'));s=checkpoint(act(s,'service.depart'));
  assert.deepEqual(s.service,saved);assert.equal(serviceClock(s),649);assert.equal(s.energy,energy-3);
  assert.deepEqual(knownServiceConditions(s),known);
});

test('malformed service histories cannot manufacture evidence or bypass energy and assignment constraints',()=>{
  let s=act(morning(),'service.prep-none');s=act(s,'service.depart');s=act(s,'service-client');s=act(s,'service-display');
  for(const corrupt of [
    {...s,energy:s.energy+1},
    {...s,service:{...s.service,evidence:[...s.service!.evidence,...s.service!.evidence]}},
    {...s,service:{...s.service,evidence:[{id:'inline-coupler-path',minute:594}]}},
    {...s,service:{...s.service,evidence:[{id:'display-failure-pattern',minute:1}]}},
    {...s,service:{...s.service,preparation:'invented'}},
    {...s,service:{...s.service,started:false}},
    {...s,career:{...s.career,nextAssignment:'callbackCleanupDispatch'}},
  ])assert.throws(()=>checkpoint(corrupt as Session));
});

test('v4 careers migrate into v5 without replacing the original save or legacy career',()=>{
  const source={...freshSave(),version:4,session:morning()};delete (source.session as Partial<Session>).service;
  const bytes=JSON.stringify(source),legacy='{"version":30,"cash":123}';
  const values=new Map([[M4B_SAVE_KEY,bytes],['av-tech-rpg-save-v1',legacy]]);
  const repo=new SaveRepository({getItem:key=>values.get(key)??null,setItem:(key,value)=>{values.set(key,value);}});
  const loaded=repo.load().data;assert.equal(loaded.version,5);assert.equal(loaded.session.service,null);assert(repo.save(loaded));
  assert.equal(values.get(M4B_SAVE_KEY),bytes);assert.equal(values.get('av-tech-rpg-save-v1'),legacy);assert(values.has(SAVE_KEY));
});
