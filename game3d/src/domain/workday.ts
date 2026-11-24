import {workdayContent} from '../content/workday.ts';
import {isWorkdayAction} from '../content/ids.ts';
import type {ActionId,ToolId} from '../content/ids.ts';
import type {Session,ActionResult} from './session.ts';

export type PartId=typeof workdayContent.assembly[number]['id'];
export type FinishChoice='tidy'|'rush'|'wiley-workaround';
type Reputation={clients:number;coworkers:number;management:number};
interface Response {pressureId:string;actionId:string;previousActionId?:string;controlled:boolean;incident:boolean;roll:number|null;detail:string}
export interface Workday {
  assembled:PartId[];carriedPart:PartId|null;
  checks:{partId:PartId;score:number;difficulty:number;energyCost:number;successful:boolean}[];
  pressure:Response|null;verified:boolean;handedOff:boolean;finishChoice:FinishChoice|null;
  reward:ToolId|null;shiftClosed:boolean;morningBriefed:boolean;
}
export interface Career {
  installSkill:number;improvisation:number;traits:string[];carefulFinishes:number;
  cash:number;xp:number;reputation:Reputation;craftsmanship:number;fatigue:number;day:number;shiftsCompleted:number;
  callbacks:number;workmanship:'unassessed'|'controlled'|'watch'|'temporary';
  risks:{id:string;source:string;cause:string}[];nextAssignment:'serviceDispatch'|'callbackCleanupDispatch'|null;
  shiftSummary:null|{choice:string;netPay:number;xp:number;energyBefore:number;energyAfter:number;burnoutBefore:number;burnoutAfter:number;recovered:number;fatigueCap:number};
}
export const newWorkday=():Workday=>({assembled:[],carriedPart:null,checks:[],pressure:null,verified:false,handedOff:false,finishChoice:null,reward:null,shiftClosed:false,morningBriefed:false});
export const newCareer=():Career=>({installSkill:2,improvisation:1,traits:['balancedStarter','calmUnderFire'],carefulFinishes:0,cash:0,xp:0,reputation:{clients:0,coworkers:0,management:0},craftsmanship:2,fatigue:0,day:1,shiftsCompleted:0,callbacks:0,workmanship:'unassessed',risks:[],nextAssignment:null,shiftSummary:null});
export const canUseWorkaround=(s:Session)=>s.career.traits.includes('makeThatWork')&&s.career.improvisation>=4;
export const carrying=(s:Session)=>Boolean(s.carry.length||s.workday.carriedPart);
export const nextPart=(s:Session)=>workdayContent.assembly.find(p=>!s.workday.assembled.includes(p.id));
export function seededUnit(seed:number,salt:string){let hash=2166136261;for(const c of `${seed}:${salt}`){hash^=c.charCodeAt(0);hash=Math.imul(hash,16777619);}return ((hash>>>0)%1000000)/1000000;}
export const pressureDefinition=(s:Session)=>[...workdayContent.installPressures].sort((a,b)=>seededUnit(s.travel.seed,a.id)-seededUnit(s.travel.seed,b.id)||a.id.localeCompare(b.id))[0]!;
export const openPressure=(s:Session)=>Boolean(s.flags.supervisorLeft&&!s.workday.pressure?.controlled);
export const supervisorPresent=(s:Session)=>s.areaId!=='centerCityConferenceRoom'||!s.flags.supervisorLeft;
export function workdayObjective(s:Session):string|undefined {
  if(s.areaId==='shop'&&s.workday.shiftClosed)return s.workday.morningBriefed?`Shift ${s.career.day}: ${s.career.nextAssignment==='callbackCleanupDispatch'?'Callback cleanup assigned — review the named cause at the workbench.':'Conshohocken service assignment available. Review the briefing at the counter.'}`:'Next morning: meet the supervisor for the briefing. Your last closeout affects today.';
  if(s.areaId==='shop'&&s.flags.endShiftPending)return 'Back at the shop. Review the shift at the workbench and choose recovery or prep.';
  if(s.areaId!=='centerCityConferenceRoom'||!s.flags.roomBrief)return;
  if(s.workday.handedOff)return 'Handoff complete. Return to the shop through the client-room exit.';
  if(s.workday.finishChoice)return 'Review the handoff at the work order and choose your starter upgrade.';
  if(s.workday.assembled.length===4)return s.workday.verified?'Review the work order and choose the closeout standard.':'Verify both carts at the work order before closeout.';
  if(s.flags.supervisorLeft&&!s.workday.pressure)return `The supervisor has left. Review ${pressureDefinition(s).label.toLowerCase()} at the work order.`;
  if(s.workday.carriedPart)return `Carry ${s.workday.carriedPart} to ${nextPart(s)?.destination==='cart1'?'Cart 1':'Cart 2'} and install it.`;
  return `Pick up ${nextPart(s)?.label} from the delivered boxes. ${s.flags.supervisorLeft?'Cart 2 is yours.':'The supervisor is helping with Cart 1.'}`;
}
const owns=(s:Session,tool:ToolId)=>s.tools.includes(tool);
const inRoom=(s:Session)=>s.areaId==='centerCityConferenceRoom'&&s.flags.roomBrief;
export function describeWorkday(s:Session,id:ActionId):{label:string;available:boolean}|undefined {
  const prompt=(label:string,available=true)=>({label,available});
  if(s.workday.finishChoice&&['shop.pickup-equipment','shop.load-van','shop.choose-route'].includes(id))return prompt('First-day equipment already delivered — review your shift',false);
  if(id==='shop.brief-supervisor'&&s.flags.endShiftPending)return prompt('Review the shift at the workbench',false);
  if(id==='shop.inspect-workbench'&&(s.flags.endShiftPending||s.workday.shiftClosed))return prompt(s.workday.shiftClosed?'Review previous shift and callback causes':'Review shift and clock out');
  if(id==='shop.brief-supervisor'&&s.workday.shiftClosed)return prompt('Morning briefing — last shift matters');
  if(id==='conference.review-assignment'&&inRoom(s))return prompt(s.workday.handedOff?'Review handoff':s.workday.finishChoice?'Client handoff / starter upgrade':s.workday.assembled.length===4?s.workday.verified?'Choose closeout standard':'Verify both carts':s.flags.supervisorLeft&&!s.workday.pressure?'Handle cart pressure':'Review installation assignment');
  if(!isWorkdayAction(id))return;
  if(id==='conference.pickup-part')return prompt(carrying(s)?'Hands full — install the carried component':nextPart(s)?`Pick up ${nextPart(s)!.label}`:'All components installed',inRoom(s)&&!carrying(s)&&Boolean(nextPart(s))&&(!s.flags.supervisorLeft||Boolean(s.workday.pressure)));
  if(id==='install.cart1'||id==='install.cart2'){
    const part=nextPart(s),correct=part?.destination===id.slice(8);
    return prompt(!owns(s,'screwdriver')?'Screwdriver required':!s.workday.carriedPart?'Pick up the next component first':!correct?'That component belongs on the other cart':`Install ${part?.label}`,inRoom(s)&&owns(s,'screwdriver')&&correct&&s.workday.carriedPart===part?.id);
  }
  if(id==='conference.verify')return prompt('Verify image, audio and cart stability',inRoom(s)&&s.workday.assembled.length===4&&!s.workday.verified);
  if(id.startsWith('pressure.'))return prompt('Choose cart-pressure response',inRoom(s)&&Boolean(s.flags.supervisorLeft)&&!s.workday.pressure&&!s.workday.finishChoice);
  if(id.startsWith('finish.'))return prompt(id==='finish.wiley-workaround'&&!canUseWorkaround(s)?'Make That Work trait and improvisation 4 required':'Choose closeout standard',inRoom(s)&&s.workday.verified&&!s.workday.finishChoice&&(id!=='finish.wiley-workaround'||canUseWorkaround(s)));
  if(id.startsWith('reward.'))return prompt('Choose starter upgrade and hand off',inRoom(s)&&Boolean(s.workday.finishChoice)&&!s.workday.reward);
  if(id==='centerCityConferenceRoomToShop')return prompt(s.workday.handedOff?'Return to Radnor Rack & Wire':'Complete installation and client handoff first',inRoom(s)&&s.workday.handedOff);
  if(id.startsWith('shift.'))return prompt('Close this shift',s.areaId==='shop'&&Boolean(s.flags.endShiftPending)&&!s.workday.shiftClosed);
  return prompt('Accept next-shift assignment',s.areaId==='shop'&&s.workday.shiftClosed&&!s.workday.morningBriefed);
}

