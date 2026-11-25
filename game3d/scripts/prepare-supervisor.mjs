// Pinned Rocketbox/Avatar Studio source; all runtime data is bundled offline.
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {NodeIO} from '@gltf-transform/core';
import {ALL_EXTENSIONS} from '@gltf-transform/extensions';
import {dedup,prune,resample,unweld,tangents,weld,textureCompress} from '@gltf-transform/functions';
import {generateTangents} from 'mikktspace';
import sharp from 'sharp';
import validator from 'gltf-validator';
const base=fileURLToPath(new URL('../',import.meta.url));
const revision='2fd9ec82fbe1613d40ae38aadcca3f410725f740';
const url=`https://raw.githubusercontent.com/memoriesrohit/avatar-studio/${revision}/models/marcus_formal.glb`;
const sourceHash='0c8f874406273ca34df4c246ffc609ebf35b4d424911316ecf0154f7f07135d5';
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const input=process.argv.find(arg=>arg.endsWith('.glb'));
const bytes=input?await fs.readFile(input):new Uint8Array(await (await fetch(url)).arrayBuffer());
if(hash(bytes)!==sourceHash)throw Error('Supervisor source SHA-256 mismatch');
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS),doc=await io.readBinary(new Uint8Array(bytes)),root=doc.getRoot();
if(process.argv.includes('--inspect')){
  console.log(JSON.stringify({sourceHash:hash(bytes),nodes:root.listNodes().filter(n=>n.getMesh()).map(n=>({name:n.getName(),vertices:n.getMesh().listPrimitives().reduce((n,p)=>n+p.getAttribute('POSITION').getCount(),0)})),joints:root.listSkins().map(s=>s.listJoints().length),animations:root.listAnimations().map(a=>a.getName())},null,2));process.exit(0);
}
// Outfit selection is reviewed from the pinned source, then fixed here.
const outfit=['Body','Outfit_original','Shoes','Skin_original'];
if(!outfit.every(name=>root.listNodes().some(node=>node.getName()===name&&node.getMesh())))throw Error('Pinned supervisor outfit changed');
const rig=root.listNodes().find(n=>n.getName()==='Rig');
if(!rig||JSON.stringify(rig.getTranslation())!=='[0,0,0]'||JSON.stringify(rig.getScale())!=='[1,1,1]')throw Error('Unexpected supervisor rig transform');
for(const node of [...root.listNodes()])if(node.getMesh()){
  if(!outfit.includes(node.getName()))node.dispose();else {rig.removeChild(node);root.listScenes()[0].addChild(node);}
}
for(const mesh of root.listMeshes()){
  for(const primitive of mesh.listPrimitives())for(const target of primitive.listTargets()){primitive.removeTarget(target);target.dispose();}
  mesh.setWeights([]);mesh.setExtras({});
}
for(const node of root.listNodes())node.setWeights([]);
for(const animation of [...root.listAnimations()])if(animation.getName()!=='Idle'){
  const samplers=animation.listSamplers();for(const channel of animation.listChannels())channel.dispose();for(const sampler of samplers)sampler.dispose();animation.dispose();
}
await doc.transform(resample(),dedup(),prune(),unweld(),tangents({generateTangents}),weld());
let repairedTangents=0;
for(const mesh of root.listMeshes())for(const primitive of mesh.listPrimitives()){
  const tangent=primitive.getAttribute('TANGENT'),normal=primitive.getAttribute('NORMAL'),values=tangent.getArray(),normals=normal.getArray();
  for(let i=0;i<values.length/4;i++)if(Math.hypot(values[i*4],values[i*4+1],values[i*4+2])<.5){
    const [nx,ny,nz]=normals.slice(i*3,i*3+3),v=Math.abs(ny)<.9?[-nz,0,nx]:[0,nz,-ny],length=Math.hypot(...v);values.set([...v.map(n=>n/length),1],i*4);repairedTangents++;
  }tangent.setArray(values);
}
await doc.transform(textureCompress({encoder:sharp,targetFormat:'webp',resize:[512,512],quality:88}));
const output=await io.writeBinary(doc),validation=await validator.validateBytes(output,{uri:'supervisor.glb'});
if(validation.issues.numErrors)throw Error(JSON.stringify(validation.issues.messages));
const body=root.listNodes().find(n=>n.getName()==='Body').getMesh();
const bodyPositions=body.listPrimitives()[0].getAttribute('POSITION').getArray();
const bodyHash=hash(new Uint8Array(bodyPositions.buffer,bodyPositions.byteOffset,bodyPositions.byteLength));
let decodedEstimate=0;const textures=[];
for(const texture of root.listTextures()){const m=await sharp(texture.getImage()).metadata();decodedEstimate+=m.width*m.height*4*4/3;textures.push({name:texture.getName(),width:m.width,height:m.height,bytes:texture.getImage().length});}
const report={identity:'supervisor-marcus-formal',source:{url,revision,sha256:hash(bytes),bytes:bytes.length},runtime:{file:'supervisor.glb',sha256:hash(output),bytes:output.length,outfit,meshes:root.listMeshes().length,joints:root.listSkins()[0].listJoints().length,animations:root.listAnimations().map(a=>a.getName()),bodyPositionSha256:bodyHash,repairedTangents,textures,estimatedDecodedRgba8MipBytes:Math.ceil(decodedEstimate)},validation};
await fs.mkdir(path.join(base,'../docs/qa/npc-identity'),{recursive:true});
await fs.writeFile(path.join(base,'public/assets/supervisor.glb'),output);
await fs.writeFile(path.join(base,'../docs/qa/npc-identity/supervisor-build.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({bytes:output.length,meshes:report.runtime.meshes,joints:report.runtime.joints,estimatedDecodedMiB:decodedEstimate/1024/1024}));
