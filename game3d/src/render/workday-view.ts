import {TransformNode} from '@babylonjs/core/Meshes/transformNode';
import {Mesh} from '@babylonjs/core/Meshes/mesh';
import {MeshBuilder} from '@babylonjs/core/Meshes/meshBuilder';
import {PBRMaterial} from '@babylonjs/core/Materials/PBR/pbrMaterial';
import {Color3} from '@babylonjs/core/Maths/math.color';
import type {Scene} from '@babylonjs/core/scene';
import type {Session} from '../domain/session.ts';
import {workdayContent} from '../content/workday.ts';

// Independent, material-baked components stay switchable as domain work advances.
// No per-frame geometry, extra textures or physics-based cable simulation.
export function createWorkdayView(scene:Scene,character:TransformNode){
  const root=new TransformNode('workday-visuals',scene);
  const material=(name:string,color:string,metallic=0)=>{const m=new PBRMaterial(name,scene);m.albedoColor=Color3.FromHexString(color).toLinearSpace();m.roughness=.72;m.metallic=metallic;return m;};
  const steel=material('cart/steel','#515f66',.45),aluminium=material('cart/aluminium','#a3acb0',.65),rubber=material('cart/rubber','#121d21'),
    screen=material('cart/screen','#315868'),pack=material('component/packaging','#b79060');
  const component=(name:string,build:(add:(name:string,p:number[],size:number[],m:PBRMaterial)=>Mesh)=>void)=>{
    const node=new TransformNode(name,scene);node.parent=root;const batches=new Map<PBRMaterial,Mesh[]>();
    build((name,p,size,m)=>{const mesh=MeshBuilder.CreateBox(name,{width:size[0]!,height:size[1]!,depth:size[2]!},scene);mesh.position.set(p[0]!,p[1]!,p[2]!);mesh.material=m;
      if(!batches.has(m))batches.set(m,[]);batches.get(m)!.push(mesh);return mesh;});
    for(const parts of batches.values()){const mesh=Mesh.MergeMeshes(parts,true,true,undefined,false,false)!;mesh.parent=node;mesh.isPickable=false;mesh.receiveShadows=true;}
    return node;
  };
  const carts=[1,4].map((x,index)=>{
    const frame=component(`cart-${index+1}-frame`,add=>{
      add('base',[x,.3,2],[1.2,.08,.7],steel);add('shelf',[x,.85,2],[1,.06,.5],steel);
      for(const side of [-.5,.5]){add('upright',[x+side,1.1,2],[.045,1.8,.045],aluminium);
        for(const z of [1.7,2.3])add('caster',[x+side,.19,z],[.15,.18,.09],rubber);}
      add('mount-rail',[x,1.65,2],[1,.08,.06],aluminium);
    });
    const display=component(`cart-${index+1}-display`,add=>{
      add('display-back',[x,1.65,1.94],[1.5,.86,.09],rubber);add('display-panel',[x,1.65,1.885],[1.42,.78,.02],screen);
      add('conferencing-camera',[x,2.13,1.88],[.25,.07,.08],steel);add('camera-lens',[x,2.13,1.83],[.035,.035,.015],rubber);
      add('audio-bar',[x,1.17,1.88],[.75,.08,.09],rubber);
    });
    const tidy=component(`cart-${index+1}-dressed-cables`,add=>add('cable-trunk',[x+.4,1,1.96],[.025,1.1,.025],rubber));
    const loose=component(`cart-${index+1}-loose-cables`,add=>{add('cable-loop-side',[x+.6,.8,1.86],[.025,1.1,.025],rubber);add('cable-loop-base',[x+.4,.25,1.86],[.4,.025,.025],rubber);});
    return {frame,display,tidy,loose};
  });
  const held=workdayContent.assembly.map(part=>{const node=component(`carried/${part.id}`,add=>add('packaged-component',[0,0,0],part.id.endsWith('display')?[.7,.43,.12]:[.65,.35,.25],pack));node.parent=character;node.position.set(0,1.15,.35);return node;});
  let state:Session|undefined;
  return {update(s:Session){state=s;root.setEnabled(s.areaId==='centerCityConferenceRoom');
    carts.forEach((cart,i)=>{cart.frame.setEnabled(s.workday.assembled.includes(`cart-${i+1}-frame` as 'cart-1-frame'));
      const display=s.workday.assembled.includes(`cart-${i+1}-display` as 'cart-1-display');cart.display.setEnabled(display);
      cart.tidy.setEnabled(display&&s.workday.finishChoice==='tidy');cart.loose.setEnabled(display&&s.workday.finishChoice!=='tidy');});
    held.forEach((node,i)=>node.setEnabled(s.workday.carriedPart===workdayContent.assembly[i]!.id));
    screen.emissiveColor.setAll(s.workday.verified?.15:.03);
  },cameraOpacity(opacity:number){held.forEach(node=>node.getChildMeshes().forEach(mesh=>mesh.visibility=opacity));},
  snapshot:()=>({carts:carts.map((cart,i)=>({id:`cart${i+1}`,frame:cart.frame.isEnabled(),display:cart.display.isEnabled(),tidy:cart.tidy.isEnabled()})),held:state?.workday.carriedPart??null}),
  dispose(){held.forEach(node=>node.parent=root);root.dispose(false,true);}};
}
