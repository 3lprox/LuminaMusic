import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, (process as any).cwd(), '');

  return {
    plugins: [react()],
    // Removed 'resolve.alias' to prevent path resolution errors.
    // We now rely strictly on relative imports (e.g., '../utils').
    define: {
      // Prevents "ReferenceError: process is not defined" in browser
      'process.env': {},
      // Inject the API key specifically
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
      'process.env.NODE_ENV': JSON.stringify(mode),
    },
    server: {
      port: 3000,
    },
    build: {
      outDir: 'dist',
    },
  };
});