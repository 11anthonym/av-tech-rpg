import {serviceContent as content} from '../content/service.ts';
import type {Session} from './session.ts';
import {seededUnit,getShiftPrepSkillBonus} from './workday.ts';
import {serviceClock,serviceConditions,knownServiceConditions} from './service.ts';

export type MethodId=typeof content.repairApproaches[number]['id'];
export type ServiceItemId=typeof content.swapItems[number]['id'];
export interface ServiceCheck {id:string;score:number;difficulty:number;energyCost:number;successful:boolean;modifiers:string[]}
export interface ResponseOption {id:string;label:string;detail:string;result:string;energyCost?:number;reputation?:Record<string,number>;stat?:string;controlled?:boolean;
  incidentChance?:number;incidentResult?:string;incidentReputation?:Record<string,number>;incidentBurnout?:number;incidentFlags?:Record<string,boolean>;recovered?:boolean;mitigated?:boolean}
export interface ServiceIncident {conditionId:string;label:string;detail:string;flags:string[];recovery:string|null;recovered:boolean}
export const method=(s:Session)=>content.repairApproaches.find(m=>m.id===s.service?.method);
export const cleanSignal=(s:Session)=>method(s)?.canonicalApproach==='verify'&&Boolean(s.service!.checks.some(c=>c.id==='signal-path'))&&!s.service!.signalStrained;
export function servicePhase(s:Session){
  const remaining=content.appointment.deadlineMinutes+('appointmentExtensionMinutes' in (method(s)??{})?Number((method(s) as {appointmentExtensionMinutes:number}).appointmentExtensionMinutes):0)-serviceClock(s);
  return remaining<=0?'late':remaining<=content.appointment.tightWindowMinutes?'tight':'calm';
}
export function skill(s:Session,id:string){
  let value=id==='install'?s.career.installSkill:Number(content.baseSkills[id as keyof typeof content.baseSkills]??0);
  for(const tool of s.tools){const bonuses=content.tools[tool] as {skillBonuses?:Record<string,number>};value+=bonuses.skillBonuses?.[id]??0;}
  return value+getShiftPrepSkillBonus(s,id);
}
export function methodStatus(s:Session,m:typeof content.repairApproaches[number]){
  const requirements='unlockAny' in m?m.unlockAny:[],evidence='requiredEvidenceIds' in m?m.requiredEvidenceIds:[];
  const missing=evidence.filter(id=>!s.service!.evidence.some(e=>e.id===id));
  const unlocked=!requirements.length||requirements.some(r=>'skillId' in r?skill(s,r.skillId)>=r.minimum:'toolId' in r?(s.tools as string[]).includes(r.toolId):s.career.traits.includes(r.traitId));
  return {available:!missing.length&&unlocked,reason:[missing.length?`Find: ${missing.join(', ')}.`:'',!unlocked?`Requires ${requirements.map(r=>'skillId' in r?`${r.skillId} ${r.minimum}`:'toolId' in r?r.toolId:r.traitId).join(' or ')}.`:''].filter(Boolean).join(' ')};
}
export function controlled(s:Session,id:string):boolean {
  const p=s.service!,response=p.responses.find(r=>r.conditionId===id);
  if(response?.controlled)return true;
  if(p.incidents.some(i=>i.conditionId===id&&i.recovered))return true;
  if('controlsConditionId' in (method(s)??{})&&(method(s) as {controlsConditionId:string}).controlsConditionId===id)return true;
  if(['bad-ticket-notes','mislabeled-input'].includes(id))return cleanSignal(s);
  if(['flaky-replacement-display','loose-mount-hardware'].includes(id))return p.installed.length===2&&!p.installStrained;
  if(id==='client-time-pressure')return cleanSignal(s)||p.evidence.some(e=>e.id==='client-symptom-timeline');
  return cleanSignal(s)||(p.installed.length===2&&!p.installStrained);
}
export const responseOptions=(id:string):readonly ResponseOption[]=>content.responses[id as keyof typeof content.responses]??[];
export const recoveryOptions=(incident:ServiceIncident):readonly ResponseOption[]=>content.recoveries[incident.conditionId==='final-verification'?'final':'ordinary'];
export function reputation(s:Session,delta:Record<string,number>={}){for(const key of ['clients','coworkers','management'] as const)s.career.reputation[key]+=delta[key]??0;}
export function spendEnergy(s:Session,cost:number){
  const p=s.service!,unpaid=Math.max(0,cost-s.energy);s.energy=Math.max(0,s.energy-cost);
  const before=p.unpaidEnergy;p.unpaidEnergy+=unpaid;s.burnout+=Math.floor(p.unpaidEnergy/10)-Math.floor(before/10);
  for(let incident=Math.floor(before/8)+1;incident<=Math.floor(p.unpaidEnergy/8);incident++){
    if(incident%3===1)reputation(s,{management:-1});else if(incident%3===0)reputation(s,{coworkers:-1});else{
      if(!s.career.risks.some(r=>r.id==='exhaustion-service')){s.career.callbacks++;s.career.risks.push({id:'exhaustion-service',source:'Zero-energy overrun',cause:'Service work exceeded available energy; an exhausted handoff needs follow-up.'});}else reputation(s,{clients:-1});
    }
  }
}
export function check(s:Session,id:typeof content.checks[number]['id']):ServiceCheck {
  const c=content.checks.find(c=>c.id===id)!,p=s.service!,m=method(s),mods:string[]=[];
  const skillId=id==='signal-path'&&m&&'verificationSkillId' in m?m.verificationSkillId:c.skillId;
  let score=skill(s,skillId),cost=c.energyCost as number;
  for(const trait of s.career.traits)for(const bonus of content.traitContextBonuses[trait as keyof typeof content.traitContextBonuses]??[])
    if(bonus.skillId===skillId&&(bonus.contextIds as readonly string[]).includes(c.contextId)){score+=bonus.bonus;mods.push(trait);}
  if(id==='signal-path') {score+=Number(['review','josh'].includes(p.preparation));cost-=Number(p.preparation==='josh');}
  if(c.skillId==='install')cost-=s.tools.includes('drill')?4:0;
  if(s.energy>0&&s.energy<=25){score--;mods.push('Low energy');}if(s.burnout>=4){score--;mods.push('Burnout');}
  const exhaustion=Math.min(3,Number(s.energy<=0)+Math.floor(p.unpaidEnergy/8));if(exhaustion){score-=exhaustion;mods.push(`Exhaustion -${exhaustion}`);}
  const known=knownServiceConditions(s);
  for(const condition of serviceConditions(s))if(!controlled(s,condition.id)){
    const map=condition.checkModifiers as Record<string,{difficulty?:number;knownBonus?:number;energy?:number}>,v=map[c.id]??map[c.contextId];
    if(v){score+=(known.some(k=>k.id===condition.id)?v.knownBonus??0:0)-(v.difficulty??0);cost+=v.energy??0;mods.push(condition.label);}
  }
  const mm=m&&'checkModifiers' in m?(m.checkModifiers as Record<string,{statDelta?:number;energyDelta?:number}>)[c.id]??(m.checkModifiers as Record<string,{statDelta?:number;energyDelta?:number}>)[c.contextId]:undefined;
  if(mm){score+=mm.statDelta??0;cost+=mm.energyDelta??0;mods.push(m!.label);}
  const phase=servicePhase(s);if(phase!=='calm'){cost++;if(phase==='late')score--;mods.push(phase==='late'?'Meeting in progress':'Schedule tightening');}
  if(s.career.risks.length&&p.callbackPressureUsed<s.career.callbacks){cost++;p.callbackPressureUsed++;mods.push('Callback ledger pressure');}
  if(id==='final-verification'){score+=cleanSignal(s)?1:m?.canonicalApproach==='rush'?-1:0;score+=p.installStrained?-1:1;score+=Number(p.evidence.length>=3);}
  const successful=score>=c.difficulty;cost=Math.max(0,cost+(successful?score-c.difficulty>=2?-1:0:2));
  spendEnergy(s,cost);const result={id,score,difficulty:c.difficulty,energyCost:cost,successful,modifiers:mods};p.checks.push(result);
  if(!successful){if(id==='signal-path')p.signalStrained=true;else if(id!=='final-verification')p.installStrained=true;}
  for(const condition of serviceConditions(s)){const map=condition.checkModifiers as Record<string,unknown>;if((map[c.id]||map[c.contextId])&&!p.revealed.includes(condition.id))p.revealed.push(condition.id);}
  return result;
}
export function addIncident(s:Session,conditionId:string,label:string,detail:string,flags:string[]){
  s.service!.incidents.push({conditionId,label,detail,flags,recovery:null,recovered:false});
  if(flags.includes('serviceVerificationStrained'))s.service!.signalStrained=true;
  if(flags.includes('serviceInstallStrained'))s.service!.installStrained=true;
}
export const roll=(s:Session,salt:string)=>seededUnit(s.travel.seed,salt);
export function closeoutRisk(s:Session){
  const p=s.service!,unresolved=serviceConditions(s).filter(c=>!controlled(s,c.id)),open=p.incidents.filter(i=>!i.recovered),safe=['confirmed','quick','recovered'].includes(p.finalTest?.status??'');
  const reasons=[!safe?`Final room test: ${p.finalTest?.status??'not completed'}.`:'',p.installStrained?'Replacement install remained strained.':'',
    unresolved.length?`Unresolved room pressure: ${unresolved.map(c=>c.label).join(', ')}.`:'',open.length?`Visible incidents: ${open.map(i=>i.label).join(', ')}.`:''].filter(Boolean);
  return {risky:reasons.length>0,cause:reasons.join(' ')||'Room pressure controlled; the tested repair protects the next visit.'};
}
