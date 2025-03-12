import gsap from "~/js/gsap"

// (*) IMPLEMENT PRIORITY

export class Subscribable {
  #subscribers = []

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

  set subs(value: any) {
    this.#subscribers.forEach(subscriber => subscriber.fn(value))
  }
}

class _Resize extends Subscribable {
  #observer: ResizeObserver
  window = {
    innerWidth: window.innerWidth,
    innerHeight: window.innerHeight,
  }

  constructor() {
    super()
    this.#observer = new ResizeObserver(this.handleResize)
    this.#observer.observe(document.body)
  }

  handleResize = (entries: ResizeObserverEntry[]) => {
    const entry = entries[0]
    if (!entry) return

    const { width, height } = entry.contentRect

    this.window.innerWidth = width
    this.window.innerHeight = height

    this.subs = {
      width,
      height,
    }
  }

  observe(element: Element) {
    this.#observer.observe(element)
  }

  unobserve(element: Element) {
    this.#observer.unobserve(element)
  }
}

export class _Raf extends Subscribable {
  time = 0
  deltaTime = 0
  frame = 0

  constructor() {
    super()
    gsap.ticker.add(this.raf)
  }

  raf = (time: number, deltaTime: number, frame: number) => {
    this.time = time
    this.deltaTime = deltaTime / 1000
    this.frame = frame

    this.subs = {
      time,
      deltaTime,
      frame,
    }
  }
}

export const Resize = new _Resize()
export const Raf = new _Raf()
