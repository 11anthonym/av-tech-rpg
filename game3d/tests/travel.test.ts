import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { newSession,resolveAction } from '../src/domain/session.ts';
import type { Session } from '../src/domain/session.ts';
import { routeApproaches,routeOutcome,workdayClock } from '../src/content/travel.ts';
import { shopLoad } from '../src/content/ids.ts';
import { freshSave,parseSave,SaveRepository,SAVE_KEY,PREVIOUS_SAVE_KEY } from '../src/persistence/save.ts';
import { getArea } from '../src/world/areas.ts';
const ready=()=>{
  let state=resolveAction(newSession(),'shop.brief-supervisor').state;
  for(let i=0;i<3;i++){state=resolveAction(state,'shop.pickup-equipment').state;state=resolveAction(state,'shop.load-van').state;}
  return state;
};
const checkpoint=(session:Session)=>({...freshSave(),session,position:getArea(session.areaId).spawn});
test('route IDs, costs, times and risk chance agree with canonical 2D content',()=>{
  const context={window:{} as any};vm.createContext(context);
  vm.runInContext(fs.readFileSync(new URL('../../src/content/data.js',import.meta.url),'utf8'),context);
  const data=context.window.GAME_CONTENT;
  const canonical=data.world.routes.centerCityTutorial.choices;
  assert.equal(canonical.length,routeApproaches.length);
  for(const choice of routeApproaches){const old=canonical.find((item:any)=>item.id===choice.id);
    assert.equal(choice.label,old.label);assert.equal(choice.energy,Math.abs(old.energyDelta||0));
    assert.equal(choice.burnout,old.burnoutDelta||0);assert.equal(choice.chance,old.riskRoll?.chance||0);
    assert.equal(workdayClock(choice.arrival).slice(4),old.arrivalTime);
  }
  for(const id of ['centerCityGarage','centerCityLobby','centerCityConferenceRoom'])assert(data.world.areas[id]);
  for(const id of ['garageToLobby','lobbyToConferenceRoom'])assert(data.world.portals[id]);
  assert.deepEqual([...data.tutorial.garageUnload],[...shopLoad]);
});
test('departure requires the actual briefing and complete free-handed load; options do not commit a choice',()=>{
  assert.equal(resolveAction(newSession(),'shop.choose-route').event.outcome,'blocked');
  const state=ready(),menu=resolveAction(state,'shop.choose-route');
  assert.equal(menu.state,state);assert.equal(menu.event.choices?.length,3);
  assert.equal(state.travel.route,null);assert.equal(state.energy,94);
  const carried=resolveAction(resolveAction(newSession(),'shop.brief-supervisor').state,'shop.pickup-equipment').state;
  assert.equal(resolveAction(carried,'route.garageRoute').state,carried);
});
test('three route alternatives retain distinct costs/times and seed-stable curb outcomes',()=>{
  const start=ready();
  const reliable=resolveAction(start,'route.garageRoute').state;
  const circle=resolveAction(start,'route.circleForCurb').state;
  assert.equal(reliable.energy,94);assert.equal(reliable.burnout,0);assert.equal(reliable.travel.clockMinutes,483);
  assert.equal(circle.energy,94);assert.equal(circle.burnout,1);assert.equal(circle.travel.clockMinutes,491);
  const seeds=Array.from({length:100},(_,i)=>i);
  for(const incident of [false,true]) {
    const seed=seeds.find(seed=>routeOutcome('loadingZoneGamble',seed).incident===incident)!;
    const state={...start,travel:{...start.travel,seed}};
    const trip=resolveAction(state,'route.loadingZoneGamble').state;
    assert.equal(trip.energy,incident?90:92);assert.equal(trip.burnout,incident?1:0);assert.equal(trip.travel.clockMinutes,478);
    assert.equal(trip.travel.route!.incident,incident);
    assert.deepEqual(parseSave(JSON.stringify(checkpoint(trip))).session,trip);
    assert.equal(resolveAction(trip,'route.loadingZoneGamble').state,trip);
    assert.equal(trip.travel.parkingExpense,18);
  }
  assert.equal(start.areaId,'shop');assert.equal(start.travel.route,null);
});
test('physical delivery gates, badge and room arrival are saveable and idempotent',()=>{
  let state=resolveAction(ready(),'route.garageRoute').state;
  assert.equal(resolveAction(state,'garage.unload-equipment').state,state);
  assert.equal(resolveAction(state,'garageToLobby').state,state);
  assert.equal(resolveAction(state,'security.check-in').state,state);
  state=resolveAction(state,'garage.brief-supervisor').state;
  assert.equal(resolveAction(state,'garage.brief-supervisor').state,state);
  for(let i=0;i<3;i++){
    state=resolveAction(state,'garage.unload-equipment').state;
    assert.deepEqual(state.carry,[shopLoad[i]]);assert.equal(resolveAction(state,'garage.unload-equipment').state,state);
    state=parseSave(JSON.stringify(checkpoint(state))).session;
    state=resolveAction(state,'garageToLobby').state;
    assert.equal(state.delivered.length,i+1);assert.deepEqual(state.carry,[]);
    assert.equal(new Set([...state.loaded,...state.delivered]).size,3);
    assert.equal(state.energy,94-(i+1)*7);
    if(i<2)assert.equal(resolveAction(state,'garageToLobby').state,state);
  }
  assert.equal(state.flags.centerCityEquipmentDelivered,true);assert.equal(state.travel.clockMinutes,519);
  state=resolveAction(state,'garageToLobby').state;
  assert.equal(state.areaId,'centerCityLobby');assert.equal(resolveAction(state,'lobbyToConferenceRoom').state,state);
  state=resolveAction(state,'security.check-in').state;
  assert.equal(state.energy,71);assert.equal(state.travel.clockMinutes,532);
  assert.equal(resolveAction(state,'security.check-in').state,state);
  state=resolveAction(state,'lobbyToConferenceRoom').state;
  state=resolveAction(state,'conference.review-assignment').state;
  assert.equal(state.areaId,'centerCityConferenceRoom');assert.equal(state.travel.clockMinutes,546);
  assert.equal(state.flags.roomBrief,true);assert(!Object.hasOwn(state.flags,'finished'));
  assert.equal(resolveAction(state,'conference.review-assignment').state,state);
  assert.equal(resolveAction(state,'shop.load-van').state,state);
  const save=checkpoint(state);assert.deepEqual(parseSave(JSON.stringify(save)),save);
  assert.deepEqual(parseSave(JSON.stringify({...save,position:[-3,.92,1]})).position,getArea(state.areaId).spawn);
});
test('v2 shop progress migrates into a separate key, retaining the old 3D and 2D bytes',()=>{
  const state=ready();const old={version:2,session:{areaId:'shop',technicianId:'prototype-tech',completedActions:state.completedActions,
    flags:{shopBrief:true},carry:[],loaded:[...shopLoad],tools:['screwdriver'],energy:94},position:[0,.92,-4],camera:{yaw:0,pitch:.35,distance:5.5}};
  const bytes=JSON.stringify(old),career='{"version":30,"cash":125}';
  const values=new Map([[PREVIOUS_SAVE_KEY,bytes],['av-tech-rpg-save-v1',career]]);
  const repository=new SaveRepository({getItem:key=>values.get(key)??null,setItem:(key,value)=>{values.set(key,value);}});
  const loaded=repository.load().data;assert.equal(loaded.version,6);assert.deepEqual(loaded.session.loaded,shopLoad);
  assert(repository.save(loaded));assert.equal(values.get(PREVIOUS_SAVE_KEY),bytes);assert.equal(values.get('av-tech-rpg-save-v1'),career);
  assert.equal(JSON.parse(values.get(SAVE_KEY)!).version,6);
});

