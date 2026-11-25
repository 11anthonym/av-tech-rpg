import test from 'node:test';
import assert from 'node:assert/strict';
import {NullEngine} from '@babylonjs/core/Engines/nullEngine.js';
import {Scene} from '@babylonjs/core/scene.js';
import {MeshBuilder} from '@babylonjs/core/Meshes/meshBuilder.js';
import {Vector3} from '@babylonjs/core/Maths/math.vector.js';
import {conference} from '../src/world/areas.ts';
import {selectInteraction} from '../src/world/interactions.ts';
import {shop} from '../src/world/shop.ts';
import {CharacterController} from '../src/player/controller.ts';
import {TransformNode} from '@babylonjs/core/Meshes/transformNode.js';
import {FreeCamera} from '@babylonjs/core/Cameras/freeCamera.js';
import type {TechnicianVisual} from '../src/player/visual.ts';
import '@babylonjs/core/Collisions/collisionCoordinator.js';

test('the captured back-wall cargo position recovers the real van prompt by walking toward the rear doors',()=>{
  const engine=new NullEngine(),scene=new Scene(engine);scene.collisionsEnabled=true;
  new FreeCamera('camera',new Vector3(0,2,-6),scene);
  for(const prop of shop.props){
    const mesh=MeshBuilder.CreateBox(prop.id,{width:prop.size[0],height:prop.size[1],depth:prop.size[2]},scene);
    mesh.position.set(...prop.position);mesh.checkCollisions=prop.solid;mesh.metadata={blocksSight:prop.solid};
    const target=shop.interactions.find(t=>t.meshId===prop.id);if(target)mesh.metadata.interactionId=target.id;
    mesh.computeWorldMatrix(true);
  }
  const root=new TransformNode('visual',scene);
  const visual={root,setMotion:()=>{},setCarrying:()=>{},snapshot:()=>({})} as unknown as TechnicianVisual;
  const player=new CharacterController(scene,[6.528970028335948,.92,8.572000040300253],visual);
  try {
    assert.equal(selectInteraction(scene,player.position,shop.interactions),undefined);
    for(let frame=0;frame<20;frame++){for(let step=0;step<15;step++)player.step({x:0,z:-1},0,1/60,true);scene.render();}
    assert.equal(selectInteraction(scene,player.position,shop.interactions)?.actionId,'shop.load-van');
    assert(player.position.z>=6.69,'The rear-door collision must stop a late release.');
  }finally{scene.dispose();engine.dispose();}
});

test('the work order keeps focus near its table; the parts bay remains independently usable',()=>{
  const engine=new NullEngine(),scene=new Scene(engine);
  for(const prop of conference.props){
    const mesh=MeshBuilder.CreateBox(prop.id,{width:prop.size[0],height:prop.size[1],depth:prop.size[2]},scene);
    mesh.position.set(...prop.position);mesh.metadata={blocksSight:prop.solid};
    const target=conference.interactions.find(t=>t.meshId===prop.id);if(target)mesh.metadata.interactionId=target.id;
    mesh.computeWorldMatrix(true);
  }
  try {
    for(const x of [-3.6,-3.4,-3])assert.equal(selectInteraction(scene,new Vector3(x,.92,-.6),conference.interactions)?.actionId,'conference.review-assignment');
    assert.equal(selectInteraction(scene,new Vector3(-4.9,.92,-1.4),conference.interactions)?.actionId,'conference.pickup-part');
    // A real obstruction before the anchor must still block the action.
    const blocker=MeshBuilder.CreateBox('temporary-obstruction',{width:2,height:3,depth:.12},scene);
    blocker.position.set(-4.7,1.5,-1.9);blocker.metadata={blocksSight:true};blocker.computeWorldMatrix(true);
    assert.equal(selectInteraction(scene,new Vector3(-4.9,.92,-2.4),conference.interactions),undefined);
  }finally{scene.dispose();engine.dispose();}
});
