import VirtualScroll from "virtual-scroll"
import { damp, symmetricMod } from "./utils"

interface VirtualScrollConfig {
  mouseMultiplier: number
  touchMultiplier: number
  firefoxMultiplier: number
  useKeyboard: boolean
  passive: boolean
}

interface Viewport {
  itemWidth: number
  wrapperWidth: number
  totalWidth: number
}

interface CoreConfig {
  infinite: boolean
  snap: boolean
  dragSensitivity: number
  lerpFactor: number
  scrollSensitivity: number
  snapStrength: number
  speedDecay: number
  bounceLimit: number
  virtualScroll: VirtualScrollConfig
  setOffset: (viewport: Viewport) => number
  scrollInput: boolean
  onSlideChange?: (current: number, previous: number) => void
  onResize?: (core: Core) => void
  onUpdate?: (core: Core) => void
}

/** default config */
const DEFAULT_CONFIG: CoreConfig = {
  /** Params */
  infinite: true,
  snap: true,
  dragSensitivity: 0.005,
  lerpFactor: 0.3,
  scrollSensitivity: 1,
  snapStrength: 0.1,
  speedDecay: 0.85,
  bounceLimit: 1,
  virtualScroll: {
    mouseMultiplier: 0.5,
    touchMultiplier: 2,
    firefoxMultiplier: 30,
    useKeyboard: false,
    passive: true,
  },
  setOffset: ({ itemWidth, wrapperWidth }) => itemWidth,

  /** Functionality */
  scrollInput: false,
}

export class Core {
  /* config */
  speed: number = 0
  #lspeed: number = 0
  #offset: number = 0
  #previousTime: number = 0
  deltaTime: number = 0

  /* flags */
  #isActive: boolean = true
  #isPaused: boolean = false

  #currentSlide: number = 0
  #previousSlide: number = 0

  config: CoreConfig
  wrapper: HTMLElement
  items: HTMLElement[]
  viewport!: Viewport
  isDragging: boolean = false
  dragStart: number = 0
  dragStartTarget: number = 0
  isVisible: boolean = false
  current: number = 0
  target: number = 0
  maxScroll: number = 0
  resizeTimeout?: ReturnType<typeof setTimeout>
  virtualScroll?: any
  observer?: IntersectionObserver
  touchStartY?: number
  touchStartX?: number
  scrollDirection?: "horizontal" | "vertical"
  parallaxValues?: number[]
  webglValue: number = 0 // (*) ADD WEBGL VALUE TO SLIDER (better name)

  onSlideChange?: (current: number, previous: number) => void
  onResize?: (core: Core) => void
  onUpdate?: (core: Core) => void

  constructor(wrapper: HTMLElement, config: Partial<CoreConfig> = {}) {
    this.config = {
      ...DEFAULT_CONFIG,
      ...config,
    }

    if (config.onSlideChange) this.onSlideChange = config.onSlideChange
    if (config.onResize) this.onResize = config.onResize
    if (config.onUpdate) this.onUpdate = config.onUpdate

    delete this.config.onSlideChange
    delete this.config.onResize
    delete this.config.onUpdate

    this.wrapper = wrapper
    this.items = [...wrapper.children] as HTMLElement[]

    this.current = 0
    this.target = 0
    this.isDragging = false
    this.dragStart = 0
    this.dragStartTarget = 0
    this.isVisible = false

    this.#currentSlide = 0
    this.#previousSlide = 0

    // Initialize
    this.#setupViewport()
    this.#setupIntersectionObserver()
    this.#addEventListeners()
    this.wrapper.style.cursor = "grab"

    this.#setupViewport()
    this.#setupVirtualScroll()
  }

  #setupIntersectionObserver(): void {
    const options: IntersectionObserverInit = {
      root: null,
      rootMargin: "50px",
      threshold: 0,
    }

