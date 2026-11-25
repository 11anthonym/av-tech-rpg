import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder.js';
import { Mesh } from '@babylonjs/core/Meshes/mesh.js';
import { PBRMaterial } from '@babylonjs/core/Materials/PBR/pbrMaterial.js';
import { DynamicTexture } from '@babylonjs/core/Materials/Textures/dynamicTexture.js';
import { Color3 } from '@babylonjs/core/Maths/math.color.js';
import type { Scene } from '@babylonjs/core/scene.js';
import type { TransformNode } from '@babylonjs/core/Meshes/transformNode.js';
import type { AreaDefinition } from '../world/shop.ts';
import { createVan } from './van.ts';
import type { ArtBuilders } from './van.ts';

// Compact original set dressing. Static geometry is baked by material; the
// human and authoritative cargo retain their independent, reusable adapters.
export function createFieldArt(scene:Scene,root:TransformNode,area:AreaDefinition) {
  const batches=new Map<PBRMaterial,Mesh[]>();
  const material:ArtBuilders['material']=(name,color,roughness=.8,metallic=0)=>{
    const m=new PBRMaterial(`field/${name}`,scene);m.albedoColor=Color3.FromHexString(color).toLinearSpace();m.roughness=roughness;m.metallic=metallic;return m;
  };
  const finish:ArtBuilders['finish']=(mesh,m,parent=root)=>{mesh.parent=parent;mesh.material=m;mesh.isPickable=false;mesh.receiveShadows=true;
    if(!batches.has(m))batches.set(m,[]);batches.get(m)!.push(mesh);return mesh;};
  const box:ArtBuilders['box']=(name,p,size,m,parent=root)=>{const mesh=MeshBuilder.CreateBox(name,{width:size[0],height:size[1],depth:size[2]},scene);mesh.position.set(...p);return finish(mesh,m,parent);};
  const cylinder:ArtBuilders['cylinder']=(name,p,diameter,height,m,parent=root)=>{const mesh=MeshBuilder.CreateCylinder(name,{diameter,height,tessellation:12},scene);mesh.position.set(...p);return finish(mesh,m,parent);};
  const label:ArtBuilders['label']=(name,text,p,width,height,parent=root,yaw=0)=>{
    const m=material(name,'#ffffff');const texture=new DynamicTexture(name,{width:512,height:128},scene,false);
    texture.drawText(text,null,83,'bold 38px sans-serif','#ffe4a5','#20363e',true);m.albedoTexture=texture;m.emissiveColor.set(.2,.2,.2);
    const plane=MeshBuilder.CreatePlane(name,{width,height,sideOrientation:2},scene);plane.parent=parent;plane.position.set(...p);plane.rotation.y=yaw;plane.material=m;plane.isPickable=false;plane.metadata={noShadow:true};return plane;
  };
  const concrete=material('concrete','#777f7b'),wall=material('wall','#c2c9c5'),steel=material('steel','#39454b',.6,.3),
    white=material('enamel','#c7cecb',.5,.1),glass=material('glass','#314953',.25,.2),black=material('ABS','#162129'),
    rubber=material('rubber','#171a1d'),aluminium=material('aluminium','#9ca8aa',.4,.75),warm=material('lamp','#e2d3a0'),
    wood=material('laminate','#a38252'),yellow=material('markings','#d1af54');
  for(const prop of area.props.filter(p=>p.id==='floor'||p.id.startsWith('wall-')))box(prop.id,prop.position,prop.size,prop.id==='floor'?concrete:wall);
  for(const x of [-4,0,4]){box('ceiling-light',[x,3.05,0],[2.1,.06,.25],white);box('lit-strip',[x,3.01,0],[1.95,.025,.16],warm);}
  if(area.id==='centerCityGarage') {
    createVan(scene,root,{box,cylinder,label,finish,material},{white,steel,glass,black,rubber,aluminium,warm},[-2,0,1],Math.PI);
    for(const x of [-3.5,-.5])box('parking-stripe',[x,.012,1],[.06,.02,5.6],yellow);
    for(const x of [-5.4,5.4]){box('column',[x,1.5,2],[.65,3,.65],concrete);box('column-band',[x,1.05,1.66],[.68,.3,.02],yellow);}
    label('level','B2  /  VAN 3',[-2,2.8,5.85],3,.4);
    box('entrance-frame',[4,1.25,-.7],[2.3,2.5,.16],steel);box('entrance-panel',[4,1.25,-.81],[2.05,2.2,.035],glass);
    label('entrance-sign','CLIENT ENTRANCE',[4,2.7,-.85],2.7,.4);
    label('supervisor-sign','SUPERVISOR',[-3.8,2.12,-1],1.5,.32);
  } else if(area.id==='centerCityLobby') {
    box('counter',[-3,.6,0],[2.2,1.2,.8],wood);box('counter-plinth',[-3,.53,-.03],[2.1,.97,.72],steel);
    box('monitor',[-3.6,1.5,0],[.6,.42,.06],black);box('monitor-stand',[-3.6,1.27,.02],[.05,.25,.05],steel);
    box('badge-printer',[-2.5,1.29,0],[.35,.18,.28],white);label('security-sign','SECURITY / CHECK IN',[-3,2.5,1.5],3,.4);
    box('elevator-surround',[3,1.4,3.25],[2.5,2.8,.15],steel);
    for(const x of [2.45,3.55])box('elevator-door',[x,1.3,3.14],[1.06,2.6,.035],aluminium);
    label('elevator-sign','CLIENT FLOOR',[3,2.95,3.1],2.4,.3);
    for(const x of [-4.8,-3.5,-2.2]){box('waiting-seat',[x,.45,4],[1,.2,.75],steel);box('seat-back',[x,.9,4.35],[1,.9,.13],steel);}
  } else if(area.id==='serviceOffice') {
    // Original, material-batched conference equipment. No new downloaded art,
    // lights or shadow casters; each finding has a recognizable physical source.
    box('display-bezel',[2,1.7,4],[2.2,1.3,.14],black);
    box('display-wall-mount',[2,1.4,4.15],[.8,.6,.14],steel);
    box('display-signal-line',[2,.9,4.05],[.03,1.2,.03],black);
    label('display-sign','DISPLAY / ROOM TEST',[2,2.65,4],2.5,.3);
    box('credenza',[-3,.48,3],[2,.95,.8],wood);
    for(const x of [-3.5,-2.5]){box('cabinet-door',[x,.48,2.58],[.94,.84,.035],steel);box('cabinet-pull',[x,.65,2.55],[.22,.025,.025],aluminium);}
    box('coupler',[-3,1.04,2.95],[.18,.08,.09],aluminium);
    box('coupler-lead-in',[-3.35,1.02,2.95],[.6,.025,.025],black);
    box('coupler-lead-out',[-2.65,1.02,2.95],[.6,.025,.025],black);
    label('coupler-sign','CREDENZA / INPUT B',[-3,1.7,3],2.7,.3);
    box('wall-input',[-4.7,.6,3],[.12,.2,.05],white);
    label('wall-input-sign','WALL / INPUT A',[-4.6,1.1,3],1.3,.2);
    box('phone-table',[-3,.72,-2],[1.5,.1,.7],wood);
    for(const x of [-3.6,-2.4])box('phone-table-leg',[x,.35,-2],[.06,.7,.55],steel);
    box('phone-base',[-3,.85,-2],[.4,.15,.24],black);box('phone-handset',[-3,.96,-2],[.42,.07,.1],steel);
    label('phone-sign','CLIENT / ROOM PHONE',[-3,1.8,-2],2.6,.3);
    box('kit-bench-top',[3,.72,-1],[1.5,.1,.6],wood);
    for(const x of [2.4,3.6])box('kit-bench-leg',[x,.35,-1],[.06,.7,.5],steel);
    label('kit-sign','REPLACEMENT KIT',[3,1.4,-1],2.3,.3);
    box('meeting-table-top',[0,.72,1],[1.4,.1,3],wood);
    for(const z of [-.2,2.2])box('table-pedestal',[0,.35,z],[.6,.7,.4],steel);
    for(const x of [-1.25,1.25])for(const z of [.2,1.8]){
      box('chair-seat',[x,.43,z],[.55,.12,.55],black);box('chair-back',[x,.78,z+.23],[.55,.65,.08],steel);
      cylinder('chair-column',[x,.22,z],.06,.4,aluminium);
    }
    box('service-exit',[0,1.3,-5.85],[2.4,2.6,.1],steel);
    label('service-exit-sign','VAN 3 / SHOP',[0,2.8,-5.75],2.4,.3,root,Math.PI);
    label('room-title','CONFERENCE ROOM 2B',[0,2.8,5.85],3,.4);
  } else {
    box('work-order-table',[-3,.9,1],[1.6,.1,.8],wood);for(const x of [-3.65,-2.35])box('table-leg',[x,.43,1],[.07,.86,.65],steel);
    box('work-order',[-3,.96,1],[.4,.02,.3],white);label('assignment-sign','TWO QUICK CARTS',[-3,2.6,2.7],3,.4);
    for(const x of [1,4]){box('cart-pallet',[x,.1,2],[1.25,.2,.8],wood);label(`cart-${x}`,x===1?'CART 1':'CART 2',[x,2.5,2.5],1.4,.3);}
    box('return-door',[0,1.3,-5.85],[2.4,2.6,.1],steel);label('return-sign','RETURN TO SHOP',[0,2.8,-5.75],2.4,.3,root,Math.PI);
    box('client-table',[2,.72,4.4],[3.7,.1,1.1],wood);
  }
  for(const [m,parts] of batches) {
    if(!parts.length)continue;const merged=Mesh.MergeMeshes(parts,true,true,undefined,false,false);
    if(merged){merged.name=`field/${m.name}`;merged.parent=root;merged.isPickable=false;merged.receiveShadows=true;}
  }
  return {focus:(_value:boolean)=>{}};
}
