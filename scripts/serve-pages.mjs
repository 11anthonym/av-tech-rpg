import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const portable = process.argv.includes("--portable");
const root = fileURLToPath(new URL(portable ? "../game3d/dist-portable/" : "../.pages/", import.meta.url));
const portIndex = process.argv.indexOf("--port");
const port = portIndex < 0 ? 4174 : Number(process.argv[portIndex + 1]);
const hostIndex = process.argv.indexOf("--host");
const host = hostIndex < 0 ? "127.0.0.1" : process.argv[hostIndex + 1];
if (!Number.isInteger(port) || port < 0 || port > 65535 || !host) throw new Error("Use --port 0..65535 and --host ADDRESS");
if (!fs.existsSync(path.join(root, "index.html"))) throw new Error(portable
  ? "Portable build missing. Run pnpm build:portable first."
  : "Combined build missing. Run pnpm build from the repository root first.");
const prefix = portable ? "" : "/av-tech-rpg";
const mime = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json",
  ".glb": "model/gltf-binary", ".gltf": "model/gltf+json", ".bin": "application/octet-stream",
  ".env": "application/octet-stream", ".wasm": "application/wasm", ".png": "image/png", ".svg": "image/svg+xml",
  ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp", ".ktx2": "image/ktx2",
  ".mp3": "audio/mpeg", ".ogg": "audio/ogg", ".wav": "audio/wav", ".mp4": "video/mp4", ".webm": "video/webm" };
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
server.on("error", error => { console.error(`Preview failed: ${error.message}`); process.exitCode = 1; });
server.listen(port, host, () => {
  const actualPort = server.address().port;
  console.log(`Static preview: http://127.0.0.1:${actualPort}${prefix}/`);
  if (!portable) console.log(`3D game: http://127.0.0.1:${actualPort}${prefix}/3d/`);
  if (host === "0.0.0.0" || host === "::") console.log(`LAN access: use this computer's network IP and port ${actualPort}; allow the server through your local firewall.`);
});
for (const signal of ["SIGINT", "SIGTERM"]) process.on(signal, () => server.close());
