import {TransformNode} from '@babylonjs/core/Meshes/transformNode';
import type {Scene} from '@babylonjs/core/scene';
import {loadModel} from '../render/assets.ts';
import {characterCast} from '../content/cast.ts';
import type {CharacterSpec} from '../content/cast.ts';

export interface NpcVisual {
  place(position:readonly[number,number,number]):void;
  setVisible(value:boolean):void;
  snapshot():{identity:string;asset:string;meshes:number;joints:number;position:number[];visible:boolean;idleFrame:number;height:number};
  dispose():void;
}

// The app retains one cast member across portals. Each independently animated
// person needs one skeleton; this does not duplicate the player's textures or
// load a new actor on each scene change. Future roles can use the same adapter.
export async function createNpcVisual(scene:Scene,spec:CharacterSpec=characterCast.supervisor):Promise<NpcVisual>{
  const root=new TransformNode(spec.identity,scene);root.position.set(-5,0,-1);root.rotation.y=Math.PI;
  const model=new TransformNode(`${spec.identity}/model`,scene);model.parent=root;
  try {
    const asset=await loadModel(scene,spec.asset,model),idle=asset.animationGroups.find(group=>group.name==='Idle');
    const meshes=asset.meshes.filter(mesh=>mesh.getTotalVertices()>0),skeleton=asset.skeletons[0];
    if(!idle||meshes.length!==spec.meshes||asset.skeletons.length!==1||skeleton?.bones.length!==spec.joints||asset.animationGroups.length!==1){asset.dispose();throw Error(`${spec.identity} failed its rig/Idle/model contract`);}
    for(const mesh of asset.meshes){mesh.isPickable=false;mesh.checkCollisions=false;mesh.receiveShadows=true;mesh.computeWorldMatrix(true);}
    const bounds=model.getHierarchyBoundingVectors(true),height=bounds.max.y-bounds.min.y;
    if(!Number.isFinite(height)||height<1||height>3){asset.dispose();throw Error('Unexpected supervisor scale');}
    model.scaling.setAll(spec.height/height);model.position.y=-bounds.min.y*spec.height/height;idle.start(true,1);
    let visible=true;
    return {place(position){root.position.set(...position);},setVisible(value){
      if(value===visible)return;visible=value;root.setEnabled(value);if(value)idle.play(true);else idle.pause();
    },snapshot:()=>({identity:spec.identity,asset:spec.asset,meshes:meshes.length,joints:skeleton.bones.length,position:root.position.asArray(),visible,
      idleFrame:idle.getCurrentFrame(),height:spec.height}),dispose(){asset.dispose();root.dispose(false,true);}};
  }catch(error){root.dispose(false,true);throw error;}
}
