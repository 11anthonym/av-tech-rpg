import { shop } from './shop.ts';
import type { AreaDefinition,PropDefinition } from './shop.ts';
import type { AreaId } from '../content/ids.ts';
const shell=():PropDefinition[]=>[
  {id:'floor',position:[0,-.1,0],size:[12,.2,12],material:'concrete',solid:true},
  {id:'wall-back',position:[0,1.6,6],size:[12,3.2,.2],material:'wall',solid:true},
  {id:'wall-front',position:[0,1.6,-6],size:[12,3.2,.2],material:'wall',solid:true},
  {id:'wall-left',position:[-6,1.6,0],size:[.2,3.2,12],material:'wall',solid:true},
  {id:'wall-right',position:[6,1.6,0],size:[.2,3.2,12],material:'wall',solid:true},
];
export const garage:AreaDefinition={id:'centerCityGarage',label:'Center City Garage · Level B2',spawn:[0,.92,-3.8],
  props:[...shell(),
    {id:'van3',position:[-2,1.1,1],size:[2.2,2.2,4.8],material:'steel',solid:true},
    {id:'supervisor',position:[-3.8,.9,-1],size:[.6,1.8,.6],material:'steel',solid:true},
    {id:'entrance',position:[4,1.25,-.7],size:[2.3,2.5,.16],material:'steel',solid:true}],
  interactions:[
    {id:'garage.supervisor',actionId:'garage.brief-supervisor',anchor:[-3.8,1,-1.4],meshId:'supervisor',radius:1.6,priority:2},
    {id:'garage.van',actionId:'garage.unload-equipment',anchor:[-2,1,-1.5],meshId:'van3',radius:1.6,priority:2},
    {id:'garage.entrance',actionId:'garageToLobby',anchor:[4,1,-1],meshId:'entrance',radius:1.6,priority:2}],};
export const lobby:AreaDefinition={id:'centerCityLobby',label:'Client Lobby · Security',spawn:[0,.92,-3.5],
  props:[...shell(),
    {id:'security-desk',position:[-3,.6,0],size:[2.2,1.2,.8],material:'wood',solid:true},
    {id:'supervisor',position:[-3,.9,1],size:[.6,1.8,.6],material:'steel',solid:true},
    {id:'elevator',position:[3,1.4,3.25],size:[2.5,2.8,.15],material:'steel',solid:true}],
  interactions:[
    {id:'lobby.security',actionId:'security.check-in',anchor:[-3,1,-.6],meshId:'security-desk',radius:1.7,priority:2},
    {id:'lobby.elevator',actionId:'lobbyToConferenceRoom',anchor:[3,1,2.5],meshId:'elevator',radius:1.6,priority:2}],};
export const conference:AreaDefinition={id:'centerCityConferenceRoom',label:'Client Conference Room · Two Quick Carts',spawn:[0,.92,-3.5],
  props:[...shell(),
    {id:'work-order',position:[-3,.5,1],size:[1.6,1,.8],material:'wood',solid:true},
    {id:'supervisor',position:[-3,.9,2],size:[.6,1.8,.6],material:'steel',solid:true},
    {id:'cart1',position:[1,1,2],size:[1.2,2,.7],material:'steel',solid:true},
    {id:'cart2',position:[4,1,2],size:[1.2,2,.7],material:'steel',solid:true}],
  interactions:[{id:'client.assignment',actionId:'conference.review-assignment',anchor:[-3,1,.55],meshId:'work-order',radius:1.7,priority:2}],};
export const areas:Record<AreaId,AreaDefinition>={shop,centerCityGarage:garage,centerCityLobby:lobby,centerCityConferenceRoom:conference};
export const getArea=(id:AreaId)=>areas[id];
export const npcPlacement:Record<AreaId,readonly[number,number,number]>={shop:[-5,0,-1],centerCityGarage:[-3.8,0,-1],centerCityLobby:[-3,0,1],centerCityConferenceRoom:[-3,0,2]};
