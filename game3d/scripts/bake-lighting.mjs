// Run with `pnpm dev` listening on 5173. Bake once, never at game startup.
import fs from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { firefox } from '@playwright/test';
const source = 'https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/studio_small_09_1k.hdr';
const hash = 'e7cfda5f4e98e623db12b8bfd0184e048488e4855d9c83e2751fb44a32e80c45';
const bytes = new Uint8Array(await (await fetch(source)).arrayBuffer());
if (createHash('sha256').update(bytes).digest('hex') !== hash) throw new Error('HDR source changed');
await fs.writeFile(new URL('../public/assets/shop-lighting.hdr', import.meta.url), bytes);
const browser = await firefox.launch({ firefoxUserPrefs: { 'webgl.force-enabled': true } });
try {
  const page = await browser.newPage();
  await page.goto('http://127.0.0.1:5173/av-tech-rpg/3d/assets/licenses/AVATAR_STUDIO.txt');
  const data = await page.evaluate(async () => {
    const prefix = '/av-tech-rpg/3d/node_modules/@babylonjs/core/';
    const [{ Engine }, { Scene }, { HDRCubeTexture }, { CreateEnvTextureAsync }] = await Promise.all([
      import(prefix + 'Engines/engine.js'), import(prefix + 'scene.js'),
      import(prefix + 'Materials/Textures/hdrCubeTexture.js'), import(prefix + 'Misc/environmentTextureTools.js'),
    ]);
    const canvas = document.createElement('canvas'); document.body.append(canvas);
    const engine = new Engine(canvas, true); const scene = new Scene(engine);
    const texture = await new Promise((resolve, reject) => {
      const t = new HDRCubeTexture('/av-tech-rpg/3d/assets/shop-lighting.hdr', scene, 64, false, true, false, true,
        () => resolve(t), (message) => reject(new Error(message)));
    });
    const result = Array.from(new Uint8Array(await CreateEnvTextureAsync(texture, { imageType: 'image/png' })));
    scene.dispose(); engine.dispose(); return result;
  });
  const output = new Uint8Array(data);
  await fs.writeFile(new URL('../public/assets/shop-lighting.env', import.meta.url), output);
  const report = { source, sourceBytes: bytes.length, sourceSha256: hash, runtimeBytes: output.length,
    runtimeSha256: createHash('sha256').update(output).digest('hex') };
  await fs.writeFile(new URL('../../docs/qa/m2/lighting-build.json', import.meta.url), JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify(report));
  await page.goto('about:blank');
} finally { await browser.close(); await fs.rm(new URL('../public/assets/shop-lighting.hdr', import.meta.url), { force: true }); }
