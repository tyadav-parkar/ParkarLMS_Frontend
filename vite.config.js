import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@shared': path.resolve(__dirname, 'src/modules/shared'),
      '@auth': path.resolve(__dirname, 'src/modules/auth'),
      '@roles': path.resolve(__dirname, 'src/modules/roles'),
      '@users': path.resolve(__dirname, 'src/modules/users'),
      '@team': path.resolve(__dirname, 'src/modules/team'),
      '@dashboard': path.resolve(__dirname, 'src/modules/dashboard'),
      '@profile': path.resolve(__dirname, 'src/modules/profile'),
      '@error': path.resolve(__dirname, 'src/modules/error'),
      '@modules': path.resolve(__dirname, 'src/modules'),
      '@import':    path.resolve(__dirname, 'src/modules/import'),

    },
  },
  plugins: [react(),
  tailwindcss(),
  ],
})
