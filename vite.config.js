import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      // Temporarily disable React Compiler to avoid React 19 export issues
      // babel: {
      //   plugins: [['babel-plugin-react-compiler']],
      // },
    }),
  ],
})
