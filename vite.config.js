import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  //  server: { // If used for development, replace "localhost" with your IPv4 address for all backend requests
  //    host: "0.0.0.0",
  //    port: 3000,
  //  },
});
