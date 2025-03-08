// @ts-check
import { defineConfig } from "astro/config"
import { qrcode } from "vite-plugin-qrcode"
import glsl from "vite-plugin-glsl"

import tailwindcss from "@tailwindcss/vite"
import react from "@astrojs/react"
import vue from "@astrojs/vue"

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [
      tailwindcss(),
      qrcode(),
      glsl({
        include: [
          // Glob pattern, or array of glob patterns to import
          "**/*.glsl",
          "**/*.wgsl",
          "**/*.vert",
          "**/*.frag",
          "**/*.vs",
          "**/*.fs",
        ],
        exclude: undefined, // Glob pattern, or array of glob patterns to ignore
        warnDuplicatedImports: true, // Warn if the same chunk was imported multiple times
        removeDuplicatedImports: false, // Automatically remove an already imported chunk
        defaultExtension: "glsl", // Shader suffix when no extension is specified
        compress: false, // Compress output shader code
        watch: true, // Recompile shader on change
        root: "/", // Directory for root imports
      }),
    ],
  },
  devToolbar: {
    enabled: false,
  },
  experimental: {
    svg: true,
  },

  integrations: [react(), vue()],
})
