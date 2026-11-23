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
