import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './', // Ensures correct asset paths in production (for Vercel)
  build: {chunkSizeWarningLimit: 8500, // Keeps warnings under control
          }
});
