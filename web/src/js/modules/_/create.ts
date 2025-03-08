const modules = import.meta.glob(`../*.ts`, { eager: true })

export function createModules(dataAttribute = "module") {
  return [...document.querySelectorAll(`[data-${dataAttribute}]`)]
    .map((element: HTMLElement) => {
      const attributeValue = element.dataset[dataAttribute]
      const modulePath = `../${attributeValue}.ts`

      if (modules[modulePath]) {
        const ModuleClass = Object.values(modules[modulePath])[0]
        try {
          return new ModuleClass(element)
        } catch (error) {
          console.error(
            `Failed to instantiate ${dataAttribute} ${attributeValue}:`,
            error
          )
          return null
        }
      } else {
        console.error(`${dataAttribute} not found: ${attributeValue}`)
        return null
      }
    })
    .filter(item => item !== null)
}
