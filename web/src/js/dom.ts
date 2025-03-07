import { createModules } from "./modules/_/create"

export class Dom {
  #items = []

  constructor() {
    this.#create()
  }

  #create() {
    this.#items = createModules()
  }

  #destroy() {
    this.#items.forEach(item => item.destroy?.())
  }
}
