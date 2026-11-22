import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../.pages/", import.meta.url));
const portIndex = process.argv.indexOf("--port");
const port = portIndex < 0 ? 4174 : Number(process.argv[portIndex + 1]);
const prefix = "/av-tech-rpg";
const mime = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json",
  ".glb": "model/gltf-binary", ".wasm": "application/wasm", ".png": "image/png", ".svg": "image/svg+xml" };
const server = http.createServer((request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
    if (pathname === prefix) { response.writeHead(302, { Location: `${prefix}/` }); response.end(); return; }
    if (!pathname.startsWith(`${prefix}/`)) { response.writeHead(404); response.end(); return; }
    let target = path.resolve(root, `.${pathname.slice(prefix.length)}`);
    if (!target.startsWith(path.resolve(root) + path.sep) && target !== path.resolve(root)) throw new Error("Invalid path");
    if (fs.existsSync(target) && fs.statSync(target).isDirectory()) target = path.join(target, "index.html");
    if (!fs.existsSync(target) || !fs.statSync(target).isFile()) { response.writeHead(404); response.end("Not found"); return; }
    response.writeHead(200, { "Content-Type": mime[path.extname(target)] ?? "application/octet-stream", "Cache-Control": "no-cache" });
    response.end(request.method === "HEAD" ? undefined : fs.readFileSync(target));
  } catch { response.writeHead(400); response.end("Invalid request"); }
});
server.listen(port, "127.0.0.1", () => console.log(`Pages preview: http://127.0.0.1:${port}${prefix}/3d/`));
for (const signal of ["SIGINT", "SIGTERM"]) process.on(signal, () => server.close());
