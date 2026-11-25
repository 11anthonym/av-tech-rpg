import {serviceContent as content} from '../content/service.ts';
import {isServiceAction} from '../content/ids.ts';
import type {ActionId,ServiceActionId} from '../content/ids.ts';
import type {Session,ActionResult} from './session.ts';
import type {Career} from './workday.ts';
import {seededUnit} from './workday.ts';
import {method,methodStatus,check,controlled,servicePhase,responseOptions,recoveryOptions,reputation,spendEnergy,addIncident,roll,cleanSignal,closeoutRisk} from './service-rules.ts';
import type {MethodId,ServiceItemId,ServiceCheck,ServiceIncident} from './service-rules.ts';

export type EvidenceId=typeof content.diagnosticEvidence[number]['id'];
export type ServicePreparation='review'|'josh'|'none';
export interface ServiceProgress {
  preparation:ServicePreparation;started:boolean;briefed:boolean;evidence:{id:EvidenceId;minute:number}[];
  baseline:{career:Career;energy:number;burnout:number};history:ServiceActionId[];clock:number;
  method:MethodId|null;carried:ServiceItemId|null;installed:ServiceItemId[];checks:ServiceCheck[];revealed:string[];
  responses:{conditionId:string;optionId:string;controlled:boolean;incident:boolean;detail:string}[];
  incidents:ServiceIncident[];signalStrained:boolean;installStrained:boolean;unpaidEnergy:number;callbackPressureUsed:number;
  finalTest:null|{choice:'full'|'quick'|'skip';status:'confirmed'|'quick'|'weak'|'skipped'|'recovered'|'documented'};
  closeout:null|{pay:number;xp:number;risky:boolean;cause:string};
}
export const createService=(s:Session,preparation:ServicePreparation):ServiceProgress=>({preparation,started:false,briefed:false,evidence:[],
  baseline:structuredClone({career:s.career,energy:s.energy,burnout:s.burnout}),history:[],clock:554,method:null,carried:null,installed:[],checks:[],revealed:[],responses:[],incidents:[],signalStrained:false,installStrained:false,unpaidEnergy:0,callbackPressureUsed:0,finalTest:null,closeout:null});
