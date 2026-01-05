import { readFileSync, existsSync } from "fs"
import { join } from "path"

const distDir = join(process.cwd(), "dist")

interface TestResult {
  name: string
  passed: boolean
  error?: string
}

async function test(name: string, fn: () => void | Promise<void>): Promise<TestResult> {
  try {
    await fn()
    return { name, passed: true }
  } catch (error) {
    return { name, passed: false, error: String(error) }
  }
}

async function runTests() {
  console.log("🧪 Running build verification tests...\n")

  const testPromises: Promise<TestResult>[] = []

  // Test 1: Check that all build files exist
  testPromises.push(test("Build files exist", () => {
    const files = [
      "esm.js",
      "cjs.js",
      "smooothy.min.js",
      "index.d.ts",
      "esm.js.map",
      "cjs.js.map",
    ]

    for (const file of files) {
      const path = join(distDir, file)
      if (!existsSync(path)) {
        throw new Error(`Missing build file: ${file}`)
      }
    }
  }))

  // Test 2: Check that smooothy.min.js attaches to window
  testPromises.push(test("IIFE build attaches to window", () => {
    const filePath = join(distDir, "smooothy.min.js")
    const content = readFileSync(filePath, "utf-8")

    // Check that the file contains window assignment
    const hasWindowAssignment =
      content.includes("window.Smooothy") ||
      content.includes('window["Smooothy"]') ||
      content.includes("window[`Smooothy`]")

    if (!hasWindowAssignment) {
      throw new Error("smooothy.min.js does not contain window.Smooothy assignment")
    }

    // Check for globalThis fallback
    const hasGlobalThis =
      content.includes("globalThis.Smooothy") ||
      content.includes('globalThis["Smooothy"]')

    if (!hasGlobalThis) {
      throw new Error("smooothy.min.js does not contain globalThis.Smooothy fallback")
    }
  }))

  // Test 3: Check ESM exports
  testPromises.push(test("ESM build exports default and named exports", async () => {
    const filePath = join(distDir, "esm.js")
    const content = readFileSync(filePath, "utf-8")

    // Check for default export (Core class)
    const hasDefaultExport =
      content.includes("export default") ||
      content.includes("export{") ||
      content.includes("export {")

    if (!hasDefaultExport) {
      throw new Error("ESM build does not contain default export")
    }

    // Check for named exports
    const hasLerp = content.includes("lerp") || content.includes("export{lerp")
    const hasDamp = content.includes("damp") || content.includes("export{damp")
    const hasSymmetricMod =
      content.includes("symmetricMod") ||
      content.includes("export{symmetricMod")

    if (!hasLerp || !hasDamp || !hasSymmetricMod) {
      throw new Error(
        `ESM build missing named exports. Found: lerp=${hasLerp}, damp=${hasDamp}, symmetricMod=${hasSymmetricMod}`
      )
    }
  }))

  // Test 4: Check CJS exports
  testPromises.push(test("CJS build exports default and named exports", () => {
    const filePath = join(distDir, "cjs.js")
    const content = readFileSync(filePath, "utf-8")

    // Check for module.exports
    if (!content.includes("module.exports")) {
      throw new Error("CJS build does not contain module.exports")
    }

    // Check for __export pattern (Bun's CJS export pattern)
    // The exports are wrapped in __export with getters
    const hasExportPattern = content.includes("__export") || content.includes("exports_package")
    
    // Check that the named exports are referenced in the export object
    const hasLerp = content.includes("lerp:") || content.includes('"lerp"') || content.includes("'lerp'")
    const hasDamp = content.includes("damp:") || content.includes('"damp"') || content.includes("'damp'")
    const hasSymmetricMod = 
      content.includes("symmetricMod:") || 
      content.includes('"symmetricMod"') || 
      content.includes("'symmetricMod'")

    if (!hasLerp || !hasDamp || !hasSymmetricMod) {
      throw new Error(
        `CJS build missing named exports in export object. Found: lerp=${hasLerp}, damp=${hasDamp}, symmetricMod=${hasSymmetricMod}`
      )
    }

    // Check for default export
    const hasDefault = content.includes("default:") || content.includes('"default"') || content.includes("'default'")
    if (!hasDefault) {
      throw new Error("CJS build missing default export in export object")
    }
  }))

  // Test 5: Verify exports by actually importing them (if possible)
  testPromises.push(test("ESM build can be imported", async () => {
    try {
      const esmPath = join(distDir, "esm.js")
      const module = await import(esmPath)

      // Check default export (Core class)
      if (!module.default) {
        throw new Error("ESM build missing default export")
      }

      // Check if default is a class (has constructor)
      if (typeof module.default !== "function") {
        throw new Error("ESM default export is not a class/function")
      }

      // Check named exports
      if (typeof module.lerp !== "function") {
        throw new Error("ESM build missing lerp export")
      }
      if (typeof module.damp !== "function") {
        throw new Error("ESM build missing damp export")
      }
      if (typeof module.symmetricMod !== "function") {
        throw new Error("ESM build missing symmetricMod export")
      }
    } catch (error: any) {
      // If import fails, it might be a syntax issue
      throw new Error(`Failed to import ESM build: ${error.message}`)
    }
  }))

  testPromises.push(test("CJS build can be imported", async () => {
    try {
      const cjsPath = join(distDir, "cjs.js")
      // Use dynamic import for CJS (works in Bun)
      const module = await import(cjsPath)

      // CJS modules exported via __toCommonJS have:
      // - module.default is an object with __esModule: true
      // - module.default.default is the Core class
      // - module.lerp, module.damp, module.symmetricMod are available at top level
      
      // Check default export structure
      if (!module.default) {
        throw new Error("CJS build missing default export")
      }

      // The actual Core class is at module.default.default
      const coreClass = module.default?.default
      if (!coreClass || typeof coreClass !== "function") {
        throw new Error(
          `CJS default export is not a class/function. Got: ${typeof module.default}, default.default: ${typeof coreClass}`
        )
      }

      // Check named exports at top level
      if (!module.lerp || typeof module.lerp !== "function") {
        throw new Error(`CJS build missing lerp export. Available keys: ${Object.keys(module).join(", ")}`)
      }
      if (!module.damp || typeof module.damp !== "function") {
        throw new Error(`CJS build missing damp export`)
      }
      if (!module.symmetricMod || typeof module.symmetricMod !== "function") {
        throw new Error(`CJS build missing symmetricMod export`)
      }
    } catch (error: any) {
      throw new Error(`Failed to import CJS build: ${error.message}`)
    }
  }))

  // Test 6: Verify type definitions exist
  testPromises.push(test("Type definitions file exists and contains Core", () => {
    const filePath = join(distDir, "index.d.ts")
    const content = readFileSync(filePath, "utf-8")

    if (!content.includes("class Core")) {
      throw new Error("Type definitions missing Core class")
    }

    if (!content.includes("lerp")) {
      throw new Error("Type definitions missing lerp")
    }

    if (!content.includes("damp")) {
      throw new Error("Type definitions missing damp")
    }

    if (!content.includes("symmetricMod")) {
      throw new Error("Type definitions missing symmetricMod")
    }
  }))

  // Wait for all tests to complete
  const results = await Promise.all(testPromises)

  // Print results
  console.log("\n📊 Test Results:\n")
  let passed = 0
  let failed = 0

  for (const result of results) {
    if (result.passed) {
      console.log(`✅ ${result.name}`)
      passed++
    } else {
      console.log(`❌ ${result.name}`)
      if (result.error) {
        console.log(`   Error: ${result.error}`)
      }
      failed++
    }
  }

  console.log(`\n${passed} passed, ${failed} failed\n`)

  if (failed > 0) {
    console.error("❌ Build verification failed!")
    process.exit(1)
  } else {
    console.log("✅ All build verification tests passed!")
    process.exit(0)
  }
}

runTests()

