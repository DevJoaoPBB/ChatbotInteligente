import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/', // Define o caminho base correto
  build: {
    outDir: 'dist', // Garante que o output seja a pasta dist
  }
})
