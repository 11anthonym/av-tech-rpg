// Original parameterized shop art. Metres; collision remains in world/shop.ts.
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { VertexData } from "@babylonjs/core/Meshes/mesh.vertexData";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import { PBRMaterial } from "@babylonjs/core/Materials/PBR/pbrMaterial";
import { DynamicTexture } from "@babylonjs/core/Materials/Textures/dynamicTexture";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import type { Scene } from "@babylonjs/core/scene";
type V = readonly [number, number, number];

export function createShopArt(scene: Scene, root: TransformNode) {
  const batches = new Map<PBRMaterial, Mesh[]>();
  const material = (name: string, color: string, roughness = 0.7, metallic = 0) => {
    const m = new PBRMaterial(name, scene);
    m.albedoColor = Color3.FromHexString(color); m.roughness = roughness; m.metallic = metallic;
    return m;
  };
  const steel = material("powder-coated-steel", "#343d43", 0.48, 0.65);
  const aluminium = material("rack-rails", "#9ba4a7", 0.32, 0.85);
  const black = material("equipment-ABS", "#161c21", 0.52, 0.12);
  const rubber = material("rubber", "#171a1d", 0.95);
  const wood = material("laminated-bench", "#a38252", 0.72);
  const carton = material("corrugated-cardboard", "#947044", 0.96);
  const tape = material("packing-tape", "#c5ab78", 0.48);
  const white = material("van-enamel", "#e1e3df", 0.3, 0.3);
  const glass = material("tinted-cab-glass", "#203f4e", 0.15, 0.48);
  const yellow = material("safety-yellow", "#d9ac35", 0.7);
  const concrete = material("sealed-concrete", "#747a79", 0.9);
  const wall = material("painted-masonry", "#acb3ad", 0.88);
  const brick = material("masonry-joints", "#89918c", 0.9);
  const green = material("equipment-status-green", "#7cb994", 0.4);
  green.emissiveColor = Color3.FromHexString("#43865b");
  const warm = material("task-diffuser", "#fff0d5", 0.6);
  warm.emissiveColor.set(0.75, 0.69, 0.52);

  // Deterministic original surface maps: subtle concrete aggregate, cardboard
  // fibres and laminated wood grain. No downloaded texture/AI dependencies.
  function surface(m: PBRMaterial, kind: "concrete" | "wood" | "carton", tile: number) {
    const t = new DynamicTexture(`${kind}-original-surface`, 256, scene, true);
    const ctx = t.getContext(); const image = ctx.getImageData(0, 0, 256, 256);
    let seed = 24681357;
    for (let y = 0; y < 256; y++) for (let x = 0; x < 256; x++) {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      const noise = (seed >>> 24) / 255;
      const value = kind === "wood" ? 190 + Math.sin(y * 0.45 + Math.sin(x * 0.03) * 1.3) * 14 + noise * 18
        : kind === "carton" ? 213 + noise * 25 : 192 + noise * 40;
      const i = (y * 256 + x) * 4;
      image.data[i] = image.data[i + 1] = image.data[i + 2] = value; image.data[i + 3] = 255;
    }
    ctx.putImageData(image, 0, 0); t.update(); t.uScale = t.vScale = tile;
    m.albedoTexture = t;
  }
  surface(concrete, "concrete", 12); surface(wood, "wood", 3); surface(carton, "carton", 1);
  const finish = (mesh: Mesh, m: PBRMaterial, parent = root) => {
    mesh.material = m; mesh.parent = parent; mesh.isPickable = false; mesh.receiveShadows = true;
    const list = batches.get(m) ?? []; list.push(mesh); batches.set(m, list); return mesh;
  };
  function box(name: string, p: V, size: V, m: PBRMaterial, parent = root) {
    const mesh = finish(MeshBuilder.CreateBox(name, { width: size[0], height: size[1], depth: size[2] }, scene), m, parent);
    mesh.position.set(...p); return mesh;
  }
  function cylinder(name: string, p: V, diameter: number, height: number, m: PBRMaterial, parent = root) {
    const mesh = finish(MeshBuilder.CreateCylinder(name, { diameter, height, tessellation: 16 }, scene), m, parent);
    mesh.position.set(...p); return mesh;
  }
  const inks = new Map<string, PBRMaterial>();
  function label(name: string, text: string, p: V, width: number, height: number, parent = root, yaw = 0) {
    let m = inks.get(text);
    if (!m) {
    m = material(`${name}-ink`, "#ffffff", 0.9);
    const texture = new DynamicTexture(`${name}-print`, { width: 1024, height: 256 }, scene, true);
    const ctx = texture.getContext(); ctx.fillStyle = "#202e34"; ctx.fillRect(0, 0, 1024, 256);
    ctx.fillStyle = "#e5b54e"; ctx.fillRect(0, 0, 16, 256);
    texture.drawText(text, null, 160, "bold 70px sans-serif", "#edf0e7", null, true);
    m.albedoTexture = texture; m.emissiveColor.set(0.12, 0.12, 0.12);
    inks.set(text, m);
    }
    const mesh = finish(MeshBuilder.CreatePlane(name, { width, height, sideOrientation: Mesh.DOUBLESIDE }, scene), m, parent);
    mesh.position.set(...p); mesh.rotation.y = yaw; return mesh;
  }
  box("concrete-slab", [0, -0.1, 1], [18, 0.2, 16], concrete);
  for (const z of [-7, 9]) box("masonry-wall", [0, 1.6, z], [18, 3.2, 0.25], wall);
  for (const x of [-9, 9]) box("masonry-wall", [x, 1.6, 1], [0.25, 3.2, 16], wall);
  for (const z of [-6.85, 8.85]) {
    box("wall-kick-plate", [0, 0.18, z], [17.7, 0.35, 0.025], steel);
    for (let y = 0.5; y < 3.1; y += 0.4) box("masonry-course", [0, y, z], [17.7, 0.008, 0.012], brick);
  }
  // Overhead structural steel and strip diffusers; the shop has an open roof
  // for the follow camera, with wall-mounted light fittings at realistic scale.
  for (const x of [-6, 0, 6]) {
    box("roof-beam", [x, 3.14, 1], [0.12, 0.12, 15.7], steel);
    for (const z of [-3, 3, 7]) {
      box("strip-housing", [x, 3.02, z], [1.3, 0.09, 0.22], aluminium);
      box("strip-diffuser", [x, 2.966, z], [1.22, 0.012, 0.16], warm);
    }
  }
  // Bench matches the M1 3 x 1 x 1m interaction/collision envelope.
  box("bench-top", [0, 0.955, 0], [3, 0.09, 1], wood);
  for (const x of [-1.35, 1.35]) for (const z of [-0.36, 0.36]) box("bench-leg", [x, 0.45, z], [0.09, 0.9, 0.09], steel);
  box("bench-bottom-shelf", [0, 0.22, 0], [2.75, 0.05, 0.8], steel);
  box("bench-front-apron", [0, 0.82, -0.44], [2.85, 0.15, 0.04], steel);
  const focusStrip = box("bench-focus-strip", [0, 0.91, -0.505], [2.95, 0.025, 0.012], yellow);
  label("bench-label", "01  /  SERVICE BENCH", [0, 0.82, -0.467], 0.95, 0.12);
  // Equipment under repair: a rack receiver, patch panel, laptop and cable.
  box("bench-receiver", [-0.64, 1.12, 0.08], [0.48, 0.22, 0.3], black);
  for (let i = 0; i < 8; i++) box("receiver-vent", [-0.82 + i * 0.047, 1.12, -0.074], [0.018, 0.12, 0.006], aluminium);
  box("receiver-display", [-0.64, 1.14, -0.079], [0.14, 0.035, 0.007], glass);
  cylinder("receiver-power", [-0.46, 1.1, -0.08], 0.025, 0.012, green).rotation.x = Math.PI / 2;
  box("laptop-keyboard", [0.05, 1.018, 0.06], [0.33, 0.025, 0.24], aluminium);
  const screen = box("laptop-screen", [0.05, 1.14, 0.18], [0.33, 0.23, 0.015], black); screen.rotation.x = -0.18;
  box("laptop-display", [0.05, 1.14, 0.168], [0.29, 0.185, 0.004], glass).rotation.x = -0.18;
  for (let i = 0; i < 3; i++) {
    const loop = finish(MeshBuilder.CreateTorus("coiled-patch-lead", { diameter: 0.2 + i * 0.015, thickness: 0.014, tessellation: 24 }, scene), rubber);
    loop.position.set(0.55, 1.02 + i * 0.012, -0.18);
  }
  // Metal staging shelf: rails, shelf lips, cartons and tape seams.
  for (const x of [-6.92, -4.08]) for (const z of [4.66, 5.34]) box("shelf-upright", [x, 1, z], [0.055, 2, 0.055], steel);
  function cartonAt(p: V, size: V) {
    box("staging-carton", p, size, carton);
    box("carton-tape", [p[0], p[1] + size[1] / 2 + 0.002, p[2]], [0.07, 0.004, size[2]], tape);
    box("carton-seal", [p[0], p[1], p[2] - size[2] / 2 - 0.002], [0.07, size[1], 0.004], tape);
    label("carton-shipping-label", "AV / STAGING", [p[0] - size[0] * 0.2, p[1], p[2] - size[2] / 2 - 0.005], Math.min(0.28, size[0] * 0.4), 0.07);
  }
  for (let y = 0.12; y <= 2.02; y += 0.62) {
    box("shelf-pan", [-5.5, y, 5], [2.85, 0.045, 0.75], aluminium);
    for (let i = 0; i < 3; i++) cartonAt([-6.4 + i * 0.9, y + 0.23, 5], [0.7, 0.42, 0.6]);
  }
  label("staging-sign", "STAGING  /  CHECK BEFORE LOADING", [-5.5, 2.84, 8.84], 4, 0.32);
  // Dispatch/supply counter stays within the authored footprint.
  box("dispatch-cabinet", [-5.5, 0.56, -2], [2.45, 1.12, 0.95], steel);
  box("dispatch-top", [-5.5, 1.17, -2], [2.5, 0.06, 1], wood);
  for (const x of [-6.3, -5.5, -4.7]) {
    box("cabinet-door", [x, 0.58, -2.485], [0.74, 1.02, 0.025], aluminium);
    box("cabinet-pull", [x + 0.24, 0.87, -2.515], [0.025, 0.15, 0.04], steel);
  }
  box("dispatch-monitor", [-5.5, 1.49, -1.8], [0.59, 0.34, 0.035], black);
  box("dispatch-screen", [-5.5, 1.49, -1.825], [0.55, 0.3, 0.008], glass);
  box("monitor-stand", [-5.5, 1.28, -1.8], [0.06, 0.2, 0.06], aluminium);
  label("dispatch-sign", "TRUNKSLAMMER  /  AV SERVICE", [-8.84, 2.55, -1.5], 3.5, 0.35, root, -Math.PI / 2);
  // Two 42U racks occupy the rear equipment zone, with matching simple
  // collision added by the area adapter rather than dozens of tiny colliders.
  for (const x of [-1.25, -0.45]) {
    for (const xx of [x - 0.29, x + 0.29]) for (const z of [7.55, 8.25]) box("rack-post", [xx, 1, z], [0.045, 1.96, 0.045], steel);
    for (const y of [0.08, 1.97]) box("rack-end", [x, y, 7.9], [0.64, 0.06, 0.8], steel);
    for (const xx of [x - 0.235, x + 0.235]) {
      box("19-inch-rail", [xx, 1.02, 7.52], [0.028, 1.85, 0.02], aluminium);
      for (let u = 0; u < 42; u++) box("rack-mount-hole", [xx, 0.12 + u * 0.044, 7.507], [0.012, 0.016, 0.004], black);
    }
    for (let u = 0; u < 7; u++) {
      const y = 0.28 + u * 0.23;
      box("AV-rack-unit", [x, y, 7.82], [0.45, 0.19, 0.56], black);
      box("AV-unit-face", [x, y, 7.523], [0.48, 0.19, 0.02], steel);
      for (let port = 0; port < 8; port++) box("patch-port", [x - 0.17 + port * 0.046, y + 0.025, 7.507], [0.025, 0.022, 0.01], black);
      box("status-led", [x + 0.18, y - 0.05, 7.506], [0.012, 0.01, 0.008], green);
    }
    label("rack-label", "AV SYSTEMS / RACK", [x, 1.86, 7.493], 0.46, 0.065);
  }
  label("rack-zone-sign", "SYSTEMS TEST  /  19-INCH RACKS", [-0.8, 2.7, 8.84], 3.7, 0.32);
  // Mobile display cart and a cable reel: reusable AV kit at real scale.
  box("display-cart-base", [-3.1, 0.18, 1.6], [1.1, 0.06, 0.65], steel);
  for (const x of [-3.55, -2.65]) for (const z of [1.36, 1.84]) {
    const wheel = cylinder("cart-castor", [x, 0.075, z], 0.14, 0.045, rubber); wheel.rotation.z = Math.PI / 2;
    box("castor-yoke", [x, 0.14, z], [0.07, 0.1, 0.05], aluminium);
  }
  for (const x of [-3.42, -2.78]) box("display-cart-upright", [x, 0.83, 1.69], [0.055, 1.3, 0.055], steel);
  box("cart-equipment-shelf", [-3.1, 0.65, 1.6], [0.95, 0.035, 0.53], aluminium);
  box("display-frame", [-3.1, 1.47, 1.65], [1.22, 0.71, 0.065], black);
  box("display-panel", [-3.1, 1.47, 1.612], [1.17, 0.655, 0.012], glass);
  label("display-test-screen", "AV  /  SIGNAL CHECK", [-3.1, 1.47, 1.603], 0.95, 0.23);
  for (const x of [-3.3, -2.9]) {
    const flange = cylinder("cable-reel-flange", [x, 0.4, 1.5], 0.39, 0.025, wood); flange.rotation.z = Math.PI / 2;
  }
  cylinder("reel-cable", [-3.1, 0.4, 1.5], 0.31, 0.37, rubber).rotation.z = Math.PI / 2;
  cylinder("reel-core", [-3.1, 0.4, 1.5], 0.08, 0.45, aluminium).rotation.z = Math.PI / 2;
  // Handle/latches give the retained imported M1 case a readable toolcase silhouette.
  box("case-handle-top", [0.8, 1.34, 0], [0.18, 0.025, 0.035], black);
  for (const x of [0.71, 0.89]) box("case-handle-mount", [x, 1.315, 0], [0.025, 0.06, 0.035], black);
  for (const x of [0.68, 0.92]) box("toolcase-latch", [x, 1.2, -0.155], [0.05, 0.07, 0.02], aluminium);
  // Van #3: shaped body/cab, glazing, tyres, hubs, bumpers and rear hardware.
  const van = new TransformNode("van3-art", scene); van.parent = root; van.position.set(5.8, 0, 4.5);
  const profile: [number, number][] = [[0.5,-2.4],[1,-2.4],[1.12,-1.85],[2.05,-1.15],[2.18,-0.7],[2.18,2.2],[2.02,2.4],[0.5,2.4]];
  const positions: number[] = []; const indices: number[] = [];
  for (const x of [-1.02, 1.02]) for (const [y,z] of profile) positions.push(x,y,z);
  const n = profile.length;
  for (let i = 1; i < n - 1; i++) { indices.push(0,i+1,i,n,n+i,n+i+1); }
  for (let i = 0; i < n; i++) { const j = (i+1)%n; indices.push(i,j,n+j,i,n+j,n+i); }
  const body = new Mesh("van-shaped-body", scene); const data = new VertexData(); const normals: number[] = [];
  VertexData.ComputeNormals(positions, indices, normals); data.positions=positions; data.indices=indices; data.normals=normals;
  data.uvs = Array.from({ length: positions.length / 3 * 2 }, () => 0); data.applyToMesh(body);
  body.convertToFlatShadedMesh(); finish(body, white, van);
  box("van-windscreen", [0, 1.59, -1.535], [1.86, 1.1, 0.025], glass, van).rotation.x = 0.79;
  for (const x of [-1.032, 1.032]) {
    box("cab-side-window", [x, 1.65, -0.94], [0.018, 0.66, 0.66], glass, van);
    box("cargo-door-seam", [x, 1.38, 0.45], [0.016, 1.45, 0.012], steel, van);
    box("van-door-handle", [x * 1.015, 1.28, -0.42], [0.035, 0.045, 0.18], black, van);
    box("cargo-door-handle", [x * 1.015, 1.28, 0.67], [0.035, 0.045, 0.22], black, van);
    box("wing-mirror-arm", [x * 1.025, 1.41, -1.28], [0.1, 0.04, 0.12], black, van);
    box("wing-mirror", [x * 1.045, 1.48, -1.35], [0.09, 0.2, 0.12], black, van);
    for (const z of [-1.48, 1.53]) {
      const tyre = cylinder("van-tyre", [x * 0.99, 0.4, z], 0.72, 0.15, rubber, van); tyre.rotation.z = Math.PI/2;
      const hub = cylinder("van-hub", [x * 1.055, 0.4, z], 0.4, 0.035, aluminium, van); hub.rotation.z = Math.PI/2;
      const cap = cylinder("van-hub-cap", [x * 1.075, 0.4, z], 0.14, 0.04, steel, van); cap.rotation.z = Math.PI/2;
    }
    label("van-fleet-livery", "TRUNKSLAMMER  /  VAN 3", [x * 1.005, 1.73, 1.05], 1.45, 0.23, van, x < 0 ? -Math.PI/2 : Math.PI/2);
  }
  for (const z of [-2.42, 2.42]) box("van-bumper", [0, 0.63, z], [2.13, 0.23, 0.08], black, van);
  box("van-front-grille", [0, 0.89, -2.411], [1.05, 0.2, 0.025], steel, van);
  for (const x of [-0.78, 0.78]) {
    box("van-headlamp", [x, 0.98, -2.412], [0.35, 0.14, 0.028], warm, van);
    box("rear-light", [x, 1, 2.409], [0.14, 0.38, 0.02], material(`rear-lamp-${x}`, "#a33e2b", 0.28), van);
    for (const y of [0.94, 1.76]) box("rear-door-hinge", [x, y, 2.414], [0.11, 0.06, 0.04], aluminium, van);
  }
  box("rear-door-division", [0, 1.36, 2.412], [0.012, 1.47, 0.016], steel, van);
  label("van-rear-number", "VAN 3  /  AV SERVICE", [0, 1.57, 2.425], 1.5, 0.24, van, Math.PI);
  box("rear-lock", [0.1, 1.17, 2.432], [0.2, 0.05, 0.025], black, van);
  for (const x of [-0.7, 0, 0.7]) box("van-roof-rib", [x, 2.19, 0.8], [0.035, 0.02, 2.65], white, van);
  // Clear, marked loading aisle (decorative, no new loading action in M2).
  for (const x of [4.35, 7.25]) box("loading-lane", [x, 0.006, 4.45], [0.055, 0.008, 7.4], yellow);
  label("loading-bay-sign", "VAN 3  /  LOADING BAY", [5.8, 2.7, 8.84], 3.2, 0.32);
  const focusedMaterial = yellow.clone("bench-focus-yellow"); focusStrip.material = focusedMaterial;
  batches.set(yellow, batches.get(yellow)!.filter(mesh => mesh !== focusStrip));
  // Bake original geometry by material, keeping draw calls bounded. This is
  // render-only; authored broad-phase colliders never enter the merge.
  const merged: Mesh[] = [];
  for (const [m, parts] of batches) {
    if (!parts.length) continue;
    const mesh = Mesh.MergeMeshes(parts, true, true, undefined, false, false);
    if (mesh) { mesh.name = `shop-art/${m.name}`; mesh.parent = root; mesh.isPickable = false; mesh.receiveShadows = true; merged.push(mesh); }
  }
  return { meshes: [...merged, focusStrip], focus(value: boolean) { focusedMaterial.emissiveColor.set(value ? 0.32 : 0, value ? 0.21 : 0, 0); } };
}
