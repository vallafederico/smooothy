import Lenis from "lenis"

class Scroll extends Lenis {
  #subscribers = []

  constructor() {
    super()
  }

  subscribe(fn: (time: number) => void, id = Symbol()) {
    this.#subscribers.push({ fn, id })
    return () => this.unsubscribe(id)
  }

  unsubscribe(id: Symbol) {
    this.#subscribers = this.#subscribers.filter(
      subscriber => subscriber.id !== id
    )
  }
}

export default new Scroll()
