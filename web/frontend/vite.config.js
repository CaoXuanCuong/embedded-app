import { defineConfig } from "vite";
import { dirname } from "path";
import { fileURLToPath } from "url";
import https from "https";
import react from "@vitejs/plugin-react";

if (
  process.env.npm_lifecycle_event === "build" &&
  !process.env.CI &&
  !process.env.SHOPIFY_API_KEY
) {
  console.warn(
    "\nBuilding the frontend app without an API key. The frontend build will not run without an API key. Set the SHOPIFY_API_KEY environment variable when running the build command.\n"
  );
}

const proxyOptions = {
  target: `http://127.0.0.1:${process.env.BACKEND_PORT}`,
  changeOrigin: false,
  secure: true,
  ws: false,
};

const host = process.env.HOST
  ? process.env.HOST.replace(/https?:\/\//, "")
  : "localhost";

let hmrConfig;
if (host === "localhost") {
  hmrConfig = {
    protocol: "ws",
    host: "localhost",
    port: 64999,
    clientPort: 64999,
  };
} else {
  hmrConfig = {
    protocol: "wss",
    host: host,
    port: process.env.FRONTEND_PORT,
    clientPort: 443,
  };
}

export default defineConfig({
  root: dirname(fileURLToPath(import.meta.url)),
  plugins: [react()],
  define: {
    "process.env.SHOPIFY_API_KEY": JSON.stringify(process.env.SHOPIFY_API_KEY),
    "process.env.SERVER_URL": JSON.stringify(process.env.SERVER_URL),
    "process.env.SHOPIFY_API_SECRET_KEY": JSON.stringify(process.env.SHOPIFY_API_SECRET_KEY),
    "process.env.APP_URL": JSON.stringify(process.env.APP_URL),
    "process.env.CRISP_CHAT_ID": JSON.stringify(process.env.CRISP_CHAT_ID),
    "process.env.HOST":JSON.stringify(process.env.HOST),
    "process.env.VAHU_CLARITY_KEY": JSON.stringify(process.env.VAHU_CLARITY_KEY),
    "process.env.VAHU_API": JSON.stringify(process.env.VAHU_API),
    "process.env.VAHU_APP_ID": JSON.stringify(process.env.VAHU_APP_ID)
  },
  resolve: {
    preserveSymlinks: true,
  },
  server: {
    host: "localhost", 
    port: process.env.FRONTEND_PORT,
    hmr: hmrConfig,
    proxy: {
      "^/(\\?.*)?$": proxyOptions,
      "^/api(/|(\\?.*)?$)": proxyOptions,
    },
  },
});
