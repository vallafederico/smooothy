interface ObserveConfig {
  root?: HTMLElement | null
  rootMargin?: string
  threshold?: number
  autoStart?: boolean
  once?: boolean
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

  #lastDirection: number | null = null
  #wasIntersecting: boolean | null = null

  constructor(
    element: HTMLElement,
    config: ObserveConfig = {
      root: null,
      rootMargin: "0px",
      threshold: 0.1,
      autoStart: true,
      once: false,
    }
  ) {
    this.#handleIntersection = this.#handleIntersection.bind(this)
    this.element = element
    this.#config = config
    this.inView = false

    this.#create()

    if (config.autoStart ?? true) this.start()
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
    } else if (intersectionRatio >= threshold) {
      this.inView = true
      this.#isIn(entry, this.#lastDirection!)
    }
  }

  #isIn(entry: IntersectionObserverEntry, direction: number) {
    if (this.#config.once && this.inView) this.stop()
    // console.log("IN", direction)

    this.inView = true
    this.isIn?.({ entry, direction })
  }

  #isOut(entry: IntersectionObserverEntry, direction: number) {
    // if (!this.inView) return
    // console.log("OUT", direction)

    this.inView = false
    this.isOut?.({ entry, direction })
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
