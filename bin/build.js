// https://dev.to/akarachen/how-to-make-a-modern-npm-package-5096
// https://serko.dev/post/pnpm-link-usage

import esbuild from "esbuild"
// import { dtsPlugin } from "esbuild-plugin-d.ts"

const option = {
  bundle: true,
  color: true,
  logLevel: "info",
  sourcemap: true,
  entryPoints: ["./package/index.ts"],
  minify: true,
}

async function run() {
  await esbuild
    .build({
      format: "esm",
      // outdir: "dist",
      // splitting: true,
      outfile: "./dist/esm.js",
      // plugins: [dtsPlugin()],
      ...option,
    })
    .catch(() => process.exit(1))

  await esbuild
    .build({
      format: "cjs",
      outfile: "./dist/cjs.js",
      ...option,
    })
    .catch(() => process.exit(1))
}

run()
