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
  minify: false,
}

async function run() {
  // Create context for ESM build
  const esmContext = await esbuild.context({
    format: "esm",
    // outdir: "dist",
    // splitting: true,
    outfile: "./dist/esm.js",
    // plugins: [dtsPlugin()],
    ...option,
  })

  // Create context for CJS build
  const cjsContext = await esbuild.context({
    format: "cjs",
    outfile: "./dist/cjs.js",
    ...option,
  })

  // Start watching both contexts
  await Promise.all([
    esmContext.watch(),
    cjsContext.watch(),
  ])

  console.log('Watching for changes...')

  // Dispose contexts on interrupt
  process.on('SIGINT', async () => {
    await Promise.all([
      esmContext.dispose(),
      cjsContext.dispose(),
    ])
    process.exit(0)
  })
}

run().catch((err) => {
  console.error('Build failed:', err)
  process.exit(1)
})
