// https://dev.to/akarachen/how-to-make-a-modern-npm-package-5096
// https://serko.dev/post/pnpm-link-usage

// https://github.com/wobsoriano/bun-lib-starter/blob/main/build.ts

import type { BuildConfig } from "bun"
import { build } from "bun"
import dts from "bun-plugin-dts"
import { readFileSync, writeFileSync } from "fs"

function addGlobalName(filePath, globalName) {
  let content = readFileSync(filePath, "utf8")

  // Find your main class variable (looking at your bundle, it's likely the last var assignment)
  // Your bundle ends with something like: var B=k;})();
  const match = content.match(/var\s+([A-Z])\s*=\s*k;\s*}\)\(\);?\s*$/)

  if (match) {
    const localVar = match[1] // This captures "B" from "var B=k;"

    const globalAssignment = `
if (typeof window !== 'undefined') {
  window.${globalName} = ${localVar};
} else if (typeof globalThis !== 'undefined') {
  globalThis.${globalName} = ${localVar};
} else if (typeof self !== 'undefined') {
  self.${globalName} = ${localVar};
}`

    // Replace the ending
    content = content.replace(
      /var\s+([A-Z])\s*=\s*k;\s*}\)\(\);?\s*$/,
      `var ${localVar}=k;${globalAssignment}\n})();`
    )

    writeFileSync(filePath, content)
    console.log(`✅ Added global assignment: window.${globalName}`)
  } else {
    console.log("❌ Could not find pattern to add global assignment")
  }
}

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
  } catch (error) {
    console.error(error)
    process.exit(1)
  }
}

run()
