// Reproducible, offline-capable conversion. No animation retargeting or paid tools.
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { dedup, prune, resample, tangents, unweld, weld } from '@gltf-transform/functions';
import { generateTangents } from 'mikktspace';
import validator from 'gltf-validator';

const base = fileURLToPath(new URL('../', import.meta.url));
const revision = '2fd9ec82fbe1613d40ae38aadcca3f410725f740';
const sourceUrl = `https://raw.githubusercontent.com/memoriesrohit/avatar-studio/${revision}/models/andre_casual.glb`;
const expectedHash = '65c2dd49191505efe01546ff73dd98a0eada760059628612f1aa5e07785b2953';
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const bytes = process.argv[2] ? await fs.readFile(process.argv[2]) : new Uint8Array(await (await fetch(sourceUrl)).arrayBuffer());
if (hash(bytes) !== expectedHash) throw new Error('Source SHA-256 mismatch');
const before = await validator.validateBytes(new Uint8Array(bytes), { uri: 'andre_casual.glb' });
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
const doc = await io.readBinary(new Uint8Array(bytes));
const root = doc.getRoot();
const outfit = ['Body', 'Shoes', 'Skin_tee', 'Top_tee', 'Trousers'];
const rig = root.listNodes().find(n => n.getName() === 'Rig');
if (JSON.stringify(rig.getTranslation()) !== '[0,0,0]' || JSON.stringify(rig.getRotation()) !== '[0,0,0,1]' || JSON.stringify(rig.getScale()) !== '[1,1,1]') throw new Error('Unexpected rig root transform');
for (const node of root.listNodes()) {
  if (node.getMesh() && !outfit.includes(node.getName())) node.dispose();
  else if (node.getMesh()) { rig.removeChild(node); root.listScenes()[0].addChild(node); }
  if (node.getName() === 'Top_tee' || node.getName() === 'Trousers') {
    for (const primitive of node.getMesh().listPrimitives()) primitive.getMaterial()?.setBaseColorFactor(
      node.getName() === 'Top_tee' ? [0.08, 0.16, 0.23, 1] : [0.2, 0.22, 0.24, 1]);
  }
}
for (const mesh of root.listMeshes()) {
  for (const primitive of mesh.listPrimitives()) {
    for (const target of primitive.listTargets()) { primitive.removeTarget(target); target.dispose(); }
    if (mesh.getName() === 'Top_tee') primitive.getMaterial()?.setBaseColorFactor([0.08, 0.16, 0.23, 1]);
    if (mesh.getName() === 'Trousers') primitive.getMaterial()?.setBaseColorFactor([0.2, 0.22, 0.24, 1]);
  }
  mesh.setWeights([]);
  mesh.setExtras({});
}
for (const node of root.listNodes()) node.setWeights([]);
for (const animation of root.listAnimations()) {
  if (!['Idle', 'Walk'].includes(animation.getName())) {
    const samplers = animation.listSamplers();
    for (const channel of animation.listChannels()) channel.dispose();
    for (const sampler of samplers) sampler.dispose();
    animation.dispose(); continue;
  }
  // The controller owns world travel. Keep the native vertical gait, remove
  // horizontal root travel (1.213m per 1.2s) and its lateral starting offset.
  if (animation.getName() === 'Walk') for (const channel of animation.listChannels()) {
    if (channel.getTargetNode()?.getName() !== 'mixamorig:Hips' || channel.getTargetPath() !== 'translation') continue;
    const accessor = channel.getSampler().getOutput();
    const values = accessor.getArray().slice();
    for (let i = 0; i < values.length; i += 3) { values[i] = 0; values[i + 2] = 0; }
    accessor.setArray(values);
  }
}
await doc.transform(resample(), dedup(), prune(), unweld(), tangents({ generateTangents }), weld());
let degenerateTangents = 0;
for (const mesh of root.listMeshes()) for (const primitive of mesh.listPrimitives()) {
  const tangent = primitive.getAttribute('TANGENT'); const normal = primitive.getAttribute('NORMAL');
  const values = tangent.getArray(); const normals = normal.getArray();
  for (let i = 0; i < values.length / 4; i++) {
    if (Math.hypot(values[i*4], values[i*4+1], values[i*4+2]) > 0.5) continue;
    const [nx,ny,nz] = normals.slice(i*3, i*3+3);
    const v = Math.abs(ny) < 0.9 ? [-nz, 0, nx] : [0, nz, -ny]; const length = Math.hypot(...v);
    values.set([...v.map(n => n / length), 1], i*4); degenerateTangents++;
  }
  tangent.setArray(values);
}
const output = await io.writeBinary(doc);
const after = await validator.validateBytes(output, { uri: 'technician.glb' });
if (after.issues.numErrors) throw new Error(`Runtime GLB fails glTF validation: ${JSON.stringify(after.issues.messages)}`);
await fs.mkdir(path.join(base, 'public/assets'), { recursive: true });
await fs.mkdir(path.join(base, '../docs/qa/m2'), { recursive: true });
await fs.writeFile(path.join(base, 'public/assets/technician.glb'), output);
const report = {
  source: { url: sourceUrl, revision, sha256: hash(bytes), bytes: bytes.length },
  runtime: { file: 'technician.glb', sha256: hash(output), bytes: output.length,
    outfit, meshes: root.listMeshes().length, joints: root.listSkins()[0].listJoints().length, degenerateTangents,
    textures: root.listTextures().map(t => ({ name: t.getName(), mime: t.getMimeType(), size: t.getSize(), bytes: t.getImage()?.length })),
    animations: root.listAnimations().map(a => a.getName()),
    transforms: ['Retain tee, trousers, shoes, exposed skin and head', 'Remove unused garments, clips and facial morph targets', 'Tint work clothes', 'Remove Walk horizontal hip travel; preserve vertical gait', 'Move skinned meshes out of identity Rig parent', 'Resample/deduplicate/prune and generate MikkTSpace tangents; no geometry quantization'] },
  validation: Object.fromEntries([['source', before], ['runtime', after]].map(([name, result]) => [name, {
    errors: result.issues.numErrors, warnings: result.issues.numWarnings, infos: result.issues.numInfos,
    messages: result.issues.messages.filter(m => m.severity <= 1),
    codes: result.issues.messages.reduce((counts, m) => ({ ...counts, [m.code]: (counts[m.code] ?? 0) + 1 }), {}),
  }])),
};
await fs.writeFile(path.join(base, '../docs/qa/m2/character-build.json'), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({ sourceBytes: bytes.length, runtimeBytes: output.length, errors: after.issues.numErrors, warnings: after.issues.numWarnings, textures: report.runtime.textures.length }));
if (after.issues.numErrors) throw new Error('Runtime GLB fails glTF validation');
