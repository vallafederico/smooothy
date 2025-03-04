// @ts-check
import { defineConfig } from "astro/config"
import { qrcode } from "vite-plugin-qrcode"

import tailwindcss from "@tailwindcss/vite"

// log the current path
console.log(import.meta.dirname)
// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [tailwindcss(), qrcode()],
  },
  experimental: {
    svg: true,
  },
})
