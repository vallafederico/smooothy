import gsap from "~/js/gsap"

export class Subscribable {
  #subscribers = []

  subscribe(fn: (time: number) => void, id = Symbol()) {
    this.#subscribers.push({ fn, id })
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
  window = {
    innerWidth: window.innerWidth,
    innerHeight: window.innerHeight,
  }

  #observer: ResizeObserver

  constructor() {
    super()
    this.#observer = new ResizeObserver(this.handleResize)
    // Observe the document body by default
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

  // Add method to observe different elements
  observe(element: Element) {
    this.#observer.observe(element)
  }

  // Add method to stop observing
  unobserve(element: Element) {
    this.#observer.unobserve(element)
  }
}

export class _Raf extends Subscribable {
  constructor() {
    super()
  }

  raf = () => {
    this.subs = {
      time: performance.now(),
    }
  }
}

export const Resize = new _Resize()
export const Raf = new _Raf()
