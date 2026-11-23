import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import { newSession, resolveAction, vanReady } from "../src/domain/session.ts";
import { shopLoad, shopRules } from "../src/content/ids.ts";
import { freshSave, parseSave } from "../src/persistence/save.ts";
import { NullEngine } from "@babylonjs/core/Engines/nullEngine.js";
import { Scene } from "@babylonjs/core/scene.js";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode.js";
import { applyCarryPose } from "../src/player/carry-pose.ts";

test("shop names, capacity, starting kit and pickup energy agree with legacy code", () => {
  const context = { window: {} as any }; vm.createContext(context);
  vm.runInContext(fs.readFileSync(new URL("../../src/content/data.js", import.meta.url), "utf8"), context);
  const content = context.window.GAME_CONTENT;
  assert.deepEqual([...content.tutorial.shopLoad], [...shopLoad]);
  assert.equal(content.vehicles.van3.cargoCapacity, shopRules.vanCapacity);
  assert.deepEqual([...content.technicians[0].startingTools], newSession().tools);
  const vehicleSource = fs.readFileSync(new URL("../../src/systems/vehicle-system.js", import.meta.url), "utf8");
  vm.runInContext(vehicleSource, context);
  vm.runInContext('var state = {sceneId:"shop"}; var getToolModifier = () => 0;', context);
  assert.equal(vm.runInContext("getCarryCapacity()", context), shopRules.carryCapacity);
  vm.runInContext(fs.readFileSync(new URL("../../src/systems/condition-system.js", import.meta.url), "utf8"), context);
  vm.runInContext('var hasCharacterTrait = () => false;', context);
  assert.equal(vm.runInContext("getEquipmentEnergyCost(2)", context), shopRules.pickupEnergy);
});

test("brief, carry and load enforce gates and give each group exactly one home", () => {
  const initial = newSession();
  assert.equal(resolveAction(initial,"shop.pickup-equipment").event.outcome,"blocked");
  assert.equal(resolveAction(initial,"shop.pickup-equipment").state,initial);
  let state = resolveAction(initial,"shop.brief-supervisor").state;
  assert.equal(resolveAction(state,"shop.brief-supervisor").state,state);
  for (const id of shopLoad) {
    const picked = resolveAction(state,"shop.pickup-equipment");
    assert.deepEqual(picked.state.carry,[id]);
    assert.equal(picked.state.energy,state.energy-2);
    const denied = resolveAction(picked.state,"shop.pickup-equipment");
    assert.equal(denied.event.outcome,"blocked"); assert.equal(denied.state,picked.state);
    // Reload while carrying must preserve the exact group and cost.
    const restored = parseSave(JSON.stringify({...freshSave(),session:picked.state}));
    assert.deepEqual(restored.session,picked.state);
    state = resolveAction(restored.session,"shop.load-van").state;
    const again = resolveAction(state,"shop.load-van");
    assert.equal(again.state,state); assert.equal(again.event.outcome,"reviewed");
    assert.deepEqual(state.carry,[]);
    assert.equal(new Set([...state.carry,...state.loaded]).size,state.loaded.length);
  }
  assert(vanReady(state)); assert.equal(state.energy,94);
  assert.deepEqual(state.loaded,[...shopLoad]);
  assert.equal(resolveAction(state,"shop.pickup-equipment").state,state);
  assert.deepEqual(newSession(),initial); // no mutation
});

test("v1 M1/M2 saves migrate without losing workbench, position or camera", () => {
  const old = {version:1,session:{areaId:"shop",technicianId:"prototype-tech",completedActions:["shop.inspect-workbench"]},position:[0,.92,-4],camera:{yaw:.4,pitch:.35,distance:5.5}};
  const migrated = parseSave(JSON.stringify(old));
  assert.equal(migrated.version,2); assert.deepEqual(migrated.position,old.position); assert.deepEqual(migrated.camera,old.camera);
  assert.deepEqual(migrated.session.completedActions,old.session.completedActions);
  assert.deepEqual(migrated.session.carry,[]); assert.equal(migrated.session.flags.shopBrief,false);
});

test("corrupt cargo, capacity, kit and briefing combinations are rejected", () => {
  const base = resolveAction(newSession(),"shop.brief-supervisor").state;
  for (const change of [{carry:[shopLoad[0],shopLoad[1]]},{carry:[shopLoad[0]],loaded:[shopLoad[0]]},
    {loaded:["Unknown"]},{loaded:[shopLoad[0],shopLoad[0]]},{energy:NaN},{tools:["screwdriver","screwdriver"]},
    {flags:{shopBrief:false},loaded:[shopLoad[0]]}]) {
    assert.throws(()=>parseSave(JSON.stringify({...freshSave(),session:{...base,...change}})));
  }
});

test("carry solve reaches both grips under glTF reflection and rotated characters", () => {
  const engine = new NullEngine(); const scene = new Scene(engine);
  try {
    for (const yaw of [0, Math.PI/2, Math.PI, -Math.PI/2]) {
      const root = new TransformNode("player",scene); root.rotation.y=yaw;
      const rig = new TransformNode("gltf-conversion",scene); rig.parent=root; rig.scaling.z=-1;
      const nodes:TransformNode[]=[];
      for(const [side,sign] of [["Left",-1],["Right",1]] as const) {
        const arm=new TransformNode(`mixamorig:${side}Arm`,scene); arm.parent=rig; arm.position.set(sign*.18,1.45,0);
        const fore=new TransformNode(`mixamorig:${side}ForeArm`,scene); fore.parent=arm; fore.position.y=-.28;
        const hand=new TransformNode(`mixamorig:${side}Hand`,scene); hand.parent=fore; hand.position.y=-.25;
        nodes.push(arm,fore,hand);
      }
      assert(applyCarryPose(nodes,root)<.001);
      assert(applyCarryPose(nodes,root)<.001); // stable when the same pose is evaluated again
      root.dispose();
    }
  } finally { scene.dispose(); engine.dispose(); }
});
