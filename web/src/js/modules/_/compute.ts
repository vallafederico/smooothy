export function computeModules() {
  const modules = import.meta.glob("../*.ts", { eager: true })

  return [...document.querySelectorAll("[data-module]")]
    .map((element: HTMLElement) => {
      const moduleName = element.dataset.module
      const modulePath = `../${moduleName}.ts`

      if (modules[modulePath]) {
        const ModuleClass = Object.values(modules[modulePath])[0]
        try {
          return new ModuleClass(element)
        } catch (error) {
          console.error(`Failed to instantiate module ${moduleName}:`, error)
          return null
        }
      } else {
        console.error(`Module not found: ${moduleName}`)
        return null
      }
    })
    .filter(item => item !== null)
}
