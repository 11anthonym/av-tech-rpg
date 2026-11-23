import { Engine } from "@babylonjs/core/Engines/engine";
import { Scene } from "@babylonjs/core/scene";
import { Color4, Color3 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { DirectionalLight } from "@babylonjs/core/Lights/directionalLight";
import "@babylonjs/core/Collisions/collisionCoordinator";

export function createRenderer(canvas: HTMLCanvasElement) {
  const engine = new Engine(canvas, true, { stencil: true });
  const scene = new Scene(engine);
  scene.clearColor = new Color4(0.065, 0.09, 0.105, 1);
  scene.collisionsEnabled = true;
  const ambient = new HemisphericLight("shop-ambient", new Vector3(0.1, 1, 0.2), scene);
  ambient.intensity = 0.85;
  ambient.groundColor = new Color3(0.25, 0.28, 0.3);
  const daylight = new DirectionalLight("shop-daylight", new Vector3(-0.4, -1, 0.3), scene);
  daylight.intensity = 0.65;
  const resize = new ResizeObserver(() => engine.resize());
  resize.observe(canvas);
  return { engine, scene, dispose: () => { resize.disconnect(); scene.dispose(); engine.dispose(); } };
}
