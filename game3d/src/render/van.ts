// Original Van #3 geometry shared by the shop and garage; no new asset download.
import { Mesh } from '@babylonjs/core/Meshes/mesh.js';
import { VertexData } from '@babylonjs/core/Meshes/mesh.vertexData.js';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode.js';
import type { PBRMaterial } from '@babylonjs/core/Materials/PBR/pbrMaterial.js';
import type { Scene } from '@babylonjs/core/scene.js';
type V=readonly[number,number,number];
export interface ArtBuilders {
 box(name:string,p:V,size:V,m:PBRMaterial,parent?:TransformNode):Mesh;
 cylinder(name:string,p:V,diameter:number,height:number,m:PBRMaterial,parent?:TransformNode):Mesh;
 label(name:string,text:string,p:V,width:number,height:number,parent?:TransformNode,yaw?:number):Mesh;
 finish(mesh:Mesh,m:PBRMaterial,parent?:TransformNode):Mesh;
 material(name:string,color:string,roughness?:number,metallic?:number):PBRMaterial;
}
export function createVan(scene:Scene,root:TransformNode,builders:ArtBuilders,palette:Record<'white'|'steel'|'glass'|'black'|'rubber'|'aluminium'|'warm',PBRMaterial>,position:V=[5.8,0,4],yaw=0){
 const {box,cylinder,label,finish,material}=builders;
 const {white,steel,glass,black,rubber,aluminium,warm}=palette;
  // Van #3: shaped body/cab, glazing, tyres, hubs, bumpers and rear hardware.
  const van = new TransformNode("van3-art", scene); van.parent = root; van.position.set(...position); van.rotation.y=yaw;
  const profile: [number, number][] = [[0.5,-2.4],[1,-2.4],[1.12,-1.85],[2.05,-1.15],[2.18,-0.7],[2.18,2.2],[2.02,2.4],[0.5,2.4]];
  const positions: number[] = []; const indices: number[] = [];
  for (const x of [-1.02, 1.02]) for (const [y,z] of profile) positions.push(x,y,z);
  const n = profile.length;
  for (let i = 1; i < n - 1; i++) { indices.push(0,i+1,i,n,n+i,n+i+1); }
  for (let i = 0; i < n; i++) { if (i === 6) continue; const j = (i+1)%n; indices.push(i,j,n+j,i,n+j,n+i); }
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
  // Rear doors fold against the sides, within the existing broad collider.
  for (const x of [-1.045, 1.045]) box("open-rear-door", [x, 1.35, 1.91], [.035, 1.5, .9], white, van);
  box("cargo-floor", [0, .56, 1.2], [1.94, .08, 2.3], steel, van);
  for (const x of [-.96,.96]) box("cargo-side-lining", [x,1.3,1.2], [.035,1.35,2.25], steel, van);
  box("cargo-bulkhead", [0,1.3,.08], [1.94,1.35,.035], steel, van);
  box("cargo-headlining", [0,2,1.2], [1.94,.035,2.25], steel, van);
  for (const x of [-0.7, 0, 0.7]) box("van-roof-rib", [x, 2.19, 0.8], [0.035, 0.02, 2.65], white, van);
 return van;
}
