import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../', import.meta.url));
test('combined preview serves both entries and every shipped file without depending on cwd', { timeout: 60000 }, async () => {
  const server = spawn(process.execPath, [path.join(root, 'scripts/serve-pages.mjs'), '--port', '0'], {
    cwd: os.tmpdir(), stdio: ['ignore', 'pipe', 'pipe'],
  });
  try {
    const base = await new Promise((resolve, reject) => {
      let output = '';
      const timeout = setTimeout(() => reject(Error(`Server did not become ready: ${output}`)), 15000);
      server.stdout.on('data', chunk => {
        output += chunk;
        const match = output.match(/Static preview: (http:\/\/127\.0\.0\.1:\d+\/av-tech-rpg\/)/);
        if (match) { clearTimeout(timeout); resolve(match[1]); }
      });
      server.stderr.on('data', chunk => { output += chunk; });
      server.once('error', error => { clearTimeout(timeout); reject(error); });
      server.once('exit', code => { clearTimeout(timeout); reject(Error(`Preview exited ${code}: ${output}`)); });
    });
    const files = await fs.readdir(path.join(root, '.pages'), { recursive: true, withFileTypes: true });
    let checked = 0;
    for (const entry of files.filter(item => item.isFile())) {
      const filename = path.join(entry.parentPath, entry.name);
      const relative = path.relative(path.join(root, '.pages'), filename).split(path.sep).map(encodeURIComponent).join('/');
      const response = await fetch(new URL(relative, base));
      assert.equal(response.status, 200, relative);
      assert.deepEqual(Buffer.from(await response.arrayBuffer()), await fs.readFile(filename), relative);
      if (/\.js$/.test(relative)) assert.match(response.headers.get('content-type'), /javascript/, relative);
      if (/\.css$/.test(relative)) assert.match(response.headers.get('content-type'), /text\/css/, relative);
      if (/\.glb$/.test(relative)) assert.match(response.headers.get('content-type'), /model\/gltf-binary/, relative);
      checked++;
    }
    assert(checked > 40, 'Expected the real combined build, not an empty fixture');
    assert.match(await (await fetch(new URL('3d/', base))).text(), /game-view|id="app"/);
    assert.equal((await fetch(new URL('../', base))).status, 404);
    assert.equal((await fetch(new URL('3d/assets/missing.glb', base))).status, 404);
    assert.equal((await fetch(new URL('src/content/data.js', base), { method: 'HEAD' })).status, 200);
    console.log(`Verified both games and ${checked} shipped files at ${base}`);
  } finally {
    if (server.exitCode === null) {
      const closed = new Promise(resolve => server.once('exit', resolve));
      server.kill(); await closed;
    }
  }
});
