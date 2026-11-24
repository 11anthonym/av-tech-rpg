import test from 'node:test';
import assert from 'node:assert/strict';
import { NullEngine } from '@babylonjs/core/Engines/nullEngine.js';
import { Scene } from '@babylonjs/core/scene.js';
import { FreeCamera } from '@babylonjs/core/Cameras/freeCamera.js';
import { Vector3 } from '@babylonjs/core/Maths/math.vector.js';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode.js';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder.js';
import '@babylonjs/core/Collisions/collisionCoordinator.js';
import { CharacterController } from '../src/player/controller.ts';
import type { TechnicianVisual } from '../src/player/visual.ts';
import { shop } from '../src/world/shop.ts';

test('repeated collision substeps settle at the same bench with an idle gait', () => {
  for(const stepsPerRender of [1,6,15]) {
    const engine=new NullEngine(), scene=new Scene(engine); scene.collisionsEnabled=true;
    new FreeCamera('test-camera',new Vector3(0,2,-6),scene);
    const bench=MeshBuilder.CreateBox('bench',{width:3,height:1,depth:1},scene);
    bench.position.y=.5; bench.checkCollisions=true; bench.computeWorldMatrix(true);
    const root=new TransformNode('visual',scene); let speed=0;
    const visual={root,setMotion:(value:number)=>{speed=value;},setCarrying:()=>{},snapshot:()=>({speed})} as unknown as TechnicianVisual;
    const player=new CharacterController(scene,[0,.92,-4],visual);
    try {
      for(let frame=0;frame<Math.ceil(360/stepsPerRender);frame++) {
        for(let step=0;step<stepsPerRender;step++) player.step({x:0,z:1},0,1/60);
        scene.render();
      }
      assert(player.position.z<-.7 && player.position.z>-.85,`${stepsPerRender} steps: ${player.position.asArray()}`);
      assert(speed<.08,`${stepsPerRender} steps: collision speed ${speed}`);
    } finally { scene.dispose();engine.dispose(); }
  }
});

test('the staging aisle tolerates half a metre of key-release travel',()=>{
  const bench=shop.props.find(p=>p.id==='workbench')!,cart=shop.props.find(p=>p.id==='display-cart')!;
  const clearWidth=(bench.position[0]-bench.size[0]/2-.3)-(cart.position[0]+cart.size[0]/2+.3);
  assert(clearWidth>=1.4,`Pedestrian centre clearance is ${clearWidth}m`);
  const engine=new NullEngine(),scene=new Scene(engine);scene.collisionsEnabled=true;
  new FreeCamera('test-camera',new Vector3(0,2,-6),scene);
  for(const prop of shop.props.filter(p=>p.solid)){const mesh=MeshBuilder.CreateBox(prop.id,{width:prop.size[0],height:prop.size[1],depth:prop.size[2]},scene);
    mesh.position.set(...prop.position);mesh.checkCollisions=true;mesh.computeWorldMatrix(true);}
  const root=new TransformNode('visual',scene);
  const visual={root,setMotion:()=>{},setCarrying:()=>{},snapshot:()=>({})} as unknown as TechnicianVisual;
  const player=new CharacterController(scene,[-2.7+.5,.92,-4],visual);
  try {for(let frame=0;frame<22;frame++){for(let step=0;step<15;step++)player.step({x:0,z:1},0,1/60);scene.render();}
    assert(player.position.z>3.4,`Stuck before staging at ${player.position.asArray()}`);
  }finally{scene.dispose();engine.dispose();}
});
