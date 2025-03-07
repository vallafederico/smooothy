import Lenis from "lenis"
import gsap from "./gsap"

class Scroll extends Lenis {
  #subscribers = []

  constructor() {
    super()

    gsap.ticker.add(time => {
      this.raf(time * 1000)
    })
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
