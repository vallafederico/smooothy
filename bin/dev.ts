// https://dev.to/akarachen/how-to-make-a-modern-npm-package-5096
// https://serko.dev/post/pnpm-link-usage

import type { BuildConfig } from "bun"
import { build } from "bun"
// import dts from "bun-plugin-dts"

const option: BuildConfig = {
  entrypoints: ["./package/index.ts"],
  outdir: "./dist",
  minify: false,
  sourcemap: "external",
}

async function run() {
  try {
    const watcher = build({
      ...option,
      // plugins: [dts()],
      format: "esm",
      naming: "[dir]/esm.js",
      // watch: true,
    })

    const watcher2 = build({
      ...option,
      format: "cjs",
      naming: "[dir]/cjs.js",
      // watch: true,
    })

    await Promise.all([watcher, watcher2])
    console.log("Watching for changes...")
  } catch (error) {
    console.error("Build failed:", error)
    process.exit(1)
  }
}

run()
