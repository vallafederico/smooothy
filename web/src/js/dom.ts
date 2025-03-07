import { computeModules } from "./modules/_/compute"

export class Dom {
  #items = []

  constructor() {
    this.#create()
  }

  #create() {
    this.#items = computeModules()
  }

  #destroy() {
    this.#items.forEach(item => item.destroy?.())
  }
}

// utils
