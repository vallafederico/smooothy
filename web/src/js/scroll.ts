import Lenis from "lenis"
import gsap from "./gsap"

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

  y = window.scrollY
  max = window.innerHeight
  speed = 0
  percent = 0

  constructor() {
    super(SCROLL_CONFIG)
    this.#init()
  }

  #init() {
    gsap.ticker.add(time => this.raf(time * 1000))
    this.percent = this.y / (document.body.scrollHeight - this.max)
    this.on("scroll", this.#handleScroll)
  }

  #handleScroll = ({ scroll, limit, velocity, progress }) => {
    this.y = scroll
    this.max = limit
    this.speed = velocity
    this.percent = progress
    this.#subs = { scroll, limit, velocity, progress }
  }

  set #subs(value: {
    scroll: number
    limit: number
    velocity: number
    progress: number
  }) {
    this.#subscribers.forEach(subscriber => subscriber.fn(value))
  }

  subscribe(fn: (time: number) => void, id = Symbol()) {
    this.#subscribers.push({ fn, id })
    return () => this.#unsubscribe(id)
  }

  #unsubscribe(id: Symbol) {
    this.#subscribers = this.#subscribers.filter(
      subscriber => subscriber.id !== id
    )
  }
}

export const Scroll = new _Scroll()
