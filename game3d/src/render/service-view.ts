import {TransformNode} from '@babylonjs/core/Meshes/transformNode';
import {MeshBuilder} from '@babylonjs/core/Meshes/meshBuilder';
import {PBRMaterial} from '@babylonjs/core/Materials/PBR/pbrMaterial';
import {Color3} from '@babylonjs/core/Maths/math.color';
import type {Scene} from '@babylonjs/core/scene';
import type {Session} from '../domain/session.ts';

// Six small switchable meshes, shared materials, no extra textures or frame-loop work.
export function createServiceView(scene:Scene,character:TransformNode){
  const root=new TransformNode('service-installation',scene);
  const material=(name:string,color:string,metallic=0)=>{const m=new PBRMaterial(name,scene);m.albedoColor=Color3.FromHexString(color).toLinearSpace();m.roughness=.65;m.metallic=metallic;return m;};
  const pack=material('service/package','#ad8655'),metal=material('service/mount','#9ca8aa',.65),screen=material('service/screen','#253b46');
  const box=(name:string,p:number[],size:number[],m:PBRMaterial,parent=root)=>{const mesh=MeshBuilder.CreateBox(name,{width:size[0]!,height:size[1]!,depth:size[2]!},scene);mesh.parent=parent;mesh.position.set(p[0]!,p[1]!,p[2]!);mesh.material=m;mesh.isPickable=false;mesh.receiveShadows=true;return mesh;};
  const image=box('service/display-image',[2,1.7,3.92],[2.06,1.16,.02],screen);
  const rail=box('service/new-mount-rail',[2,1,3.95],[1.85,.07,.05],metal);
  const staged=[box('service/display-package',[3,1.1,-1],[1.5,.7,.25],pack),box('service/hardware-kit',[3,.95,-1.25],[.55,.36,.25],metal)];
  const held=[box('service/carried-display',[0,1.15,.35],[.7,.43,.12],pack,character),box('service/carried-hardware',[0,1.15,.35],[.55,.3,.25],metal,character)];
  let state:Session|undefined;
  return {update(s:Session){state=s;const p=s.service,visible=s.areaId==='serviceOffice';root.setEnabled(visible);
    ['replacement-display','mount-hardware'].forEach((id,i)=>{staged[i]!.setEnabled(!p?.installed.includes(id as 'replacement-display')&&p?.carried!==id);held[i]!.setEnabled(visible&&p?.carried===id);});
    rail.setEnabled(Boolean(p?.installed.includes('mount-hardware')));
    const verified=['confirmed','quick','recovered'].includes(p?.finalTest?.status??'');
    screen.albedoColor=Color3.FromHexString(verified?'#43877b':p?.installed.includes('replacement-display')?'#405c76':'#253b46').toLinearSpace();screen.emissiveColor.setAll(verified?.12:.025);
  },cameraOpacity(opacity:number){held.forEach(mesh=>mesh.visibility=opacity);},snapshot:()=>({held:state?.service?.carried??null,installed:[...(state?.service?.installed??[])],screen:state?.service?.finalTest?.status??'untested',staged:staged.map(m=>m.isEnabled())}),
    dispose(){held.forEach(mesh=>mesh.parent=root);root.dispose(false,true);image.dispose();}};
}
