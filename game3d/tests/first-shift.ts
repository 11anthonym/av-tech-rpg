import {newSession,resolveAction} from '../src/domain/session.ts';
import type {Session} from '../src/domain/session.ts';
import type {ActionId} from '../src/content/ids.ts';
const act=(s:Session,id:ActionId)=>resolveAction(s,id).state;
export function morning(finish:'tidy'|'rush'='tidy',seed=173){
  let s=newSession();s.travel.seed=seed;s=act(s,'shop.brief-supervisor');
  for(let i=0;i<3;i++){s=act(s,'shop.pickup-equipment');s=act(s,'shop.load-van');}
  for(const id of ['route.garageRoute','garage.brief-supervisor'] as const)s=act(s,id);
  for(let i=0;i<3;i++){s=act(s,'garage.unload-equipment');s=act(s,'garageToLobby');}
  for(const id of ['garageToLobby','security.check-in','lobbyToConferenceRoom','conference.review-assignment'] as const)s=act(s,id);
  for(let i=0;i<4;i++){if(i===2)s=act(s,'pressure.leave');s=act(s,'conference.pickup-part');s=act(s,i<2?'install.cart1':'install.cart2');}
  for(const id of ['conference.verify',`finish.${finish}`,'reward.drill','centerCityConferenceRoomToShop','shift.clock-out','morning.accept'] as const)s=act(s,id);
  return s;
}
