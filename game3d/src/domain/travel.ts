import { routeApproaches, routeOutcome } from '../content/travel.ts';
import { shopLoad } from '../content/ids.ts';
import type { RouteChoiceId } from '../content/travel.ts';
import type { TravelActionId } from '../content/ids.ts';
import type { Session, ActionResult } from './session.ts';

export const equipmentDelivered=(state:Session)=>state.delivered.length===3 && !state.carry.length;
export function travelObjective(state:Session) {
  if(state.areaId==='centerCityGarage') {
    if(!state.flags.garageBrief)return 'Meet the supervisor beside Van #3. The loading dock was not booked.';
    if(state.carry.length)return `Carry ${state.carry[0]} to the client entrance.`;
    return equipmentDelivered(state)?'All equipment delivered. Enter the client lobby.':`Unload the next group from Van #3 (${state.delivered.length}/3 delivered).`;
  }
  if(state.areaId==='centerCityLobby')return state.flags.securityChecked?'Take the elevator to the client floor.':'Check in at security; the elevator requires your visitor badge.';
  return state.flags.roomBrief?'Equipment staged and building access complete. Installation preparation is saved.':'Meet the supervisor and review the two-cart installation assignment.';
}
export function describeTravel(state:Session,id:TravelActionId) {
  const prompt=(label:string,available=true)=>({label,available});
  const inArea=(area:Session['areaId'],label:string)=>prompt(state.areaId===area?label:'This action belongs at another location',state.areaId===area);
  if(id==='shop.choose-route'||id.startsWith('route.')) {
    const ready=state.areaId==='shop'&&state.flags.shopBrief&&state.loaded.length===3&&!state.carry.length&&!state.travel.route;
    return prompt(ready?'Choose route to Center City':'Load all three groups and free your hands first',ready);
  }
  if(id==='garage.brief-supervisor')return inArea('centerCityGarage',state.flags.garageBrief?'Review loading-dock briefing':'Talk to supervisor');
  if(id==='garage.unload-equipment') {
    if(state.areaId!=='centerCityGarage')return inArea('centerCityGarage','Unload equipment');
    if(!state.flags.garageBrief)return prompt('Ask the supervisor about unloading first',false);
    if(state.carry.length)return prompt('Hands full · deliver to client entrance',false);
    return prompt(state.loaded.length?`Unload ${state.loaded[0]}`:'Van empty · equipment delivered',Boolean(state.loaded.length));
  }
  if(id==='garageToLobby') {
    if(state.areaId!=='centerCityGarage')return inArea('centerCityGarage','Enter lobby');
    return prompt(state.carry.length?`Deliver ${state.carry[0]}`:equipmentDelivered(state)?'Enter client lobby':'Deliver all three groups first',Boolean(state.carry.length)||equipmentDelivered(state));
  }
  if(id==='security.check-in')return inArea('centerCityLobby',state.flags.securityChecked?'Review visitor badge':'Check in with security');
  if(id==='lobbyToConferenceRoom')return prompt(state.flags.securityChecked?'Take elevator to client floor':'Check in with security first',state.areaId==='centerCityLobby'&&state.flags.securityChecked);
  return inArea('centerCityConferenceRoom',state.flags.roomBrief?'Review installation assignment':'Review two-cart installation assignment');
}
export function resolveTravel(state:Session,id:TravelActionId):ActionResult {
  const result=(next:Session,outcome:ActionResult['event']['outcome'],message:string,title?:string,dialog=false):ActionResult=>
    ({state:next,event:{actionId:id,outcome,message,title,dialog}});
  const available=describeTravel(state,id);
  if(!available.available)return result(state,'blocked',available.label);
  if(id==='shop.choose-route') {
    const out=result(state,'reviewed','Two Quick Carts · Center City East. Choose an approach. All routes still need the garage; nobody arranged curb access.','Drive to Center City',true);
    out.event.choices=routeApproaches.map(choice=>({actionId:`route.${choice.id}` as TravelActionId,label:choice.label,detail:choice.detail}));
    return out;
  }
  if(id.startsWith('route.')) {
    const decision=routeOutcome(id.slice(6) as RouteChoiceId,state.travel.seed);
    const next:Session={...state,areaId:'centerCityGarage',energy:Math.max(0,state.energy-decision.energyCost),burnout:state.burnout+decision.burnoutGain,
      travel:{...state.travel,route:decision,clockMinutes:decision.arrival,parkingExpense:18}};
    return result(next,'completed',`${decision.incident?'Security waved the van off the curb. The saved minutes cost extra stress. ':''}Route cost: ${decision.energyCost} energy, ${decision.burnoutGain} burnout. Garage parking: $18 pending reimbursement. Meet the supervisor beside Van #3.`, 'Garage First, Apparently',true);
  }
  if(id==='garage.brief-supervisor') {
    const next=state.flags.garageBrief?state:{...state,flags:{...state.flags,garageBrief:true}};
    return result(next,next===state?'reviewed':'completed','“Nobody booked one. We’ll carry the boxes from here. It’s not that far.” Unload one group at a time and deliver it to the client entrance.','About the Loading Dock',true);
  }
  if(id==='garage.unload-equipment') {
    const cargo=state.loaded[0]!;
    return result({...state,carry:[cargo],loaded:state.loaded.slice(1),energy:Math.max(0,state.energy-3),travel:{...state.travel,clockMinutes:state.travel.clockMinutes+6}},'completed',`Unloaded ${cargo}. Hands 1/1 · take it to the client entrance. Energy −3.`);
  }
  if(id==='garageToLobby') {
    if(state.carry.length) {
      const delivered=[...state.delivered,...state.carry];
      return result({...state,carry:[],delivered,energy:Math.max(0,state.energy-4),flags:{...state.flags,centerCityEquipmentDelivered:delivered.length===3},
        travel:{...state.travel,clockMinutes:state.travel.clockMinutes+6}},'completed',`Delivered ${state.carry[0]} (${delivered.length}/3). Energy −4.${delivered.length===3?' Equipment is inside; press E to enter the lobby.':''}`);
    }
    return result({...state,areaId:'centerCityLobby'},'completed','Everything is inside. Find security for your visitor badge.');
  }
  if(id==='security.check-in') {
    if(state.flags.securityChecked)return result(state,'reviewed','Your visitor badge is valid. Take the elevator to the client floor.','Visitor Badge',true);
    return result({...state,energy:Math.max(0,state.energy-2),flags:{...state.flags,securityChecked:true},travel:{...state.travel,clockMinutes:state.travel.clockMinutes+13}},'completed',
      'The client used a different company abbreviation. Security located the work order and printed your badge. Energy −2; check-in took 13 minutes.','Visitor Badge Located Eventually',true);
  }
  if(id==='lobbyToConferenceRoom')return result({...state,areaId:'centerCityConferenceRoom',travel:{...state.travel,clockMinutes:state.travel.clockMinutes+14}},'completed','Client floor reached. The supervisor is waiting by the two-cart work order.');
  const next=state.flags.roomBrief?state:{...state,flags:{...state.flags,roomBrief:true}};
  return result(next,next===state?'reviewed':'completed','Two Quick Carts: Cart 1 frame and display with the supervisor, then Cart 2. The frame boxes, displays and accessory tote are staged beside the work order. Equipment delivery and building access are complete.','Two Quick Carts · Installation Assignment',true);
}