test('alternative route costs and arrival differences remain observable after access and reload',()=>{
  for(const choice of routeApproaches){
    let state=resolveAction(ready(),`route.${choice.id}`).state;
    const outcome=state.travel.route!;
    state=resolveAction(state,'garage.brief-supervisor').state;
    for(let trip=0;trip<3;trip++){
      state=resolveAction(state,'garage.unload-equipment').state;
      state=resolveAction(state,'garageToLobby').state;
    }
    for(const action of ['garageToLobby','security.check-in','lobbyToConferenceRoom','conference.review-assignment'] as const){
      state=parseSave(JSON.stringify(checkpoint(resolveAction(state,action).state))).session;
    }
    assert.equal(state.energy,71-outcome.energyCost);
    assert.equal(state.burnout,outcome.burnoutGain);
    assert.equal(state.travel.clockMinutes,outcome.arrival+63);
    assert.deepEqual(state.travel.route,outcome);
    assert.equal(state.flags.roomBrief,true);
    assert.deepEqual(state.delivered,shopLoad);
  }
});
test('corrupt route outcomes, duplicate delivery and impossible area/flag combinations are retained as errors',()=>{
  const state=resolveAction(ready(),'route.loadingZoneGamble').state;
  const invalid=[{...state,areaId:'centerCityConferenceRoom'},
    {...state,delivered:[shopLoad[0]]},
    {...state,flags:{...state.flags,securityChecked:true}},
    {...state,travel:{...state.travel,route:{...state.travel.route,energyCost:0}}},
    {...state,travel:{...state.travel,clockMinutes:1}},
    {...state,travel:{...state.travel,seed:-1}}];
  for(const session of invalid)assert.throws(()=>parseSave(JSON.stringify({...checkpoint(state),session})));
});
