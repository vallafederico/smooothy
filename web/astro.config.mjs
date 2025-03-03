// @ts-check
import { defineConfig } from "astro/config"
import { qrcode } from "vite-plugin-qrcode"

import tailwindcss from "@tailwindcss/vite"

import solidJs from "@astrojs/solid-js"
import vue from "@astrojs/vue"
import preact from "@astrojs/preact"

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [tailwindcss(), qrcode()],
  },
  experimental: {
    svg: true,
  },

  integrations: [solidJs(), vue(), preact()],
})
