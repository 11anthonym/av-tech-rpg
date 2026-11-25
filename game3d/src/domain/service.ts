import {serviceContent} from '../content/service.ts';
import {isServiceAction} from '../content/ids.ts';
import type {ActionId} from '../content/ids.ts';
import type {Session,ActionResult} from './session.ts';
import {seededUnit} from './workday.ts';

export type EvidenceId=typeof serviceContent.diagnosticEvidence[number]['id'];
export type ServicePreparation='review'|'josh'|'none';
export interface ServiceProgress {
  preparation:ServicePreparation;started:boolean;briefed:boolean;
  evidence:{id:EvidenceId;minute:number}[];
}
const finding=(id:EvidenceId)=>serviceContent.diagnosticEvidence.find(e=>e.id===id)!;
const has=(s:Session,id:EvidenceId)=>Boolean(s.service?.evidence.some(e=>e.id===id));
const eligible=(s:Session)=>s.workday.morningBriefed&&s.career.nextAssignment==='serviceDispatch';
const minutes=(id:EvidenceId)=>serviceContent.appointment.actionMinutes[id];
export function serviceClock(s:Session):number {
  if(!s.service?.started)return s.travel.clockMinutes;
  return 554+(s.service.briefed?serviceContent.appointment.actionMinutes['client-check-in']:0)+s.service.evidence.reduce((sum,e)=>sum+minutes(e.id),0);
}
export function serviceEnergySpent(s:Session):number {
  return (has(s,'display-failure-pattern')?(s.service?.preparation==='review'?2:3):0)+Number(has(s,'client-symptom-timeline'));
}
export function serviceConditions(s:Session) {
  return [...serviceContent.roomConditions].sort((a,b)=>seededUnit(s.travel.seed,a.id)-seededUnit(s.travel.seed,b.id)||a.id.localeCompare(b.id)).slice(0,2);
}
export function knownServiceConditions(s:Session) {
  const active=serviceConditions(s),known=new Set<string>();
  for(const c of active)if('prepReveals' in c&&(c.prepReveals as readonly string[]).includes(s.service?.preparation??''))known.add(c.id);
  for(const entry of s.service?.evidence??[]){
    const id=finding(entry.id).conditionIds.find(id=>active.some(c=>c.id===id)&&!known.has(id));if(id)known.add(id);
  }
  return active.filter(c=>known.has(c.id));
}
export function serviceObjective(s:Session):string|undefined {
  if(!eligible(s))return;
  if(s.areaId==='shop')return s.service?'Conshohocken service: approach Van #3’s driver door to depart or resume.':'Prepare for the Conshohocken service call at the workbench, then take Van #3.';
  if(s.areaId!=='serviceOffice')return;
  if(!s.service?.briefed)return 'Call the client contact from the room phone before touching equipment.';
  if(!has(s,'display-failure-pattern'))return 'Inspect the failed display. The ticket may describe only part of the fault.';
  return 'Inspect the credenza signal path or replacement kit; review your saved findings at the room phone.';
}
export function describeService(s:Session,id:ActionId):{label:string;available:boolean}|undefined {
  const prompt=(label:string,available=true)=>({label,available});
  if(eligible(s)&&s.areaId==='shop'){
    if(id==='shop.inspect-workbench'||id==='service.prepare')return prompt(s.service?'Review service preparation':'Prepare for Conshohocken service');
    if(id==='shop.choose-route'||id==='service.depart')return prompt(s.service?.started?'Return to Conshohocken':s.service?'Drive to Conshohocken':'Prepare at the workbench first',Boolean(s.service));
  }
  if(!isServiceAction(id))return;
  if(!eligible(s))return prompt(s.career.nextAssignment==='callbackCleanupDispatch'?'The named callback takes priority over a new service call':'Complete the first workday and accept the service briefing first',false);
  if(id.startsWith('service.prep-'))return prompt('Select one service preparation',s.areaId==='shop'&&!s.service);
  if(id==='service.prepare'||id==='service.depart')return prompt('Use the shop workbench or Van #3',false);
  if(s.areaId!=='serviceOffice'||!s.service?.started)return prompt('This task belongs in Conference Room 2B',false);
  if(id==='serviceOfficeToShop')return prompt('Return to shop · keep service findings');
  if(id==='service-client')return prompt(s.service.briefed?'Client context / room findings':'Check in with the client contact');
  if(!s.service.briefed)return prompt('Check in with the client first',false);
  if(id==='client-symptom-timeline')return prompt('Ask for the symptom timeline');
  if(id==='service.review-findings')return prompt('Review room findings');
  if(id==='service-display')return prompt(has(s,'display-failure-pattern')?'Review display finding':'Inspect the failed display');
  return prompt(id==='service-room-pressure'?'Trace the inline coupler path':'Inspect replacement kit',has(s,'display-failure-pattern'));
}
function findings(s:Session):string {
  const entries=s.service?.evidence??[],known=knownServiceConditions(s);
  return `${entries.length}/4 findings. ${entries.map(e=>`${finding(e.id).label}: ${finding(e.id).summary}`).join(' ')} ${known.map(c=>`Identified: ${c.label}. ${c.revealedSummary}`).join(' ')} ${2-known.length} room conditions remain unknown. Replacement installation is pending; no service pay or XP has been awarded.`;
}
export function resolveService(state:Session,id:ActionId):ActionResult|undefined {
  const prompt=describeService(state,id);if(!prompt)return;
  const result=(s:Session,message:string,title:string,outcome:ActionResult['event']['outcome']='completed',choices:NonNullable<ActionResult['event']['choices']>=[]):ActionResult=>
    ({state:s,event:{actionId:id,outcome,message,title,dialog:outcome!=='blocked',choices}});
  if(!prompt.available)return result(state,prompt.label,'Service call','blocked');
  const inShop=state.areaId==='shop';
  if(id==='service.prepare'||(inShop&&id==='shop.inspect-workbench'))return result(state,state.service?`Selected preparation: ${state.service.preparation}. ${state.service.preparation==='review'?'The buried inline-coupler note reduces display diagnosis by 1 energy.':state.service.preparation==='josh'?'Josh’s advice will reduce the later signal verification cost by 1 energy.':'No extra preparation selected.'}`:'Choose one preparation. The ticket says “quick display swap”; the client has a 1 PM meeting. Replacement equipment is already onsite.','Prepare for service','reviewed',state.service?[]:[
    {actionId:'service.prep-review',label:'Review the work order',detail:'Find the buried coupler note. Reduces display diagnosis effort and may expose bad ticket notes.'},
    {actionId:'service.prep-josh',label:'Ask Josh what to watch for',detail:'He warns about undocumented couplers. Helps later signal-path verification and may expose bad notes.'},
    {actionId:'service.prep-none',label:'Leave without extra preparation',detail:'Take the ticket at face value. You can still gather evidence in the room.'}]);
  if(id.startsWith('service.prep-')){
    const next=structuredClone(state);next.service={preparation:id.slice(13) as ServicePreparation,started:false,briefed:false,evidence:[]};
    return result(next,`Preparation saved: ${next.service.preparation}. Approach the driver door of Van #3.`,'Van #3 is ready');
  }
  if(id==='service.depart'||(inShop&&id==='shop.choose-route')){
    const next=structuredClone(state);next.areaId='serviceOffice';next.service!.started=true;
    return result(next,`${serviceContent.route.arrivalLog} ${next.service!.briefed?'Your findings are still saved.':'Conference Room 2B: use the room phone to check in. The client needs the room at 1 PM.'}`,state.service!.started?'Conshohocken · resume service':'Conshohocken · 9:14 AM');
  }
  if(id==='serviceOfficeToShop')return result({...state,areaId:'shop'},'The service call remains open. Findings, preparation and effort are saved; use Van #3 to resume.','Back at the shop');
  if(id==='service-client'){
    if(!state.service!.briefed){const next=structuredClone(state);next.service!.briefed=true;return result(next,'“The display powers on, then flickers and drops out. Sales said you would swap it before the one o’clock meeting.” Check-in took 5 minutes.','It worked yesterday');}
    return result(state,findings(state),'Client context / room findings','reviewed',has(state,'client-symptom-timeline')?[]:[
      {actionId:'client-symptom-timeline',label:'Ask when the fault started',detail:'15 minutes and 1 energy. Learn what changed before the dropout.'}]);
  }
  if(id==='service.review-findings')return result(state,findings(state),'Saved room findings','reviewed');
  const evidenceId:EvidenceId=id==='service-display'?'display-failure-pattern':id==='service-room-pressure'?'inline-coupler-path':id==='service-pickup'?'replacement-kit-fit':'client-symptom-timeline';
  if(has(state,evidenceId))return result(state,findings(state),finding(evidenceId).label,'reviewed');
  const next=structuredClone(state);next.service!.evidence.push({id:evidenceId,minute:serviceClock(state)+minutes(evidenceId)});
  const cost=serviceEnergySpent(next)-serviceEnergySpent(state);next.energy=Math.max(0,next.energy-cost);
  return result(next,`${finding(evidenceId).summary} Recorded once: ${minutes(evidenceId)} minutes${cost?`, ${cost} energy`:''}. ${findings(next)}`,finding(evidenceId).label);
}
export function validService(s:Session):boolean {
  const p=s.service;
  if(p===null)return s.areaId!=='serviceOffice';
  if(!p||!eligible(s)||!['shop','serviceOffice'].includes(s.areaId)||!['review','josh','none'].includes(p.preparation)||
    typeof p.started!=='boolean'||typeof p.briefed!=='boolean'||(p.briefed&&!p.started)||(s.areaId==='serviceOffice'&&!p.started)||
    !Array.isArray(p.evidence)||p.evidence.length>4||new Set(p.evidence.map(e=>e.id)).size!==p.evidence.length)return false;
  let clock=554+serviceContent.appointment.actionMinutes['client-check-in'];const seen=new Set<string>();
  for(const e of p.evidence){
    if(!p.briefed||!serviceContent.diagnosticEvidence.some(d=>d.id===e.id)||
      (['inline-coupler-path','replacement-kit-fit'].includes(e.id)&&!seen.has('display-failure-pattern')))return false;
    clock+=minutes(e.id);if(e.minute!==clock)return false;seen.add(e.id);
  }
  return s.energy===Math.max(0,s.career.shiftSummary!.energyAfter-serviceEnergySpent(s));
}
