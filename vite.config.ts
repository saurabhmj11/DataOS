/**
 * Copyright (c) 2024. Designed and Developed by Saurabh Lokhande.
 */

import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react()],
    server: {
      headers: {
        'Cross-Origin-Opener-Policy': 'same-origin',
        'Cross-Origin-Embedder-Policy': 'require-corp',
      },
    },
    optimizeDeps: {
      exclude: ['@duckdb/duckdb-wasm']
    },
    define: {
      // This enables process.env.API_KEY to work in the client-side code
      'process.env.API_KEY': JSON.stringify(env.API_KEY)
    }
  };
});