const finding=(id:EvidenceId)=>content.diagnosticEvidence.find(e=>e.id===id)!;
const has=(s:Session,id:EvidenceId)=>Boolean(s.service?.evidence.some(e=>e.id===id));
const eligible=(s:Session)=>s.workday.morningBriefed&&(s.career.nextAssignment==='serviceDispatch'||Boolean(s.service));
export const serviceClock=(s:Session)=>s.service?.started?s.service.clock:s.travel.clockMinutes;
export const serviceEnergySpent=(s:Session)=>s.service?s.service.baseline.energy-s.energy:0;
export function serviceConditions(s:Session) {
  return [...content.roomConditions].sort((a,b)=>seededUnit(s.travel.seed,a.id)-seededUnit(s.travel.seed,b.id)||a.id.localeCompare(b.id)).slice(0,2);
}
export function knownServiceConditions(s:Session) {
  const active=serviceConditions(s),known=new Set<string>(s.service?.revealed??[]);
  for(const c of active)if('prepReveals' in c&&(c.prepReveals as readonly string[]).includes(s.service?.preparation??''))known.add(c.id);
  for(const entry of s.service?.evidence??[]){const id=finding(entry.id).conditionIds.find(id=>active.some(c=>c.id===id)&&!known.has(id));if(id)known.add(id);}
  return active.filter(c=>known.has(c.id));
}
export function serviceObjective(s:Session):string|undefined {
  if(!eligible(s))return;const p=s.service;
  if(s.areaId==='shop')return p?.closeout?`Service paid: $${p.closeout.pay}, ${p.closeout.xp} XP. Review the service report at the workbench.`:p?'Conshohocken service: approach Van #3’s driver door to depart or resume.':'Prepare for the Conshohocken service call at the workbench, then take Van #3.';
  if(s.areaId!=='serviceOffice')return;
  if(p?.closeout)return 'Client handoff complete. Return to the shop through the exit.';
  if(!p?.briefed)return 'Call the client contact from the room phone before touching equipment.';
  if(!has(s,'display-failure-pattern'))return 'Inspect the failed display. The ticket may describe only part of the fault.';
  if(!p.method)return 'Gather room findings, then choose a repair approach at the display.';
  if(p.carried)return `Carry ${p.carried==='replacement-display'?'the replacement display':'the mount hardware'} to the wall display and install it.`;
  if(p.installed.length<2)return 'Pick up the next component from the replacement kit; install it at the wall display.';
  if(!p.finalTest)return 'Test the repaired room at the display. Handle known room pressure at the credenza.';
  if(p.incidents.some(i=>!i.recovery))return 'A visible incident needs a recovery decision at the credenza before handoff.';
  return 'Review the test and room pressure, then complete client handoff at the room phone.';
}
export function describeService(s:Session,id:ActionId):{label:string;available:boolean}|undefined {
  const prompt=(label:string,available=true)=>({label,available}),p=s.service;
  if(eligible(s)&&s.areaId==='shop'){
    if(id==='shop.inspect-workbench'||id==='service.prepare')return prompt(p?.closeout?'Review service report':p?'Review service preparation':'Prepare for Conshohocken service');
    if(id==='shop.brief-supervisor'&&p?.closeout)return prompt('Service follow-up briefing');
    if(id==='shop.choose-route'||id==='service.depart')return prompt(p?.closeout?'Service completed — review the report':p?.started?'Return to Conshohocken':p?'Drive to Conshohocken':'Prepare at the workbench first',Boolean(p&&!p.closeout));
  }
  if(!isServiceAction(id))return;
  if(!eligible(s))return prompt(s.career.nextAssignment==='callbackCleanupDispatch'?'The named callback takes priority over a new service call':'Complete the first workday and accept the service briefing first',false);
  if(id.startsWith('service.prep-'))return prompt('Select one service preparation',s.areaId==='shop'&&!p&&['service.prep-review','service.prep-josh','service.prep-none'].includes(id));
  if(id==='service.prepare'||id==='service.depart')return prompt('Use the shop workbench or Van #3',false);
  if(s.areaId!=='serviceOffice'||!p?.started)return prompt('This task belongs in Conference Room 2B',false);
  if(id==='serviceOfficeToShop')return prompt(p.carried?'Put down the replacement gear before leaving':p.closeout?'Return to shop · service complete':'Return to shop · keep service progress',!p.carried);
  if(id==='service-client')return prompt(p.briefed?'Client context / service handoff':'Check in with the client contact');
  if(!p.briefed)return prompt('Check in with the client first',false);
  if(id==='service.review-findings')return prompt('Review room findings');
  if(p.closeout)return prompt('Service already closed out',false);
  if(id==='client-symptom-timeline')return prompt('Ask for the symptom timeline');
  if(id==='service-display')return prompt(!has(s,'display-failure-pattern')?'Inspect the failed display':p.carried?'Install carried component':p.installed.length===2?'Test / review repaired room':'Choose / review repair approach');
  if(id==='service-room-pressure')return prompt('Signal path / room pressure / incident recovery',has(s,'display-failure-pattern'));
  if(id==='service-pickup')return prompt(p.carried?'Review / put down carried gear':p.method?'Replacement kit · take next component':'Inspect replacement kit',has(s,'display-failure-pattern'));
  if(id==='service.methods')return prompt('Choose a repair approach',has(s,'display-failure-pattern')&&!p.method);
  if(id.startsWith('service.method.')){const m=content.repairApproaches.find(m=>m.id===id.slice(15));return prompt(m?methodStatus(s,m).reason||m.label:'Unknown repair method',Boolean(m&&has(s,'display-failure-pattern')&&!p.method&&methodStatus(s,m).available));}
  if(id==='service.take-item')return prompt('Carry next replacement component',Boolean(p.method&&!p.carried&&p.installed.length<2));
  if(id==='service.put-item')return prompt('Put component back in its kit',Boolean(p.carried));
  if(id==='service.install')return prompt('Install carried component',Boolean(p.method&&p.carried));
  if(id==='service.verify'||id.startsWith('service.test.'))return prompt('Test the installed room',p.installed.length===2&&!p.finalTest&&['service.verify','service.test.full','service.test.quick','service.test.skip'].includes(id));
  if(id==='service.closeout')return prompt(p.incidents.some(i=>!i.recovery)?'Choose how to recover or document each visible incident first':'Complete client handoff',Boolean(p.finalTest&&p.installed.length===2&&!p.incidents.some(i=>!i.recovery)));
  if(id.startsWith('service.response.')){const [,,conditionId,optionId]=id.split('.');return prompt('Respond to room pressure',Boolean(knownServiceConditions(s).some(c=>c.id===conditionId)&&!controlled(s,conditionId!)&&!p.responses.some(r=>r.conditionId===conditionId)&&responseOptions(conditionId!).some(o=>o.id===optionId)));}
  if(id.startsWith('service.recover.')){const parts=id.split('.'),incident=p.incidents[Number(parts[2])];return prompt('Respond to the visible incident',Boolean(incident&&!incident.recovery&&recoveryOptions(incident).some(o=>o.id===parts[3])));}
  return prompt('Unknown service action',false);
}
const result=(state:Session,id:ActionId,message:string,title:string,outcome:ActionResult['event']['outcome']='completed',choices:NonNullable<ActionResult['event']['choices']>=[]):ActionResult=>({state,event:{actionId:id,outcome,message,title,dialog:outcome!=='blocked',choices}});
function findings(s:Session){const p=s.service!;return `${p.evidence.length}/4 findings. ${p.evidence.map(e=>`${finding(e.id).label}: ${finding(e.id).summary}`).join(' ')} ${knownServiceConditions(s).map(c=>`${c.label}: ${controlled(s,c.id)?'controlled':c.revealedSummary}`).join(' ')} ${p.installed.length}/2 components installed. ${servicePhase(s)==='calm'?'Room available':servicePhase(s)==='tight'?'Schedule tightening':'Meeting in progress'}. ${p.closeout?`Paid $${p.closeout.pay}; ${p.closeout.xp} XP. ${p.closeout.cause}`:'Client handoff pending; no service pay or XP awarded.'}`;}
function addFinding(s:Session,id:EvidenceId,minutes:number){if(has(s,id))return;const p=s.service!;p.clock+=minutes;p.evidence.push({id,minute:p.clock});spendEnergy(s,id==='display-failure-pattern'?p.preparation==='review'?2:3:id==='client-symptom-timeline'?1:0);}
function pressureChoices(s:Session):NonNullable<ActionResult['event']['choices']>{
  const p=s.service!;
  return [...p.incidents.flatMap((i,index)=>i.recovery?[]:recoveryOptions(i).map(o=>({actionId:`service.recover.${index}.${o.id}` as ActionId,label:`${i.label}: ${o.label}`,detail:`${o.detail} ${o.energyCost??0} energy; ${o.id==='stabilize'?20:o.id==='document'?10:o.id==='calm-client'?8:0} minutes.`}))),
    ...knownServiceConditions(s).filter(c=>!controlled(s,c.id)&&!p.responses.some(r=>r.conditionId===c.id)).flatMap(c=>responseOptions(c.id).map(o=>({actionId:`service.response.${c.id}.${o.id}` as ActionId,label:`${c.label}: ${o.label}`,detail:`${o.detail} ${o.energyCost??0} energy; ${o.id==='leave'?0:o.incidentChance?6:15} minutes.${o.incidentChance?` Base incident chance ${Math.round(o.incidentChance*100)}%; schedule pressure may increase it.`:''}`})))];
}
function resolveCore(state:Session,id:ActionId):ActionResult|undefined {
  const prompt=describeService(state,id);if(!prompt)return;if(!prompt.available)return result(state,id,prompt.label,'Service call','blocked');
  const p=state.service,inShop=state.areaId==='shop',review=(message:string,title:string,choices:NonNullable<ActionResult['event']['choices']>=[])=>result(state,id,message,title,'reviewed',choices);
  if((inShop&&id==='shop.inspect-workbench')||id==='service.prepare'||(inShop&&id==='shop.brief-supervisor')){
    if(p?.closeout)return review(`${findings(state)} ${state.career.risks.length?'The coordinator routes the next opportunity to callback cleanup because of this saved cause: '+state.career.risks.map(r=>r.cause).join(' '):'The coordinator can offer future service work because the tested repair left no named callback debt.'} The next dispatch is a later roadmap slice.`,'Service report / follow-up');
    return review(p?`Selected preparation: ${p.preparation}. Use Van #3 to resume; all service progress is saved.`:'Choose one preparation. The client has a 1 PM meeting. Replacement equipment is onsite.','Prepare for service',p?[]:[
      {actionId:'service.prep-review',label:'Review the work order',detail:'Buried coupler notes. Display inspection costs 1 less energy; later signal check +1.'},
      {actionId:'service.prep-josh',label:'Ask Josh what to watch for',detail:'Signal-path advice. Later signal check +1 and costs 1 less energy.'},
      {actionId:'service.prep-none',label:'Leave without extra preparation',detail:'Take the ticket at face value; evidence can still be gathered onsite.'}]);
  }
  if(id.startsWith('service.prep-')){const next=structuredClone(state);next.service=createService(state,id.slice(13) as ServicePreparation);return result(next,id,`Preparation saved: ${next.service.preparation}. Approach Van #3’s driver door.`,'Van #3 is ready');}
  if(id==='service.review-findings')return review(findings(state),'Saved room findings');
  if(id==='service.methods')return review(`${findings(state)} Choose once. Faster hardware work can succeed, but does not prove the old signal path. ${content.repairApproaches.map(m=>{const status=methodStatus(state,m);return status.available?'':`${m.label} locked: ${status.reason}`;}).filter(Boolean).join(' ')}`,'Repair approaches',content.repairApproaches.filter(m=>methodStatus(state,m).available).map(m=>({actionId:`service.method.${m.id}`,label:m.label,detail:`${m.summary} ${content.appointment.repairMinutes[m.id]} minutes.${'appointmentExtensionMinutes' in m?' Negotiated handoff +30 minutes.':''}`})));
  if(id==='service.verify')return review(`Both components are installed. ${findings(state)}`,'Final room test',content.finalVerification.choices.map(c=>({actionId:`service.test.${c.id}`,label:c.label,detail:`${c.detail} ${content.appointment.actionMinutes[`verification-${c.id}`]} minutes.${c.id==='full'?' Energy depends on the field check.':c.id==='quick'?' A seeded confidence check may expose a dropout.':' Unverified work creates callback risk.'}`})));
  if(id==='service-display'&&has(state,'display-failure-pattern'))return p!.carried?resolveCore(state,'service.install'):!p!.method?resolveCore(state,'service.methods'):p!.installed.length===2&&!p!.finalTest?resolveCore(state,'service.verify'):review(findings(state),'Repair progress');
  if(id==='service-client'&&p!.briefed)return review(findings(state),'Client context / service handoff',[
    ...(!has(state,'client-symptom-timeline')?[{actionId:'client-symptom-timeline' as const,label:'Ask when the fault started',detail:'15 minutes, 1 energy; understand what changed before the dropout.'}]:[]),
    ...(p!.installed.length===2&&p!.finalTest&&!p!.closeout?[{actionId:'service.closeout' as const,label:'Complete client handoff',detail:`$96 pay; XP and standing reflect the test, installation and unresolved pressure. ${closeoutRisk(state).cause}`}]:[])]);
  if(id==='service-room-pressure'&&has(state,'inline-coupler-path'))return review(findings(state),'Room pressure / incident recovery',pressureChoices(state));
  if(id==='service-pickup'&&has(state,'replacement-kit-fit'))return review(findings(state),'Replacement kit',p!.carried?[{actionId:'service.put-item',label:'Put component back in its kit',detail:'Frees your hands. Pickup effort already spent is retained.'}]:p!.method&&p!.installed.length<2?[{actionId:'service.take-item',label:`Carry ${content.swapItems[p!.installed.length]!.label}`,detail:'One component at a time. Carry it to the wall display; pickup costs 3 energy, reduced by a tool bag.'}]:[]);
  const s=structuredClone(state),q=s.service!;
  if(id==='service.depart'||(inShop&&id==='shop.choose-route')){s.areaId='serviceOffice';q.started=true;return result(s,id,`${content.route.arrivalLog} ${q.briefed?'Your progress is still saved.':'Use the room phone to check in.'}`,'Conshohocken service');}
  if(id==='serviceOfficeToShop'){s.areaId='shop';return result(s,id,q.closeout?`Service completed. ${q.closeout.cause} Review the report at the workbench.`:'Service remains open. Preparation, findings, installed parts and effort are saved; use Van #3 to resume.','Back at the shop');}
  if(id==='service-client'){q.briefed=true;q.clock+=5;return result(s,id,'“The display powers on, flickers, and drops out. We need the room for our one o’clock meeting.” Check-in took 5 minutes.','It worked yesterday');}
  if(id.startsWith('service.method.')){
    q.method=id.slice(15) as MethodId;const m=method(s)!;q.clock+=content.appointment.repairMinutes[m.id];
    if(m.canonicalApproach==='verify'){addFinding(s,'inline-coupler-path',0);check(s,'signal-path');}
    else {const phase=servicePhase(s),chance=content.appointment.riskyRepairIncident.chanceByPhase[phase];if(roll(s,`appointment:${m.id}:${phase}`)<chance){reputation(s,{clients:-1});addIncident(s,'appointment-pressure','Meeting handoff dropout','The quick swap collided with the client meeting window.',['serviceInstallStrained','serviceClientAngry']);}}
    return result(s,id,`${m.summary} ${q.checks.at(-1)?.id==='signal-path'?checkDescription(q.checks.at(-1)!):''} Pick up replacement gear from the kit. ${findings(s)}`,'Repair approach selected');
  }
  if(id==='service.take-item'){q.carried=content.swapItems[q.installed.length]!.id;spendEnergy(s,3-Number(s.tools.includes('toolBag'))+Number(s.career.traits.includes('badKnees')));return result(s,id,`Carrying ${q.carried}. Hands 1/1. Walk to the wall display.`,'Replacement component');}
  if(id==='service.put-item'){q.carried=null;return result(s,id,'Component returned to the kit. No duplicate installation or reward.','Hands free');}
  if(id==='service.install'){q.clock+=25;const outcome=check(s,q.carried!);q.installed.push(q.carried!);q.carried=null;if(q.installed.length===2&&(method(s)!.canonicalApproach==='rush'||q.installStrained))spendEnergy(s,6);return result(s,id,`${checkDescription(outcome)} ${q.installed.length}/2 installed.${q.installed.length===2?` ${method(s)!.canonicalApproach==='rush'||q.installStrained?'Reopened the connection panel: 6 energy. ':''}Choose a final room test at the display.`:' Return to the kit for the mount hardware.'}`,'Replacement installed');}
  if(id.startsWith('service.response.')){
    const [,,conditionId,optionId]=id.split('.'),o=responseOptions(conditionId!).find(o=>o.id===optionId)!;
    q.clock+=optionId==='leave'?0:o.incidentChance?6:15;spendEnergy(s,o.energyCost??0);
    const phase=servicePhase(s),chance=Math.min(.9,(o.incidentChance??0)+(phase==='tight'?.1:phase==='late'?.2:0)),incident=Boolean(o.incidentChance&&roll(s,`condition:${conditionId}:${optionId}`)<chance);
    const detail=(incident?o.incidentResult:o.result)!;
    reputation(s,incident?o.incidentReputation:o.reputation);if(incident){s.burnout+=o.incidentBurnout??0;addIncident(s,conditionId!,serviceConditions(s).find(c=>c.id===conditionId)!.label,detail,Object.keys(o.incidentFlags??{}));}else if(o.stat==='carefulFinishes')s.career.carefulFinishes++;
    q.responses.push({conditionId:conditionId!,optionId:optionId!,controlled:o.controlled!==false&&!incident,incident,detail});return result(s,id,`${detail} ${o.energyCost??0} energy; room clock and professional standing updated.`,'Room pressure response','completed',pressureChoices(s));
  }
  if(id.startsWith('service.recover.')){
    const parts=id.split('.'),i=q.incidents[Number(parts[2])]!,o=recoveryOptions(i).find(o=>o.id===parts[3])!;
    q.clock+=o.id==='stabilize'?20:o.id==='document'?10:o.id==='calm-client'?8:0;spendEnergy(s,o.energyCost??0);reputation(s,o.reputation);i.recovery=o.id;i.recovered=Boolean(o.recovered);
    if(o.stat==='carefulFinishes')s.career.carefulFinishes++;
    if(i.recovered){for(const flag of i.flags){if(q.incidents.some(other=>other!==i&&!other.recovered&&other.flags.includes(flag)))continue;if(flag==='serviceVerificationStrained')q.signalStrained=false;if(flag==='serviceInstallStrained')q.installStrained=false;}
      const response=q.responses.find(r=>r.conditionId===i.conditionId);if(response)response.controlled=true;}
    if(i.conditionId==='final-verification'&&q.finalTest)q.finalTest.status=i.recovered?'recovered':o.id==='document'?'documented':'weak';
    return result(s,id,`${o.result} ${i.recovered?'Technical incident controlled.':'The technical risk remains visible in the handoff.'}`,'Incident response recorded','completed',pressureChoices(s));
  }
  if(id.startsWith('service.test.')){
    const choice=id.slice(13) as 'full'|'quick'|'skip';q.clock+=content.appointment.actionMinutes[`verification-${choice}`];let status:NonNullable<ServiceProgress['finalTest']>['status']='skipped';
    if(choice==='full'){const c=check(s,'final-verification');status=c.successful?'confirmed':'weak';if(c.successful)q.installStrained=false;}
    if(choice==='quick'){const c=content.finalVerification.quickIncident,phase=servicePhase(s),chance=Math.max(.05,Math.min(.85,c.baseChance+(method(s)!.canonicalApproach==='rush'?c.rushedApproachPenalty:0)+(q.installStrained?c.strainedInstallPenalty:0)+(phase==='tight'?c.tightSchedulePenalty:phase==='late'?c.lateSchedulePenalty:0)-(q.evidence.length>=3?c.evidenceReduction:0)));status=roll(s,`final-verification:${q.method}`)<chance?'weak':'quick';}
    q.finalTest={choice,status};if(status==='weak'){reputation(s,{clients:-1});addIncident(s,'final-verification','Final room test dropout','The installed room dropped signal during the handoff test.',['serviceFinalVerificationWeak','serviceClientAngry',...(q.installStrained?['serviceInstallStrained']:[])]);}
    return result(s,id,`${status==='confirmed'?'Repair confirmed by the full path test.':status==='quick'?'Quick test held; less proof, faster handoff.':status==='weak'?'The room test exposed a dropout. Choose recovery or an honest risk note at the credenza.':'Room handed back unverified. This creates named return-trip risk.'} ${q.checks.at(-1)?.id==='final-verification'?checkDescription(q.checks.at(-1)!):''}`,'Final room test recorded');
  }
  if(id==='service.closeout'){
    q.clock+=10;const risk=closeoutRisk(s),verified=method(s)!.canonicalApproach==='verify',clean=cleanSignal(s),xp=q.finalTest!.status==='confirmed'&&!risk.risky?58:clean&&!risk.risky?55:!verified&&!risk.risky?48:clean?50:verified?45:40;
    q.closeout={pay:96,xp,...risk};s.career.cash+=96;s.career.xp+=xp;reputation(s,!risk.risky?{clients:2,coworkers:1}:verified?{clients:1}:{management:1});
    if(risk.risky){s.career.callbacks++;s.career.risks.push({id:'conshohockenServiceRoomPressure',source:content.title,cause:risk.cause});s.career.workmanship='watch';}else{s.career.carefulFinishes++;s.career.workmanship='controlled';}
    s.career.nextAssignment=s.career.risks.length?'callbackCleanupDispatch':'serviceDispatch';
    return result(s,id,`Service wages +$96; +${xp} XP. ${risk.cause} Standing: clients ${s.career.reputation.clients}, coworkers ${s.career.reputation.coworkers}, management ${s.career.reputation.management}. Energy ${s.energy}; burnout ${s.burnout}. Return to the shop for the report and follow-up.`,'Service handoff complete');
  }
  const evidenceId:EvidenceId=id==='service-display'?'display-failure-pattern':id==='service-room-pressure'?'inline-coupler-path':id==='service-pickup'?'replacement-kit-fit':'client-symptom-timeline';
  if(has(state,evidenceId))return review(findings(state),finding(evidenceId).label);
  addFinding(s,evidenceId,content.appointment.actionMinutes[evidenceId]);
  return result(s,id,`${finding(evidenceId).summary} Recorded once: ${content.appointment.actionMinutes[evidenceId]} minutes. ${findings(s)}`,finding(evidenceId).label,'completed',id==='service-room-pressure'?pressureChoices(s):[]);
}
const checkDescription=(c:ServiceCheck)=>`${c.id}: ${c.score}/${c.difficulty}, ${c.successful?'solid or better':'strained'}; ${c.energyCost} energy.${c.modifiers.length?` Factors: ${c.modifiers.join(', ')}.`:''}`;
export function resolveService(state:Session,id:ActionId):ActionResult|undefined {
  const r=resolveCore(state,id);
  if(r&&r.state!==state&&r.state.service&&state.service)r.state.service.history.push(r.event.actionId==='shop.choose-route'?'service.depart':r.event.actionId as ServiceActionId);
  return r;
}
// Replay against the archived first-day career. Its original strict validator still checks that archive.
export function validService(s:Session):boolean {
  const p=s.service;if(p===null)return s.areaId!=='serviceOffice';
  try{
    if(!p||!s.workday.morningBriefed||!['shop','serviceOffice'].includes(s.areaId)||!['review','josh','none'].includes(p.preparation)||!Array.isArray(p.history)||p.history.length>8192||!p.baseline||p.baseline.career.nextAssignment!=='serviceDispatch')return false;
    let replay:Session={...structuredClone(s),areaId:'shop',career:structuredClone(p.baseline.career),energy:p.baseline.energy,burnout:p.baseline.burnout,service:null};
    replay.service=createService(replay,p.preparation);
    for(const id of p.history){if(typeof id!=='string'||!isServiceAction(id))return false;const r=resolveService(replay,id);if(!r||r.state===replay||r.event.outcome!=='completed')return false;replay=r.state;}
    return JSON.stringify(replay.service)===JSON.stringify(p)&&JSON.stringify(replay.career)===JSON.stringify(s.career)&&replay.energy===s.energy&&replay.burnout===s.burnout&&replay.areaId===s.areaId;
  }catch{return false;}
}
export function firstDaySnapshot(s:Session):Session {return s.service?{...s,career:s.service.baseline.career,energy:s.service.baseline.energy,burnout:s.service.baseline.burnout,service:null}:s;}
// Upgrade only already-paid M5-A diagnosis actions, preserving the old namespace bytes.
export function migrateService(s:Session){
  const old=s.service;if(!old)return s;
  const baseline:Session={...s,areaId:'shop',service:null,energy:s.career.shiftSummary!.energyAfter};let current:Session={...baseline,service:createService(baseline,old.preparation)};
  const actions:ServiceActionId[]=[];
  if(old.started)actions.push('service.depart');if(old.briefed)actions.push('service-client');
  for(const e of old.evidence)actions.push(e.id==='display-failure-pattern'?'service-display':e.id==='inline-coupler-path'?'service-room-pressure':e.id==='replacement-kit-fit'?'service-pickup':'client-symptom-timeline');
  if(old.started&&s.areaId==='shop')actions.push('serviceOfficeToShop');
  for(const id of actions)current=resolveService(current,id)!.state;
  if(current.energy!==s.energy||JSON.stringify(current.service!.evidence)!==JSON.stringify(old.evidence)||current.service!.started!==old.started||current.service!.briefed!==old.briefed)throw new Error('Invalid old service progress');
  return current;
}
