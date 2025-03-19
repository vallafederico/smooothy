import { hey } from "../../hey"

// (*) try and merge the observers into one if they are similar in size/params

interface ObserveConfig {
  root?: HTMLElement | null
  rootMargin?: string
  threshold?: number
  autoStart?: boolean
  once?: boolean
  callback?: (data: ObserveEventData) => void
}

interface ObserveEventData {
  entry: IntersectionObserverEntry
  direction: number
}

export class Observe {
  element: HTMLElement
  #config: ObserveConfig
  #observer: IntersectionObserver
  protected isIn(data: ObserveEventData): void {}
  protected isOut(data: ObserveEventData): void {}

  inView: boolean
  callback: ({
    entry,
    direction,
    isIn,
  }: {
    entry: IntersectionObserverEntry
    direction: number
    isIn: boolean
  }) => void

  #lastDirection: number | null = null
  #wasIntersecting: boolean | null = null

  constructor(
    element: HTMLElement,
    config: ObserveConfig = {
      root: null,
      rootMargin: "0px",
      threshold: 0.1,
      autoStart: false,
      once: false,
      callback: null,
    }
  ) {
    this.#handleIntersection = this.#handleIntersection.bind(this)
    this.element = element
    this.#config = config
    this.inView = false
    this.callback = config.callback

    this.#create()

    if (config.autoStart ?? true) this.start()

    hey.on("START", () => this.start())
  }

  #create() {
    this.#observer = new IntersectionObserver(this.#handleIntersection, {
      ...this.#config,
      threshold: [0, this.#config.threshold || 0.1],
    })
  }

  #handleIntersection = ([entry]: IntersectionObserverEntry[]) => {
    const { isIntersecting, intersectionRatio, boundingClientRect } = entry
    const threshold = this.#config.threshold || 0.1

    if (this.#wasIntersecting !== null) {
      this.#lastDirection = isIntersecting
        ? boundingClientRect.top > 0
          ? 1
          : -1
        : boundingClientRect.top > 0
          ? -1
          : 1
    }

    this.#wasIntersecting = isIntersecting
    if (intersectionRatio === 0) {
      this.inView = false
      this.#isOut(entry, this.#lastDirection!)
      this.callback?.({ entry, direction: this.#lastDirection!, isIn: false })
    } else if (intersectionRatio >= threshold) {
      this.inView = true
      this.#isIn(entry, this.#lastDirection!)
      this.callback?.({ entry, direction: this.#lastDirection!, isIn: true })
    }
  }

  #isIn(entry: IntersectionObserverEntry, direction: number) {
    if (this.#config.once && this.inView) this.stop()
    // console.log("IN", direction)

    this.inView = true
    this.isIn?.({ entry, direction: direction || -1 })
  }

  #isOut(entry: IntersectionObserverEntry, direction: number) {
    // if (!this.inView) return
    // console.log("OUT", direction)

    this.inView = false
    this.isOut?.({ entry, direction: direction || -1 })
  }

  start() {
    this.#observer.observe(this.element)
  }

  stop() {
    this.#observer.unobserve(this.element)
  }

  destroy() {
    this.stop()
    this.#observer.disconnect()
    this.isIn = undefined
    this.isOut = undefined
    this.#lastDirection = null
    this.#wasIntersecting = null
  }
}
