import { Engine } from "@babylonjs/core/Engines/engine";
import { Scene } from "@babylonjs/core/scene";
import { Color4, Color3 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { DirectionalLight } from "@babylonjs/core/Lights/directionalLight";
import { ShadowGenerator } from "@babylonjs/core/Lights/Shadows/shadowGenerator";
import { CubeTexture } from "@babylonjs/core/Materials/Textures/cubeTexture";
import { ImageProcessingConfiguration } from "@babylonjs/core/Materials/imageProcessingConfiguration";
import { SceneInstrumentation } from "@babylonjs/core/Instrumentation/sceneInstrumentation";
import "@babylonjs/core/Collisions/collisionCoordinator";

export function createRenderer(canvas: HTMLCanvasElement) {
  const engine = new Engine(canvas, true, { stencil: true });
  const scene = new Scene(engine);
  const instrumentation = new SceneInstrumentation(scene);
  scene.clearColor = new Color4(0.065, 0.09, 0.105, 1);
  scene.collisionsEnabled = true;
  const ambient = new HemisphericLight("shop-ambient", new Vector3(0.1, 1, 0.2), scene);
  ambient.intensity = 0.65;
  ambient.groundColor = new Color3(0.25, 0.28, 0.3);
  const daylight = new DirectionalLight("shop-daylight", new Vector3(-0.4, -1, 0.3), scene);
  daylight.intensity = 2.1;
  daylight.position.set(-4, 7, -4);
  daylight.shadowMinZ = 0.1; daylight.shadowMaxZ = 35;
  const shadows = new ShadowGenerator(1024, daylight);
  shadows.usePercentageCloserFiltering = true;
  shadows.filteringQuality = ShadowGenerator.QUALITY_LOW;
  shadows.bias = 0.001; shadows.normalBias = 0.035;
  scene.environmentTexture = CubeTexture.CreateFromPrefilteredData(`${import.meta.env.BASE_URL}assets/shop-lighting.env`, scene);
  scene.environmentIntensity = 0.6;
  scene.imageProcessingConfiguration.toneMappingEnabled = true;
  scene.imageProcessingConfiguration.toneMappingType = ImageProcessingConfiguration.TONEMAPPING_ACES;
  scene.imageProcessingConfiguration.exposure = 1.1;
  const resize = new ResizeObserver(() => engine.resize());
  resize.observe(canvas);
  return { engine, scene, metrics: () => ({ drawCalls: instrumentation.drawCallsCounter.current, vertices: scene.getTotalVertices(), graphics: engine.getGlInfo() }), prepareShadows() {
    for (const mesh of scene.meshes) if (mesh.isVisible && mesh.getTotalVertices() > 0 && mesh.name !== "player-collision") shadows.addShadowCaster(mesh, false);
  }, dispose: () => { resize.disconnect(); instrumentation.dispose(); scene.dispose(); engine.dispose(); } };
}
