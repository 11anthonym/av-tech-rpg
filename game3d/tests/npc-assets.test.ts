import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {NodeIO} from '@gltf-transform/core';
import {ALL_EXTENSIONS} from '@gltf-transform/extensions';
import {characterCast} from '../src/content/cast.ts';

const hash=(bytes:Uint8Array)=>createHash('sha256').update(bytes).digest('hex');
test('supervisor is a separate licensed head/outfit, with an asset-specific rig contract and bounded texture budget',async()=>{
  const report=JSON.parse(await fs.readFile(new URL('../../docs/qa/npc-identity/supervisor-build.json',import.meta.url),'utf8'));
  const bytes=await fs.readFile(new URL('../public/assets/supervisor.glb',import.meta.url));
  assert.equal(hash(bytes),report.runtime.sha256);assert.equal(bytes.length,report.runtime.bytes);assert(bytes.length<1000000);
  assert.equal(report.validation.issues.numErrors,0);assert(report.runtime.estimatedDecodedRgba8MipBytes<=16*1024*1024);
  assert(report.runtime.textures.every((t:{width:number;height:number})=>t.width<=512&&t.height<=512));
  const io=new NodeIO().registerExtensions(ALL_EXTENSIONS),npc=await io.readBinary(bytes),player=await io.read(fileURLToPath(new URL('../public/assets/technician.glb',import.meta.url)));
  assert.equal(npc.getRoot().listMeshes().length,characterCast.supervisor.meshes);
  assert.equal(npc.getRoot().listSkins()[0]!.listJoints().length,characterCast.supervisor.joints);
  assert.deepEqual(npc.getRoot().listAnimations().map(a=>a.getName()),['Idle']);
  const head=(doc:typeof npc)=>{
    const body=doc.getRoot().listNodes().find(n=>n.getName()==='Body')!.getMesh()!.listPrimitives()[0]!.getAttribute('POSITION')!.getArray()!;
    let top=-Infinity;for(let i=1;i<body.length;i+=3)top=Math.max(top,body[i]!);
    return [...new Set(Array.from({length:body.length/3},(_,i)=>i).filter(i=>body[i*3+1]!>top-.28)
      .map(i=>[body[i*3]!,body[i*3+1]!,body[i*3+2]!].map(v=>v.toFixed(5)).join(',')))].sort();
  };
  assert.notDeepEqual(head(npc),head(player),'A shirt hue change on Andre must not satisfy character identity');
  assert.deepEqual(report.runtime.outfit,['Body','Outfit_original','Shoes','Skin_original']);
  const notices=await fs.readFile(new URL('../public/assets/ASSET_LICENSES.md',import.meta.url),'utf8');
  assert.match(notices,/marcus_formal\.glb/);assert.match(notices,/Microsoft Rocketbox/);
});
