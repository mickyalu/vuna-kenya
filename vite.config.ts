import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { vunaApiPlugin } from './server/vite-plugin.ts'

export default defineConfig({
  base: '/',
  plugins: [react(), tailwindcss(), vunaApiPlugin()],
  server: {
    host: '0.0.0.0',
    port: 43173,
    strictPort: true,
  },
  preview: {
    host: '0.0.0.0',
    port: 43173,
  },
})
