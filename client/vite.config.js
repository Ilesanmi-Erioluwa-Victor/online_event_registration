import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "https://online-event-registration-h4h9.onrender.com",
        changeOrigin: true,
      },
      "/uploads": {
        target: "https://online-event-registration-h4h9.onrender.com",
        changeOrigin: true,
      },
    },
  },
});
