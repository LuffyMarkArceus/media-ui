import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      "/api": {
        // Replace '/api' with the desired path prefix
        target: "http://localhost:8080", // Replace with your backend server address
        changeOrigin: true, // Required for some backend servers to change the origin
        secure: false, // Set to true if using HTTPS
        rewrite: (path) => path.replace(/^\/api/, ""), // Optional: Remove the prefix from the path
      },
    },
  },
});
