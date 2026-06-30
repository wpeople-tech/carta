import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig(({ command }) => {
  if (command === 'serve') {
    return {
      plugins: [react()],
      server: { port: 5173 },
    }
  }

  // Build: output IIFE content script untuk Chrome Extension
  return {
    plugins: [react()],
    build: {
      outDir: '../public/carta-extension',
      emptyOutDir: true,
      rollupOptions: {
        input: {
          content: resolve(__dirname, 'src/content.tsx'),
        },
        output: {
          format: 'iife',
          entryFileNames: '[name].js',
          assetFileNames: '[name].[ext]',
          inlineDynamicImports: true,
        },
      },
    },
  }
})
