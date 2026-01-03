// @ts-check
import { defineConfig } from "astro/config"
import { qrcode } from "vite-plugin-qrcode"
import glsl from "vite-plugin-glsl"

import tailwindcss from "@tailwindcss/vite"
import react from "@astrojs/react"
import vue from "@astrojs/vue"

import sitemap from "@astrojs/sitemap"

export default defineConfig({
  vite: {
    plugins: [
      tailwindcss(),
      qrcode(),
      glsl({
        include: [
          "**/*.glsl",
          "**/*.wgsl",
          "**/*.vert",
          "**/*.frag",
          "**/*.vs",
          "**/*.fs",
        ],
        exclude: undefined,
        warnDuplicatedImports: true,
        removeDuplicatedImports: false,
        defaultExtension: "glsl",
        compress: true,
        watch: true,
        root: "/",
      }),
    ],
  },
  devToolbar: {
    enabled: false,
  },
  site: "https://your-package-name.vercel.app", // Update with your deployment URL
  integrations: [react(), vue(), sitemap({})],
})
