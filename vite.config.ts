import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import NodePolyfills from 'vite-plugin-node-polyfills';

export default defineConfig({
  define: {
    'process.env': {
      VITE_API_URL: '"http://localhost:3000"',
    },
  },
  plugins: [react()],
});
