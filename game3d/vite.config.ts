import { defineConfig } from "vite";

export default defineConfig({
  base: "/av-tech-rpg/3d/",
  define: {
    __BUILD_VERSION__: JSON.stringify(`0.1.0+${process.env.GITHUB_SHA?.slice(0, 7) ?? "local"}`),
  },
  build: { target: "es2022", sourcemap: true },
  server: { watch: { ignored: ["**/test-results/**", "**/playwright-report/**"] } },
});
