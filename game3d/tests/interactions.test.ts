import test from 'node:test';
import assert from 'node:assert/strict';
import {NullEngine} from '@babylonjs/core/Engines/nullEngine.js';
import {Scene} from '@babylonjs/core/scene.js';
import {MeshBuilder} from '@babylonjs/core/Meshes/meshBuilder.js';
import {Vector3} from '@babylonjs/core/Maths/math.vector.js';
import {conference} from '../src/world/areas.ts';
import {selectInteraction} from '../src/world/interactions.ts';

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
