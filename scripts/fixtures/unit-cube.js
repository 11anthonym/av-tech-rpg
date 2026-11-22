// Original one-metre binary glTF fixture shared by the engine probes.
// It exercises import and scale; it does not qualify a production art kit.
function makeGlb() {
  const points = [-0.5, -0.5, -0.5, 0.5, -0.5, -0.5, 0.5, 0.5, -0.5, -0.5, 0.5, -0.5,
    -0.5, -0.5, 0.5, 0.5, -0.5, 0.5, 0.5, 0.5, 0.5, -0.5, 0.5, 0.5];
  const indices = [0, 2, 1, 0, 3, 2, 4, 5, 6, 4, 6, 7, 0, 1, 5, 0, 5, 4,
    3, 7, 6, 3, 6, 2, 0, 4, 7, 0, 7, 3, 1, 2, 6, 1, 6, 5];
  const bin = Buffer.alloc(points.length * 4 + indices.length * 2);
  points.forEach((value, index) => bin.writeFloatLE(value, index * 4));
  indices.forEach((value, index) => bin.writeUInt16LE(value, points.length * 4 + index * 2));
  const gltf = {
    asset: { version: "2.0", generator: "AV Tech RPG feasibility probe" },
    scene: 0, scenes: [{ nodes: [0] }], nodes: [{ name: "OneMetreCube", mesh: 0 }],
    meshes: [{ primitives: [{ attributes: { POSITION: 0 }, indices: 1 }] }],
    buffers: [{ byteLength: bin.length }],
    bufferViews: [{ buffer: 0, byteOffset: 0, byteLength: points.length * 4, target: 34962 },
      { buffer: 0, byteOffset: points.length * 4, byteLength: indices.length * 2, target: 34963 }],
    accessors: [{ bufferView: 0, componentType: 5126, count: 8, type: "VEC3",
      min: [-0.5, -0.5, -0.5], max: [0.5, 0.5, 0.5] },
    { bufferView: 1, componentType: 5123, count: indices.length, type: "SCALAR" }],
  };
  let json = JSON.stringify(gltf);
  json += " ".repeat((4 - Buffer.byteLength(json) % 4) % 4);
  const jsonChunk = Buffer.from(json);
  const header = Buffer.alloc(12);
  header.writeUInt32LE(0x46546c67, 0);
  header.writeUInt32LE(2, 4);
  header.writeUInt32LE(12 + 8 + jsonChunk.length + 8 + bin.length, 8);
  const chunk = (length, type) => {
    const bytes = Buffer.alloc(8);
    bytes.writeUInt32LE(length, 0);
    bytes.writeUInt32LE(type, 4);
    return bytes;
  };
  return Buffer.concat([header, chunk(jsonChunk.length, 0x4e4f534a), jsonChunk,
    chunk(bin.length, 0x004e4942), bin]);
}

module.exports = { makeGlb };
