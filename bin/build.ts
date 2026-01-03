// https://dev.to/akarachen/how-to-make-a-modern-npm-package-5096
// https://serko.dev/post/pnpm-link-usage

// https://github.com/wobsoriano/bun-lib-starter/blob/main/build.ts

import type { BuildConfig } from "bun"
import { build } from "bun"
import dts from "bun-plugin-dts"
import { addGlobalName } from "./utils/addGlobalName"

const option: BuildConfig = {
  entrypoints: ["./package/index.ts"],
  outdir: "./dist",
  minify: true,
  sourcemap: "external",
  plugins: [dts()],
}

async function run() {
  try {
    // Update these to match your package
    const globalName = "PackageName" // Change this to your package's global name
    const bundleName = "package.min.js" // Change this to match your package name
    
    await Promise.all([
      build({
        ...option,
        format: "esm",
        naming: "[dir]/esm.js",
      }),
      build({
        ...option,
        format: "cjs",
        naming: "[dir]/cjs.js",
      }),
      // Unpkg bundle - UMD format for browser usage
      build({
        ...option,
        format: "iife",
        outdir: "./dist",
        naming: bundleName,
        globalName: globalName,
        target: "browser",
        minify: true,
        sourcemap: "none",
      }),
    ])

    // Add global assignment for browser bundle
    addGlobalName(`./dist/${bundleName}`, globalName)
  } catch (error) {
    console.error(error)
    process.exit(1)
  }
}

run()
