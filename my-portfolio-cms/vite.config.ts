import path from "path"
import tailwindcss from "tailwindcss"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import autoprefixer from "autoprefixer"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  css: {
    postcss: {
      plugins: [tailwindcss, autoprefixer]
    }
  }
})