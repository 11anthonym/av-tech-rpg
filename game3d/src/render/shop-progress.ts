import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import { PBRMaterial } from "@babylonjs/core/Materials/PBR/pbrMaterial";
import { DynamicTexture } from "@babylonjs/core/Materials/Textures/dynamicTexture";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import type { Scene } from "@babylonjs/core/scene";
import { shopLoad } from "../content/ids.ts";
import type { Session } from "../domain/session.ts";

// Three authoritative groups are each represented exactly once, with original
// labelled packaging. Decorative M2 shelf cartons remain background dressing.
export function createShopProgress(scene: Scene, character: TransformNode) {
  const root = new TransformNode("shop-progress", scene);
  const boxes = shopLoad.map((id, index) => {
    const group = new TransformNode(`cargo/${id}`, scene); group.parent = root;
    const material = new PBRMaterial(`cargo-material/${index}`, scene);
    material.albedoColor = Color3.FromHexString(index === 2 ? "#475a68" : "#aa8254").toLinearSpace(); material.roughness = .88; material.metallic = 0;
    const size: readonly [number, number, number] = index === 1 ? [.68, .5, .24] : index === 2 ? [.6, .3, .35] : [.62, .4, .4];
    const body = MeshBuilder.CreateBox(`cargo-body/${index}`, { width: size[0], height: size[1], depth: size[2] }, scene);
    body.parent = group; body.material = material; body.isPickable = false; body.receiveShadows = true;
    const ink = new PBRMaterial(`cargo-label/${index}`, scene); ink.roughness = 1; ink.metallic = 0;
    const texture = new DynamicTexture(`cargo-print/${index}`, { width: 512, height: 128 }, scene, true);
    texture.drawText(id.toUpperCase(), null, 78, "bold 35px sans-serif", "#17252b", "#e5dbc1", true);
    ink.albedoTexture = texture;
    const label = MeshBuilder.CreatePlane(`cargo-tag/${index}`, { width: size[0] * .88, height: .12, sideOrientation: 2 }, scene);
    label.parent = group; label.position.z = -size[2]!/2 - .003; label.material = ink; label.isPickable = false;
    const frontLabel = label.clone(`cargo-tag-front/${index}`)!;
    frontLabel.parent = group; frontLabel.position.z = size[2]/2 + .003; frontLabel.rotation.y = Math.PI;
    return group;
  });
  const markers = [
    { name: "SUPERVISOR", position: [-5, 2.02, -1] },
    { name: "STAGING", position: [-5.5, 1.52, 4.5] },
    { name: "VAN 3 · LOAD HERE", position: [5.8, 2.1, 6.52] },
    { name: 'DRIVER · ROUTE', position:[7.3,1.85,4] },
  ].map(({ name, position }) => {
    const material = new PBRMaterial(`marker/${name}`, scene); material.roughness = 1; material.metallic = 0;
    const texture = new DynamicTexture(`marker-print/${name}`, { width: 512, height: 128 }, scene, true);
    texture.drawText(name, null, 82, "bold 42px sans-serif", "#ffe4a5", "#1c3038", true);
    material.albedoTexture = texture; material.emissiveColor.set(.3,.3,.3);
    const mesh = MeshBuilder.CreatePlane(name, { width: 1.4, height: .35, sideOrientation: 2 }, scene);
    mesh.parent = root; mesh.position.set(position[0]!,position[1]!,position[2]!); mesh.material = material; mesh.isPickable = false;
    mesh.billboardMode = 7; return mesh;
  });
  let carrying = -1;
  const places:('staged'|'carried'|'loaded'|'delivered')[]=shopLoad.map(()=>'staged');
  return {
    update(state: Session) {
      carrying = shopLoad.findIndex(id => state.carry.includes(id));
      boxes.forEach((box, i) => {
        const id = shopLoad[i]!;
        box.setEnabled(true);
        if (state.carry.includes(id)) { places[i]='carried';box.parent = character; box.position.set(0, 1.15, .35); box.rotation.y = 0; box.scaling.setAll(1); }
        else if (state.loaded.includes(id)) { places[i]='loaded';box.parent = root;
          const garage=state.areaId==='centerCityGarage';box.position.set((garage?-2.65:5.15)+i*.65,.60+[.4,.5,.3][i]!*.85/2,garage?-1.15:6.15);
          box.rotation.y=garage?0:Math.PI;box.scaling.setAll(.85); }
        else if(state.delivered.includes(id)) { places[i]='delivered';box.parent=root;box.scaling.setAll(1);box.rotation.y=0;
          const p=state.areaId==='centerCityGarage'?[1+i*.65,.3,.1]:state.areaId==='centerCityLobby'?[-4.7+i*.65,.3,2.3]:[-4.7,.3,-1+i*.8];
          box.position.set(p[0]!,p[1]!,p[2]!);
        } else { places[i]='staged';box.parent = root; box.position.set(-6.4 + i * .9, [.34,.39,.29][i]!, 4.9); box.rotation.y = 0; box.scaling.setAll(1); box.setEnabled(state.areaId==='shop'); }
      });
      markers.forEach(marker=>marker.setEnabled(state.areaId==='shop'));
      markers[1]!.setEnabled(state.areaId==='shop'&&state.loaded.length<3);
    },
    cameraOpacity(opacity: number) { boxes.forEach((box, i) => box.getChildMeshes().forEach(mesh => { mesh.visibility = i === carrying ? opacity : 1; })); },
    focus(meshId: string | undefined) {
      ["supply-counter","staging","van3"].forEach((id,i)=>{
        const material=markers[i]!.material as PBRMaterial;
        material.emissiveColor.set(meshId===id ? .8 : .3,meshId===id ? .65 : .3,meshId===id ? .35 : .3);
      });
    },
    snapshot: () => boxes.map((_box, i) => ({ id: shopLoad[i], place: places[i]! })),
    dispose() { for (const box of boxes) box.parent = root; root.dispose(false, true); },
  };
}