export function resolveWorkday(state:Session,id:ActionId):ActionResult|undefined {
  const description=describeWorkday(state,id);if(!description)return;
  const result=(s:Session,message:string,title?:string,choices?:NonNullable<ActionResult['event']['choices']>):ActionResult=>({state:s,event:{actionId:id,outcome:s===state?'reviewed':'completed',message,title,dialog:Boolean(title),choices}});
  if(!description.available)return {state,event:{actionId:id,outcome:'blocked',message:description.label}};
  const s=structuredClone(state),w=s.workday,c=s.career;
  const rep=(delta:Partial<Reputation>)=>{for(const key of ['clients','coworkers','management'] as const)c.reputation[key]+=delta[key]??0;};
  const spend=(amount:number)=>{s.energy=Math.max(0,s.energy-amount);};
  if(id==='conference.pickup-part'){w.carriedPart=nextPart(s)!.id;return result(s,`Picked up ${nextPart(s)!.label}. Hands 1/1.`);}
  if(id.startsWith('install.')){
    const part=nextPart(s)!,pressure=pressureDefinition(s);
    const modifiers=openPressure(s)?pressure.checkModifiers as Record<string,{difficulty:number;energy:number}>:{};
    const modifier=modifiers[part.id];
    const score=c.installSkill+(owns(s,'drill')?1:0)+(c.traits.includes('steadyHands')?1:0)-(s.energy>0&&s.energy<=25?1:0)-(s.burnout>=4?1:0)-(s.energy<=0?1:0);
    const difficulty=part.difficulty+(modifier?.difficulty??0),margin=score-difficulty;
    const energyCost=Math.max(0,part.energyCost+(modifier?.energy??0)-(owns(s,'drill')?4:0)+(margin<0?1:0)-(margin>=2?1:0));
    spend(energyCost);w.assembled.push(part.id);w.carriedPart=null;w.checks.push({partId:part.id,score,difficulty,energyCost,successful:margin>=0});
    // Keep M4-A route differences through the canonical tutorial checkpoints.
    const offset=s.travel.route!.arrival-483;
    s.travel.clockMinutes=([546,698,698,1066][w.assembled.length-1]??1066)+offset;
    if(w.assembled.length===2){s.flags.supervisorLeft=true;return result(s,`Cart 1 is assembled. Energy −${energyCost}. The supervisor: “They need me at another site. Finish the second cart the same way.” ${pressure.revealedSummary} Review the pressure at the work order before lifting the next component.`,'You Should Be Fine. Probably.');}
    return result(s,`${part.label} installed. ${margin>=0?part.successText:part.strainedText} Energy −${energyCost}; install ${score} versus difficulty ${difficulty}.`,w.assembled.length===4?'Both carts assembled':part.label);
  }
  if(id==='conference.review-assignment'){
    if(w.finishChoice){if(w.handedOff)return result(state,handoffSummary(state),'Client handoff complete');
      return result(state,`Both carts have been verified. Net pay $${c.cash}; +${c.xp} XP. Choose one starter upgrade for your own kit. Garage receipt remains under review.`,'Client handoff',workdayContent.rewardTools.map(t=>({actionId:`reward.${t.id}` as ActionId,label:t.name,detail:`${t.effect} First-day starter award: no cash charge.`})));}
    if(w.assembled.length===4){if(!w.verified)return result(state,'Test each display, call audio and wheel/mount stability before closing the ticket. This confirms the installed parts; closeout determines whether outstanding risks are controlled.','Verify two carts',[{actionId:'conference.verify',label:'Run the cart acceptance check',detail:'Confirm both carts are assembled and expose any installation concerns. No extra hidden energy charge.'}]);
      return result(state,`${w.checks.some(x=>!x.successful)?'Some assembly checks were strained. ':''}${openPressure(s)?pressureDefinition(s).closeoutRisk:'The pressure response is controlled.'} Choose the standard you can stand behind.`,'Cart 2 works. Choose the closeout.',[
        {actionId:'finish.tidy',label:'Dress the cables properly',detail:'13 energy, +1 burnout, finish 6:21 PM (+route offset). $152 net; clients +2, coworkers +1, management −1. Catch outstanding cart pressure.'},
        {actionId:'finish.rush',label:'Use three zip ties and leave',detail:'4 energy, finish 5:54 PM (+route offset). $141 net; management +1. Callback risk only if assembly was strained or pressure remains open.'},
        ...(canUseWorkaround(s)?[{actionId:'finish.wiley-workaround' as ActionId,label:'Use the adapter workaround and leave',detail:'Make That Work / improvisation 4. Costs 2 energy; finish 5:49 PM. $141 net; client +1, coworker −1, management +1. A temporary adapter remains as named return-trip risk.'}]:[])]);}
    if(s.flags.supervisorLeft&&!w.pressure){const p=pressureDefinition(s);return result(state,p.revealedSummary,p.label,[
      {actionId:`pressure.${p.carefulOption.id}` as ActionId,label:p.carefulOption.label,detail:`${p.carefulOption.detail} Costs 2 energy; management −1, ${p.id==='cable-bag-mismatch'?'coworkers':'clients'} +1.`},
      {actionId:`pressure.${p.quickOption.id}` as ActionId,label:p.quickOption.label,detail:`${p.quickOption.detail} Costs 1 energy; ${Math.round(p.quickOption.incidentChance*100)}% incident risk. A successful quick fix controls the issue and earns management +1.`},
      {actionId:'pressure.leave',label:'Leave it for closeout',detail:'Spend nothing now. Extra difficulty/effort remains on the affected component; tidy closeout can still catch it.'}]);}
    return result(state,workdayObjective(s)!,'Two Quick Carts · Installation Assignment');
  }
  if(id.startsWith('pressure.')){
    const p=pressureDefinition(s),response=id.slice(9);const careful=response===p.carefulOption.id,quick=response===p.quickOption.id;
    if(!careful&&!quick&&response!=='leave')return {state,event:{actionId:id,outcome:'blocked',message:'That response belongs to a different pressure condition.'}};
    const roll=quick?seededUnit(s.travel.seed,`${p.id}:quick`):null,incident=quick&&roll!<p.quickOption.incidentChance;
    spend(careful?2:quick?1:0);if(incident){rep({clients:-1,management:-1});s.burnout++;}else if(careful)rep(p.carefulOption.reputation);else if(quick)rep({management:1});
    const detail=careful?p.carefulOption.result:quick?incident?p.quickOption.incidentResult:p.quickOption.result:p.leaveResult;
    w.pressure={pressureId:p.id,actionId:response,controlled:careful||(quick&&!incident),incident,roll,detail};
    return result(s,`${detail} ${quick?`Saved incident roll ${Math.round(roll!*100)}% against ${p.quickOption.incidentChance*100}%. `:''}${w.pressure.controlled?'This pressure no longer adds task difficulty or named callback risk.':'Tidy closeout can still control this issue; rushing can carry it into tomorrow.'}`,incident?'The room notices':w.pressure.controlled?'Pressure controlled':'Saved for closeout');
  }
  if(id==='conference.verify'){w.verified=true;return result(s,`Both displays and call-audio paths respond; mounts and casters are checked. ${w.checks.some(x=>!x.successful)?'The install ledger flags strained assembly — careful closeout can catch the remaining workmanship concerns.':'Assembly checks are clean.'} ${openPressure(s)?pressureDefinition(s).closeoutRisk:'The pressure response held.'}`,'Cart acceptance check');}
  if(id==='finish.tidy'||id==='finish.rush'||id==='finish.wiley-workaround'){
    const tidy=id==='finish.tidy',workaround=id==='finish.wiley-workaround',p=pressureDefinition(s),open=openPressure(s),strained=w.checks.some(x=>!x.successful)||Boolean(w.pressure?.incident);
    const tidyCost=13-(c.traits.includes('measureTwice')||c.carefulFinishes>=2?1:0);
    w.finishChoice=tidy?'tidy':workaround?'wiley-workaround':'rush';spend(tidy?tidyCost:workaround?2:4);if(tidy){s.burnout++;c.carefulFinishes++;}
    s.travel.clockMinutes=(tidy?1101:workaround?1069:1074)+(s.travel.route!.arrival-483);
    if(tidy){if(open)w.pressure={pressureId:p.id,actionId:'tidy-closeout',previousActionId:w.pressure?.actionId,controlled:true,incident:Boolean(w.pressure?.incident),roll:w.pressure?.roll??null,detail:`${p.label} caught during careful cable dressing and final cart cleanup.`};c.workmanship='controlled';}
    else if(workaround){c.workmanship='temporary';c.callbacks=1;c.risks.push({id:'usedTemporaryAdapterPermanently',source:'Two Quick Carts',cause:'A temporary adapter workaround was left as the final installed path.'});}
    else {c.workmanship=strained||open?'watch':'controlled';if(strained||open)c.callbacks=1;if(open)c.risks.push({id:'centerCityCartPressure',source:'Two Quick Carts',cause:`${p.label} was left unresolved by ${w.pressure?.actionId??'no pressure response'} and rushed through closeout.`});else if(strained)c.risks.push({id:'cartAssemblyStrained',source:'Two Quick Carts',cause:'Strained assembly checks were closed quickly without careful final cleanup.'});}
    c.cash+=tidy?152:141;c.xp+=40;rep(tidy?{clients:2,coworkers:1,management:-1}:workaround?{clients:1,coworkers:-1,management:1}:{management:1});
    s.flags.finished=true;s.flags.tutorialPaid=true;s.flags.tutorialProgressAwarded=true;s.flags.tutorialStatsRecorded=true;
    return result(s,`Net pay +$${tidy?152:141} ($128 wages + $${tidy?42:31} overtime − $18 parking); +40 XP. ${tidy?'Extra effort protected client/coworker standing, but management noticed the clock.':c.risks.length?`${c.risks[0]!.cause} A callback note will affect tomorrow's briefing.`:'Quick closeout held: no named callback risk because the installation was controlled.'} Review the work order for the client handoff and your starter upgrade.`,'Two Quick Carts: complete');
  }
  if(id.startsWith('reward.')){const tool=id.slice(7) as ToolId;if(!workdayContent.rewardTools.some(t=>t.id===tool))return;
    w.reward=tool;w.handedOff=true;if(!s.tools.includes(tool))s.tools.push(tool);
    return result(s,`${handoffSummary(s)} ${tool} added to your kit once. Client handoff accepted; use the room exit to return to the shop.`,'Client handoff complete');}
  if(id==='centerCityConferenceRoomToShop'){s.areaId='shop';s.flags.endShiftPending=true;return result(s,'Returned from Center City. Review your shift at the workbench.');}
  if(id==='shop.inspect-workbench'){
    if(w.shiftClosed)return result(state,`${shiftSummary(s)} ${c.risks.map(r=>r.cause).join(' ')||'No open first-day callback risk.'}`,'Previous shift / career ledger');
    return result(state,`${handoffSummary(s)} Choose how to close the shift. Recovery has a real cost; staying late can prepare tomorrow but reduce recovery.`, 'End of day',[
      {actionId:'shift.clock-out',label:'Clock out and go home',detail:'Ordinary recovery: max(28, 65 − 10 × burnout); no additional energy cost.'},
      {actionId:'shift.prep',label:'Stay late to prep tomorrow',detail:'32 energy, +1 burnout, management −1. Tomorrow gains documentation/fieldcraft prep; fatigue caps morning energy at 80.'},
      {actionId:'shift.recovery-day',label:'Take a recovery day',detail:'Skip an extra day. Full energy, burnout −2, management −1. Callback records remain in the ledger.'}]);
  }
  if(id.startsWith('shift.')){
    const choice=id.slice(6),late=choice==='prep',recovery=choice==='recovery-day',beforeEnergy=s.energy,beforeBurnout=s.burnout;
    const unpaid=late?Math.max(0,32-s.energy):0;
    if(late){spend(32);s.burnout+=1+Math.floor(unpaid/10);rep({management:-1});}if(recovery)rep({management:-1});
    const exhaustionCap=s.energy===0?Math.max(20,60-8*Math.floor(unpaid/8)):100;
    const fatigueCap=recovery?100:Math.min(late?80:100,exhaustionCap),recovered=recovery?100:Math.max(late?16:28,65-s.burnout*10-(late?10:0));
    const afterChoice=s.energy;s.energy=Math.min(fatigueCap,recovery?100:s.energy+recovered);
    if(recovery)s.burnout=Math.max(0,s.burnout-2);else if(!late&&s.energy>=75)s.burnout=Math.max(0,s.burnout-1);
    c.fatigue=100-fatigueCap;c.day=recovery?3:2;c.shiftsCompleted=1;w.shiftClosed=true;s.flags.endShiftPending=false;
    c.shiftSummary={choice,netPay:w.finishChoice==='tidy'?152:141,xp:40,energyBefore:beforeEnergy,energyAfter:s.energy,burnoutBefore:beforeBurnout,burnoutAfter:s.burnout,recovered:s.energy-afterChoice,fatigueCap};
    s.travel.clockMinutes=438;return result(s,shiftSummary(s),'Shift complete — next morning');
  }
  if(id==='shop.brief-supervisor')return result(state,`${w.morningBriefed?`Assignment already accepted: ${c.nextAssignment}. `:''}${c.risks.length?`The client reported a follow-up concern from Two Quick Carts. ${c.risks.map(r=>r.cause).join(' ')} The return-trip ledger takes priority over a clean new service assignment.`:`The client and crew have a clean first-day handoff. ${c.workmanship==='controlled'?'Your controlled closeout protected the next technician. ':''}A Conshohocken service assignment is available.`}`, 'Morning briefing',w.morningBriefed?[]:[{actionId:'morning.accept',label:c.risks.length?'Accept callback cleanup assignment':'Accept Conshohocken service briefing',detail:c.risks.length?'This return-trip opportunity exists because of the saved first-day cause. The callback debt remains visible.':'The next service opportunity is available without first-day callback debt.'}]);
  if(id==='morning.accept'){w.morningBriefed=true;c.nextAssignment=c.risks.length?'callbackCleanupDispatch':'serviceDispatch';return result(s,`${c.nextAssignment==='callbackCleanupDispatch'?'Callback cleanup':'Conshohocken service'} assigned for shift ${c.day}. ${c.risks.map(r=>r.cause).join(' ')||'The first install leaves no named callback risk.'} ${c.shiftSummary?.choice==='prep'?'Previous-shift preparation is recorded for documentation and fieldcraft checks.':''}`,'Next shift started');}
  return;
}
export const handoffSummary=(s:Session)=>`Two Quick Carts · ${s.workday.finishChoice??'pending'} closeout. Cash $${s.career.cash}; XP ${s.career.xp}. Standing: client ${s.career.reputation.clients}, coworker ${s.career.reputation.coworkers}, management ${s.career.reputation.management}. Workmanship ${s.career.workmanship}; open callbacks ${s.career.callbacks}.`;
export const shiftSummary=(s:Session)=>{const r=s.career.shiftSummary;return r?`${handoffSummary(s)} ${r.choice}: energy ${r.energyBefore} → ${r.energyAfter}; burnout ${r.burnoutBefore} → ${r.burnoutAfter}; fatigue cap ${r.fatigueCap}. Shift ${s.career.day} starts at 7:18 AM. ${s.career.risks.map(r=>r.cause).join(' ')}`:handoffSummary(s);};

export function validWorkday(s:Session):boolean {
  const w=s.workday,c=s.career,parts=workdayContent.assembly.map(p=>p.id);
  if(!w||!c||!Array.isArray(w.assembled)||!Array.isArray(w.checks)||w.assembled.length>4||
    !w.assembled.every((id,i)=>id===parts[i])||w.checks.length!==w.assembled.length||
    !w.checks.every((check,i)=>check.partId===w.assembled[i]&&[check.score,check.difficulty,check.energyCost].every(Number.isInteger)&&check.energyCost>=0&&check.successful===(check.score>=check.difficulty))||
    !(w.carriedPart===null||w.carriedPart===parts[w.assembled.length])||
    (w.carriedPart&&(s.carry.length||s.areaId!=='centerCityConferenceRoom'||!s.flags.roomBrief))||
    !['verified','handedOff','shiftClosed','morningBriefed'].every(key=>typeof w[key as keyof Workday]==='boolean')||
    ![null,'tidy','rush','wiley-workaround'].includes(w.finishChoice)||
    ![null,'toolBag','drill','handTruck'].includes(w.reward)||
    !['cash','xp','craftsmanship','fatigue','day','shiftsCompleted','callbacks','installSkill','improvisation','carefulFinishes'].every(key=>Number.isInteger(c[key as keyof Career])&&Number(c[key as keyof Career])>=0)||
    !Array.isArray(c.traits)||!c.traits.every(t=>typeof t==='string')||
    !['clients','coworkers','management'].every(key=>Number.isInteger(c.reputation?.[key as keyof Reputation]))||
    !Array.isArray(c.risks)||new Set(c.risks.map(r=>r.id)).size!==c.risks.length||
    !c.risks.every(r=>['centerCityCartPressure','cartAssemblyStrained','usedTemporaryAdapterPermanently'].includes(r.id)&&r.source==='Two Quick Carts'&&typeof r.cause==='string'&&r.cause.length>0)||
    !['unassessed','controlled','watch','temporary'].includes(c.workmanship))return false;
  if(Boolean(s.flags.supervisorLeft)!==(w.assembled.length>=2)||Boolean(s.flags.finished)!==Boolean(w.finishChoice)||
    ['tutorialPaid','tutorialProgressAwarded','tutorialStatsRecorded'].some(key=>Boolean(s.flags[key as keyof Session['flags']])!==Boolean(w.finishChoice))||
    (w.assembled.length>0&&!s.flags.roomBrief)||(w.verified&&w.assembled.length!==4)||(w.finishChoice&&!w.verified)||
    w.handedOff!==Boolean(w.reward)||(w.reward&&(!w.finishChoice||!s.tools.includes(w.reward)))||
    s.tools.length!==(w.reward?2:1)||
    (w.shiftClosed&&(!w.handedOff||s.areaId!=='shop'))||(w.morningBriefed&&!w.shiftClosed)||
    Boolean(s.flags.endShiftPending)!==(s.areaId==='shop'&&w.handedOff&&!w.shiftClosed)||
    c.cash!==(w.finishChoice?w.finishChoice==='tidy'?152:141:0)||c.xp!==(w.finishChoice?40:0)||
    c.shiftsCompleted!==(w.shiftClosed?1:0)||(!w.shiftClosed&&c.day!==1)||
    (w.shiftClosed&&![2,3].includes(c.day))||Boolean(c.shiftSummary)!==w.shiftClosed||
    c.callbacks!==(c.risks.length?1:0)||c.carefulFinishes!==(w.finishChoice==='tidy'?1:0)||
    c.nextAssignment!==(w.morningBriefed?c.risks.length?'callbackCleanupDispatch':'serviceDispatch':null))return false;
  if(w.pressure){const p=pressureDefinition(s),r=w.pressure;
    if(!s.flags.supervisorLeft||r.pressureId!==p.id||![p.carefulOption.id,p.quickOption.id,'leave','tidy-closeout'].includes(r.actionId)||
      typeof r.controlled!=='boolean'||typeof r.incident!=='boolean'||typeof r.detail!=='string')return false;
    if(r.actionId===p.quickOption.id){const roll=seededUnit(s.travel.seed,`${p.id}:quick`);if(r.roll!==roll||r.incident!==(roll<p.quickOption.incidentChance)||r.controlled===r.incident)return false;}
    if(r.actionId==='tidy-closeout'&&(w.finishChoice!=='tidy'||!r.controlled))return false;
    if(r.actionId===p.carefulOption.id&&(!r.controlled||r.incident))return false;
    if(r.actionId==='leave'&&(r.controlled||r.incident))return false;
  }
  if(w.assembled.length>=3&&!w.pressure)return false;
  if(w.finishChoice==='tidy'&&(c.risks.length||c.workmanship!=='controlled'))return false;
  if(w.assembled.length){const offset=s.travel.route!.arrival-483;
    const clock=w.shiftClosed?438:w.finishChoice?(w.finishChoice==='tidy'?1101:w.finishChoice==='rush'?1074:1069)+offset:[546,698,698,1066][w.assembled.length-1]!+offset;
    if(s.travel.clockMinutes!==clock)return false;
  }
  return true;
}