    this.observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        this.isVisible = entry.isIntersecting
      })
    }, options)

    this.observer.observe(this.wrapper)
  }

  #setupViewport(): void {
    this.viewport = {
      itemWidth: this.items[0].getBoundingClientRect().width,
      wrapperWidth: this.wrapper.clientWidth,
      totalWidth: this.items.reduce((sum, item) => sum + item.clientWidth, 0),
    }

    this.#offset = this.config.setOffset(this.viewport)

    this.maxScroll =
      -(this.viewport.totalWidth - this.#offset) / this.viewport.itemWidth

    queueMicrotask(() => {
      this.onResize?.(this)
    })
  }

  #addEventListeners(): void {
    const handleMouseDown = (e: MouseEvent) => this.#handleDragStart(e)
    const handleMouseMove = (e: MouseEvent) => this.#handleDragMove(e)
    const handleMouseUp = () => this.#handleDragEnd()

    this.wrapper.addEventListener("mousedown", handleMouseDown)
    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("mouseup", handleMouseUp)

    const SCROLL_THRESHOLD = 5

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0]
      this.touchStartY = touch.clientY
      this.touchStartX = touch.clientX
      this.scrollDirection = undefined
      this.#handleDragStart(touch)
    }

    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0]
      const deltaY = Math.abs(touch.clientY - this.touchStartY!)
      const deltaX = Math.abs(touch.clientX - this.touchStartX!)

      if (
        !this.scrollDirection &&
        (deltaX > SCROLL_THRESHOLD || deltaY > SCROLL_THRESHOLD)
      ) {
        this.scrollDirection = deltaX > deltaY ? "horizontal" : "vertical"
      }

      if (this.scrollDirection === "horizontal") {
        e.preventDefault()
        this.#handleDragMove(touch)
      }
    }

    const handleTouchEnd = () => {
      this.scrollDirection = undefined
      this.#handleDragEnd()
    }

    this.wrapper.addEventListener("touchstart", handleTouchStart)
    window.addEventListener("touchmove", handleTouchMove, { passive: false })
    window.addEventListener("touchend", handleTouchEnd)

    const resizeObserver = new ResizeObserver(() => {
      if (this.resizeTimeout) clearTimeout(this.resizeTimeout)
      this.resizeTimeout = setTimeout(() => this.resize(), 10)
    })
    resizeObserver.observe(this.wrapper)
  }

  /** Events */

  #calculateBounds(newTarget: number): number {
    if (!this.config.infinite) {
      if (newTarget > this.config.bounceLimit) {
        return this.config.bounceLimit
      } else if (newTarget < this.maxScroll - this.config.bounceLimit) {
        return this.maxScroll - this.config.bounceLimit
      }
    }
    return newTarget
  }

  #setupVirtualScroll(): void {
    this.virtualScroll = new VirtualScroll({
      ...this.config.virtualScroll,
      el: this.wrapper,
    })

    const SCROLL_THRESHOLD = 5

    this.virtualScroll.on((event: any) => {
      if (!this.isDragging && !this.#isPaused) {
        if (event.touchDevice) {
          const deltaY = Math.abs(event.deltaY)
          const deltaX = Math.abs(event.deltaX)

          if (deltaY < SCROLL_THRESHOLD && deltaX < SCROLL_THRESHOLD) return
          if (deltaY > deltaX) return
        }

        const delta = !this.config.scrollInput
          ? event.deltaX
          : Math.abs(event.deltaX) > Math.abs(event.deltaY)
            ? event.deltaX
            : event.deltaY

        const deltaX = delta * this.config.scrollSensitivity * 0.001
        let newTarget = this.target + deltaX

        if (!this.config.infinite) {
          if (newTarget > 0) {
            newTarget = 0
          } else if (newTarget < this.maxScroll) {
            newTarget = this.maxScroll
          }
        }

        this.target = this.#calculateBounds(newTarget)
        this.speed = -deltaX * 10
      }
    })
  }

  #handleDragStart(event: MouseEvent | Touch): void {
    if (this.#isPaused) return
    this.isDragging = true
    this.dragStart = event.clientX
    this.dragStartTarget = this.target
    this.wrapper.style.cursor = "grabbing"
  }

  #handleDragMove(event: MouseEvent | Touch): void {
    if (!this.isDragging || this.#isPaused) return

    const deltaX = event.clientX - this.dragStart
    let newTarget = this.dragStartTarget + deltaX * this.config.dragSensitivity

    this.target = this.#calculateBounds(newTarget)
    if ("movementX" in event) {
      this.speed += event.movementX * 0.01
    }
  }

  #handleDragEnd(): void {
    this.isDragging = false
    this.wrapper.style.cursor = "grab"

    if (!this.config.infinite) {
      if (this.target > 0) {
        this.target = 0
      } else if (this.target < this.maxScroll) {
        this.target = this.maxScroll
      } else if (this.config.snap) {
        const snapped = Math.round(this.target)
        this.target = Math.min(0, Math.max(this.maxScroll, snapped))
      }
    } else if (this.config.snap) {
      this.target = Math.round(this.target)
    }
  }

  /** Update */
  update(): void {
    if (!this.isVisible || !this.#isActive) return

    const currentTime = performance.now()
    this.deltaTime = (currentTime - this.#previousTime) / 1000
    this.#previousTime = currentTime

    if (this.config.snap && !this.isDragging) {
      const currentSnap = Math.round(this.target)
      const diff = currentSnap - this.target
      this.target += diff * this.config.snapStrength
    }

    this.current = damp(
      this.current,
      this.target,
      1 / this.config.lerpFactor,
      this.deltaTime
    )

    if (this.config.infinite) {
      const rawIndex = Math.round(-this.current)
      const length = this.items.length
      const normalizedIndex = ((rawIndex % length) + length) % length
      this.#updateCurrentSlide(normalizedIndex)
      this.#updateInfinite()
    } else {
      this.#updateCurrentSlide(Math.round(Math.abs(this.current)))
      this.#updateFinite()
    }

    this.#renderSpeed()
    this.onUpdate?.(this)
  }

  #updateFinite(): void {
    this.parallaxValues = this.items.map((item, i) => {
      const translateX = this.current * this.viewport.itemWidth
      item.style.transform = `translateX(${translateX}px)`

      return translateX
    })
  }

  #updateInfinite(): void {
    this.parallaxValues = this.items.map((item, i) => {
      const unitPos = this.current + i
      const x = symmetricMod(unitPos, this.items.length) - i

      const translateX = x * this.viewport.itemWidth
      item.style.transform = `translateX(${translateX}px)`

      return symmetricMod(unitPos, this.items.length)
    })
  }

  #renderSpeed(): void {
    this.#lspeed = damp(
      this.#lspeed,
      this.speed,
      1 / this.config.lerpFactor,
      this.deltaTime
    )
    this.speed *= this.config.speedDecay
  }

  goToNext(): void {
    if (!this.config.infinite) {
      this.target = Math.max(this.maxScroll, Math.round(this.target - 1))
    } else {
      this.target = Math.round(this.target - 1)
    }
  }

  goToPrev(): void {
    if (!this.config.infinite) {
      this.target = Math.min(0, Math.round(this.target + 1))
    } else {
      this.target = Math.round(this.target + 1)
    }
  }

  goToIndex(index: number): void {
    this.target = -index
  }

  set snap(value: boolean) {
    this.config.snap = value
  }

  getProgress(): number {
    const totalSlides = this.items.length
    const currentIndex = Math.abs(this.current) % totalSlides
    return currentIndex / totalSlides
  }

  destroy(): void {
    this.kill()
    window.removeEventListener("mousemove", (e: MouseEvent) =>
      this.#handleDragMove(e)
    )
    window.removeEventListener("mouseup", () => this.#handleDragEnd())
    window.removeEventListener("touchmove", (e: TouchEvent) => {
      const touch = e.touches[0]
      this.#handleDragMove(touch)
    })
    window.removeEventListener("touchend", () => this.#handleDragEnd())
    this.wrapper.removeEventListener("mousedown", (e: MouseEvent) =>
      this.#handleDragStart(e)
    )
    this.wrapper.removeEventListener("touchstart", (e: TouchEvent) => {
      const touch = e.touches[0]
      this.#handleDragStart(touch)
    })
    if (this.resizeTimeout) clearTimeout(this.resizeTimeout)
    if (this.virtualScroll && this.config.scrollInput) {
      this.virtualScroll.destroy()
    }
    if (this.observer) {
      this.observer.disconnect()
    }
  }

  get currentSlide(): number {
    return this.#currentSlide
  }

  #updateCurrentSlide(newSlide: number): void {
    if (this.#currentSlide !== newSlide) {
      this.#previousSlide = this.#currentSlide
      this.#currentSlide = newSlide

      this.onSlideChange?.(this.#currentSlide, this.#previousSlide)
    }
  }

  /** Interfaces */
  kill(): void {
    this.#isActive = false

    this.items.forEach(item => {
      item.style.transform = ""
    })

    this.current = 0
    this.target = 0
    this.speed = 0
    this.#lspeed = 0
  }

  init(): void {
    this.#isActive = true
    this.#previousTime = performance.now()
  }

  set paused(value: boolean) {
    this.#isPaused = value
  }

  get paused(): boolean {
    return this.#isPaused
  }

  get progress(): number {
    if (this.config.infinite) {
      const position = -this.target
      const total = this.items.length
      const normalizedPos = ((position % total) + total) % total

      return normalizedPos / (total - 1)
    } else {
      const current = Math.abs(this.current)
      const total = Math.abs(this.maxScroll)
      return Math.max(0, Math.min(1, current / total))
    }
  }

  resize(): void {
    this.#setupViewport()

    // Force a single update, bypassing visibility check
    const wasActive = this.#isActive
    const wasVisible = this.isVisible

    this.#isActive = true
    this.isVisible = true
    this.update()

    this.#isActive = wasActive
    this.isVisible = wasVisible
  }
}

export default Core

// ////////////////////////////////////////

/*
- [ ] ...

    
*/

/*
TODO

(*) ADD WEBGL VALUE UTILS
(/fslider.ts)

  const x =
    symmetricMod(this.current, this.items.length) *
    this.viewport.itemWidth *
    Gl.vp.px

*/
