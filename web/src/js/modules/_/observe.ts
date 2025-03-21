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

interface ObserverGroup {
  config: ObserveConfig
  observer: IntersectionObserver
  elements: Map<
    HTMLElement,
    {
      callbacks: {
        isIn?: (data: ObserveEventData) => void
        isOut?: (data: ObserveEventData) => void
        callback?: (data: any) => void
      }
      once: boolean
      lastDirection?: number
    }
  >
}

export class ObserverManager {
  private static instance: ObserverManager
  private groups: ObserverGroup[] = []

  private constructor() {}

  static getInstance(): ObserverManager {
    if (!ObserverManager.instance) {
      ObserverManager.instance = new ObserverManager()
    }
    return ObserverManager.instance
  }

  private configsMatch(
    config1: ObserveConfig,
    config2: ObserveConfig
  ): boolean {
    return (
      config1.root === config2.root &&
      config1.rootMargin === config2.rootMargin &&
      config1.threshold === config2.threshold
    )
  }

  private handleIntersection(entries: IntersectionObserverEntry[]) {
    entries.forEach(entry => {
      const group = this.groups.find(g => {
        return Array.from(g.elements.keys()).includes(
          entry.target as HTMLElement
        )
      })

      if (!group) return

      const element = entry.target as HTMLElement
      const elementData = group.elements.get(element)
      if (!elementData) return

      const { isIntersecting, intersectionRatio, boundingClientRect } = entry
      const threshold = group.config.threshold || 0.1

      let direction = -1
      if (elementData.lastDirection !== undefined) {
        direction = isIntersecting
          ? boundingClientRect.top > 0
            ? 1
            : -1
          : boundingClientRect.top > 0
            ? -1
            : 1
      }
      elementData.lastDirection = direction

      if (intersectionRatio === 0) {
        elementData.callbacks.isOut?.({ entry, direction })
        elementData.callbacks.callback?.({ entry, direction, isIn: false })
      } else if (intersectionRatio >= threshold) {
        elementData.callbacks.isIn?.({ entry, direction })
        elementData.callbacks.callback?.({ entry, direction, isIn: true })

        if (elementData.once) {
          this.removeElement(element)
        }
      }
    })
  }

  addElement(
    element: HTMLElement,
    config: ObserveConfig,
    callbacks: {
      isIn?: (data: ObserveEventData) => void
      isOut?: (data: ObserveEventData) => void
      callback?: (data: any) => void
    }
  ): ObserverGroup {
    this.removeElement(element)

    let group = this.groups.find(g => this.configsMatch(g.config, config))

    if (!group) {
      const observer = new IntersectionObserver(
        entries => this.handleIntersection(entries),
        {
          ...config,
          threshold: [0, config.threshold || 0.1],
        }
      )

      group = {
        config,
        observer,
        elements: new Map(),
      }
      this.groups.push(group)
    }

    group.elements.set(element, {
      callbacks,
      once: config.once || false,
      lastDirection: undefined,
    })
    group.observer.observe(element)

    return group
  }

  removeElement(element: HTMLElement) {
    const group = this.groups.find(g => g.elements.has(element))
    if (!group) return

    group.observer.unobserve(element)
    group.elements.delete(element)

    if (group.elements.size === 0) {
      group.observer.disconnect()
      this.groups = this.groups.filter(g => g !== group)
    }
  }
}

export class Observe {
  element: HTMLElement
  #config: ObserveConfig
  #group: ObserverGroup
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
    this.element = element
    this.#config = config
    this.inView = false
    this.callback = config.callback

    if (config.autoStart ?? true) this.start()

    hey.on("START", () => this.start())
  }

  start() {
    this.#group = ObserverManager.getInstance().addElement(
      this.element,
      this.#config,
      {
        isIn: data => {
          this.inView = true
          this.isIn?.(data)
        },
        isOut: data => {
          this.inView = false
          this.isOut?.(data)
        },
        callback: this.callback,
      }
    )
  }

  stop() {
    ObserverManager.getInstance().removeElement(this.element)
  }

  destroy() {
    this.stop()
    this.#lastDirection = null
    this.#wasIntersecting = null
  }
}
