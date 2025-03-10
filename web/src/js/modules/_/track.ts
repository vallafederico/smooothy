import { clientRect } from "~/js/utils/client-rect"
import { clamp, map } from "~/js/utils/math"
import { Observe } from "./observe"
import { Scroll } from "~/js/scroll"
import { Resize } from "~/js/utils/subscribable"

const DEFAULT_CONFIG: {
  bounds: [number, number]
  top: "top" | "center" | "bottom"
  bottom: "top" | "center" | "bottom"
  callback?: (value: number) => void
} = {
  bounds: [0, 1],
  top: "bottom",
  bottom: "top",
  callback: null,
}

export class Track extends Observe {
  value = 0
  #init = false

  bounds: any
  config: {
    bounds: [number, number]
    top: "top" | "center" | "bottom"
    bottom: "top" | "center" | "bottom"
    callback?: (value: number) => void
  }

  protected resize?: (bounds: any) => void
  protected handleScroll?: (value: number) => void

  #scrollSub: () => void
  #resizeSub: () => void

  constructor(
    element: HTMLElement,
    config: Partial<typeof DEFAULT_CONFIG> = {}
  ) {
    super(element, {
      autoStart: true,
      once: false,
      threshold: 0,
    })

    this.element = element
    this.config = {
      ...DEFAULT_CONFIG,
      ...config,
    }

    this.#resize()
    this.#scrollSub = Scroll.subscribe(this.#handleScroll)
    this.#resizeSub = Resize.subscribe(this.#resize)
    this.#handleScroll()
    this.#init = true
  }

  #resize = () => {
    this.bounds = computeBounds(this.element, this.config)
    this.resize?.(this.bounds)
    this.#handleScroll()
  }

  #handleScroll = () => {
    if (!this.inView && !this.#init) return
    this.value = clamp(
      0,
      1,
      map(
        Scroll.y,
        this.bounds.top,
        this.bounds.bottom,
        this.config.bounds[0],
        this.config.bounds[1]
      )
    )

    // console.log(this.value)
    this.handleScroll?.(this.value)
    this.config.callback?.(this.value)
  }

  destroy() {
    this.config.callback = null
    this.#scrollSub()
    this.#resizeSub()
    super.destroy()
  }
}

// ---------
function computeBounds(el: HTMLElement, config: typeof DEFAULT_CONFIG) {
  const bounds = clientRect(el)
  const { top: topPos, bottom: bottomPos, wh } = bounds

  const centerOffset = wh / 2

  bounds.top =
    topPos -
    (config.top === "center" ? centerOffset : config.top === "bottom" ? wh : 0)

  bounds.bottom =
    bottomPos -
    (config.bottom === "center"
      ? centerOffset
      : config.bottom === "bottom"
        ? wh
        : 0)

  return bounds
}
