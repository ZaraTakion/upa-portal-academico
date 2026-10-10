import { defineConfig, loadEnv } from "vite";
import process from "node:process";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  // On Vercel the backend is on Render. Refuse to deploy a frontend
  // pointing accidentally to localhost or to the former same-origin /api.
  if (env.VERCEL && !/^https:\/\/[^/]+\/api\/?$/.test(env.VITE_API_URL || "")) {
    throw new Error("Defina VITE_API_URL=https://SEU-BACKEND.onrender.com/api na Vercel.");
  }
  return { plugins: [react()] };
});
