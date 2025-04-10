import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  base: '/bias-calculator/',  // Set this to your GitHub Pages repository name
  build: {
    outDir: 'dist',            // Output directory for the build files
    assetsDir: 'assets'        // Folder for the static assets
  },
  server: {
    host: '0.0.0.0',           // Listen on all network interfaces
    port: 8080,                 // Port for local dev server
    open: true                  // Open browser automatically on start
  }
});
