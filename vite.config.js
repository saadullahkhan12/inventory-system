import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "https://inventory-system-back-end.onrender.com/",
        changeOrigin: true,
      },
    },
  },
});
