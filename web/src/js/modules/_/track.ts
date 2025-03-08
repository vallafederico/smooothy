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

  bounds: any
  config: {
    bounds: [number, number]
    top: "top" | "center" | "bottom"
    bottom: "top" | "center" | "bottom"
    callback?: (value: number) => void
  }

  resize?: (bounds: any) => void
  handleScroll?: (value: number) => void

  #scrollSub: () => void
  #resizeSub: () => void

  constructor(
    element: HTMLElement,
    {
      config = DEFAULT_CONFIG,
    }: {
      config?: Partial<typeof DEFAULT_CONFIG>
    } = {
      config: DEFAULT_CONFIG,
    }
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
  }

  #resize = () => {
    this.bounds = computeBounds(this.element, this.config)
    this.resize?.(this.bounds)
    this.#handleScroll()
  }

  #handleScroll = () => {
    if (!this.inView) return
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

  switch (config.top) {
    case "top":
      bounds.top = bounds.top
      break
    case "center":
      bounds.top = bounds.top - bounds.wh / 2
      break
    case "bottom":
      bounds.top = bounds.top - bounds.wh
      break
  }

  switch (config.bottom) {
    case "top":
      bounds.bottom = bounds.bottom
      break
    case "center":
      bounds.bottom = bounds.bottom - bounds.wh / 2
      break
    case "bottom":
      bounds.bottom = bounds.bottom - bounds.wh
      break
  }

  return bounds
}
