import { createModules } from "./modules/_/index"
import hey from "./hey"

export class Dom {
  #items = []

  constructor() {
    this.#create()
  }

  /** Lifecycles */

  #create() {
    this.#items = createModules()
  }

  start() {
    this.#items.forEach(item => item.start?.())
  }

  stop() {
    this.#items.forEach(item => item.stop?.())
  }

  #destroy() {
    this.#items.forEach(item => item.destroy?.())
  }

  /** Transitions */

  handlePageOut() {}
  handlePageIn() {}
}
