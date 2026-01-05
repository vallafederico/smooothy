// https://dev.to/akarachen/how-to-make-a-modern-npm-package-5096
// https://serko.dev/post/pnpm-link-usage

// https://github.com/wobsoriano/bun-lib-starter/blob/main/build.ts

import type { BuildConfig } from "bun"
import { build } from "bun"
import dts from "bun-plugin-dts"
import { spawn } from "bun"
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
        naming: "smooothy.min.js",
        globalName: "Smooothy", // (*) DOESNT WORK
        target: "browser",
        minify: true,
        sourcemap: "none",
      }),
    ])

    addGlobalName("./dist/smooothy.min.js", "Smooothy")

    // Run build verification tests
    console.log("\n")
    const testProcess = spawn({
      cmd: ["bun", "run", "bin/test-build.ts"],
      stdout: "inherit",
      stderr: "inherit",
    })

    const exitCode = await testProcess.exited
    if (exitCode !== 0) {
      console.error("\n❌ Build verification tests failed!")
      process.exit(1)
    }
  } catch (error) {
    console.error(error)
    process.exit(1)
  }
}

run()
