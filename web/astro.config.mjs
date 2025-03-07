// @ts-check
import { defineConfig } from "astro/config"
import { qrcode } from "vite-plugin-qrcode"

import tailwindcss from "@tailwindcss/vite"
import react from "@astrojs/react"
import vue from "@astrojs/vue"

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [tailwindcss(), qrcode()],
  },

  experimental: {
    svg: true,
  },

  integrations: [react(), vue()],
})
