import { defineConfig, loadEnv } from "vite";
import process from "node:process";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const apiUrl = env.VITE_API_URL || (env.VERCEL ? "/api" : "http://localhost:8000/api");
  if (env.VERCEL && apiUrl !== "/api") {
    let url;
    try { url = new URL(apiUrl); } catch { /* Validated below. */ }
    if (!url || url.protocol !== "https:" || url.username || url.password ||
        ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname) ||
        !/^\/api\/?$/.test(url.pathname) || url.search || url.hash) {
      throw new Error("Defina VITE_API_URL=/api com o rewrite seguro, ou uma API HTTPS confiável.");
    }
  }
  const proxy = { "/api": { target: "http://127.0.0.1:8000", changeOrigin: true } };
  return { plugins: [react()], server: { proxy }, preview: { proxy } };
});
