import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import process from "process";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    watch: {
      usePolling: true,
    },
    host: "0.0.0.0",
    proxy: {
      "/api": {
        target: process.env.VITE_BACKEND_URL,
        changeOrigin: true,
        secure: false,
        configure: (proxy, _options) => {
          proxy.on("error", (err, _req, _res) => {
            console.log("proxy error", err);
          });
          proxy.on("proxyReq", (_proxyReq, req, _res) => {
            console.log("Sending Request to the Target:", req.method, req.url);
          });
          proxy.on("proxyRes", (proxyRes, req, _res) => {
            console.log(
              "Received Response from the Target:",
              proxyRes.statusCode,
              req.url
            );
          });
        },
      },
    },
  },
  // Add the build configuration
  build: {
    outDir: "dist",  // Output directory for the production build
    emptyOutDir: true,  // Clear the dist directory before building
    sourcemap: true,  // Generate source maps for debugging
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes("node_modules")) {
            return "vendor";  // Split vendor (node_modules) code into a separate chunk
          }
        },
      },
    },
  },
});