export function validTravelProgress(state:Session):boolean {
  const {travel,flags,delivered}=state;
  if(!travel || !Number.isInteger(travel.seed)||travel.seed<0||travel.seed>0xffffffff||
    !Number.isInteger(state.burnout)||state.burnout<0||state.burnout>100||
    !Array.isArray(delivered)||!delivered.every(id=>shopLoad.includes(id))||new Set(delivered).size!==delivered.length||
    !['garageBrief','centerCityEquipmentDelivered','securityChecked','roomBrief'].every(key=>typeof flags[key as keyof typeof flags]==='boolean')||
    flags.centerCityEquipmentDelivered!==equipmentDelivered(state)||
    new Set([...state.carry,...state.loaded,...delivered]).size!==state.carry.length+state.loaded.length+delivered.length)return false;
  if(travel.route===null)return state.areaId==='shop'&&!flags.garageBrief&&!flags.securityChecked&&!flags.roomBrief&&!delivered.length&&travel.parkingExpense===0&&travel.clockMinutes===431;
  const saved=travel.route;
  if(!routeApproaches.some(choice=>choice.id===saved?.choiceId))return false;
  const expected=routeOutcome(saved.choiceId,travel.seed);
  if(Object.keys(expected).some(key=>saved[key as keyof typeof saved]!==expected[key as keyof typeof expected])||
    !flags.shopBrief||travel.parkingExpense!==18||state.burnout<expected.burnoutGain||
    state.carry.length+state.loaded.length+delivered.length!==3||(state.areaId==='shop'&&!state.workday.handedOff)||
    (!flags.garageBrief&&(state.loaded.length!==3||delivered.length||state.carry.length))||
    (flags.securityChecked&&!flags.centerCityEquipmentDelivered)||
    (flags.roomBrief&&state.areaId!=='centerCityConferenceRoom'&&!state.workday.handedOff))return false;
  if(state.areaId!=='centerCityGarage'&&!equipmentDelivered(state))return false;
  if(state.areaId==='centerCityGarage'&&flags.securityChecked)return false;
  if(state.areaId==='centerCityConferenceRoom'&&!flags.securityChecked)return false;
  const expectedClock=expected.arrival+(3-state.loaded.length)*6+delivered.length*6+(flags.securityChecked?13:0)+(state.areaId==='centerCityConferenceRoom'?14:0);
  return state.workday.assembled.length?Number.isInteger(travel.clockMinutes):travel.clockMinutes===expectedClock;
}
