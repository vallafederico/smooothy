import { readFileSync, writeFileSync } from "fs"

export function addGlobalName(filePath: string, globalName: string) {
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
