import Lenis from "lenis"
import gsap from "./gsap"
import { Gl } from "./gl/gl"

const SCROLL_CONFIG = {
  // wrapper: document.body,
  // content: document.body,
  // lerp: 0.05,
  // smoothWheel: true,
  // smoothTouch: false,
  // touchMultiplier: 2,
  // touchInertiaMultiplier: 2,
  // autoResize: false,
}

class _Scroll extends Lenis {
  #subscribers = []

  y = window.scrollY || 0
  max = window.innerHeight
  speed = 0
  percent = 0
  ygl = window.scrollY * Gl.vp.px

  constructor() {
    super(SCROLL_CONFIG)
    this.#init()
  }

  #init() {
    this.percent = this.y / (document.body.scrollHeight - this.max)
    this.ygl = this.y * Gl.vp.px

    this.on("scroll", this.#handleScroll)
    gsap.ticker.add(time => this.raf(time * 1000))
  }

  #handleScroll = ({ scroll, limit, velocity, progress }) => {
    this.y = scroll
    this.max = limit
    this.speed = velocity
    this.percent = progress
    this.ygl = scroll * Gl.vp.px

    this.#subscribers.forEach(subscriber =>
      subscriber.fn({ scroll, limit, velocity, progress })
    )
  }

  subscribe(fn: (time: number) => void, priority = 5, id = Symbol()) {
    const subscriber = { fn, id, priority }
    const index = this.#subscribers.findIndex(sub => sub.priority <= priority)

    if (index === -1) {
      this.#subscribers.push(subscriber)
    } else {
      this.#subscribers.splice(index, 0, subscriber)
    }

    return () => this.#unsubscribe(id)
  }

  #unsubscribe(id: Symbol) {
    this.#subscribers = this.#subscribers.filter(
      subscriber => subscriber.id !== id
    )
  }
}

export const Scroll = new _Scroll()
