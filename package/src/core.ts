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
  itemHeight: number
  wrapperHeight: number
  totalHeight: number
  vertical: boolean
}

interface CoreConfig {
  infinite: boolean
  snap: boolean
  variableWidth: boolean
  vertical: boolean
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
  variableWidth: false,
  vertical: false,
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
  setOffset: ({ itemWidth, wrapperWidth, itemHeight, wrapperHeight, vertical }) =>
    vertical ? itemHeight : itemWidth,

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
  itemWidths: number[] = []
  itemOffsets: number[] = []
  itemHeights: number[] = []
  itemHeightOffsets: number[] = []
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
  touchPreviousX?: number
  touchPreviousY?: number
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

    // Center first slide for variable width non-infinite sliders
    if (
      this.config.variableWidth &&
      !this.config.infinite &&
      this.items.length > 0
    ) {
      const initialTarget = this.#getSnapTargetForIndex(0)
      this.target = initialTarget
      this.current = initialTarget
      // Immediately render the initial position
      this.#updateFiniteVariableWidth()
    }
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
    const itemWidths = this.items.map(
      item => item.getBoundingClientRect().width
    )
    const itemHeights = this.items.map(
      item => item.getBoundingClientRect().height
    )
    const wrapperWidth = this.wrapper.clientWidth
    const wrapperHeight = this.wrapper.clientHeight
    const totalWidth = itemWidths.reduce((sum, width) => sum + width, 0)
    const totalHeight = itemHeights.reduce((sum, height) => sum + height, 0)

    let runningOffset = 0
    this.itemOffsets = itemWidths.map(width => {
      const start = runningOffset
      runningOffset += width
      return start
    })
    this.itemWidths = itemWidths

    let runningHeightOffset = 0
    this.itemHeightOffsets = itemHeights.map(height => {
      const start = runningHeightOffset
      runningHeightOffset += height
      return start
    })
    this.itemHeights = itemHeights

    this.viewport = {
      itemWidth: itemWidths[0] ?? 0,
      wrapperWidth,
      totalWidth,
      itemHeight: itemHeights[0] ?? 0,
      wrapperHeight,
      totalHeight,
      vertical: this.config.vertical,
    }

    this.#offset = this.config.setOffset(this.viewport)

    if (this.config.variableWidth) {
      if (this.config.vertical) {
        this.maxScroll = -(this.viewport.totalHeight - this.#offset)
      } else {
        this.maxScroll = -(this.viewport.totalWidth - this.#offset)
      }
    } else {
      const denominator = this.config.vertical
        ? (this.viewport.itemHeight || 1)
        : (this.viewport.itemWidth || 1)
      const total = this.config.vertical
        ? this.viewport.totalHeight
        : this.viewport.totalWidth
      this.maxScroll = -(total - this.#offset) / denominator
    }

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
      this.touchPreviousX = touch.clientX
      this.touchPreviousY = touch.clientY
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

      // For vertical slider, always allow vertical scrolling
      // For horizontal slider, only allow horizontal scrolling
      const shouldHandle = this.config.vertical
        ? this.scrollDirection === "vertical"
        : this.scrollDirection === "horizontal"

      if (shouldHandle) {
        e.preventDefault()
        this.#handleDragMove(touch)
        if (this.config.vertical) {
          this.touchPreviousY = touch.clientY
        } else {
          this.touchPreviousX = touch.clientX
        }
      }
    }

    const handleTouchEnd = () => {
      this.scrollDirection = undefined
      this.touchPreviousX = undefined
      this.touchPreviousY = undefined
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
      const itemSize = this.config.vertical
        ? this.viewport.itemHeight
        : this.viewport.itemWidth
      const bounce =
        this.config.variableWidth && itemSize
          ? this.config.bounceLimit * itemSize
          : this.config.bounceLimit

      if (newTarget > bounce) {
        return bounce
      } else if (newTarget < this.maxScroll - bounce) {
        return this.maxScroll - bounce
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
          // For vertical slider, allow vertical scrolling; for horizontal, only horizontal
          if (this.config.vertical) {
            if (deltaX > deltaY) return
          } else {
            if (deltaY > deltaX) return
          }
        }

        const delta = this.config.vertical
          ? (!this.config.scrollInput
              ? event.deltaY
              : Math.abs(event.deltaY) > Math.abs(event.deltaX)
                ? event.deltaY
                : event.deltaX)
          : (!this.config.scrollInput
              ? event.deltaX
              : Math.abs(event.deltaX) > Math.abs(event.deltaY)
                ? event.deltaX
                : event.deltaY)

        const deltaFactor = this.config.variableWidth
          ? this.config.scrollSensitivity
          : this.config.scrollSensitivity * 0.001
        const deltaValue = delta * deltaFactor
        let newTarget = this.target + deltaValue

        if (!this.config.infinite) {
          if (newTarget > 0) {
            newTarget = 0
          } else if (newTarget < this.maxScroll) {
            newTarget = this.maxScroll
          }
        }

        this.target = this.#calculateBounds(newTarget)
        this.speed = -deltaValue * (this.config.variableWidth ? 0.1 : 10)
      }
    })
  }

  #handleDragStart(event: MouseEvent | Touch): void {
    if (this.#isPaused) return
    this.isDragging = true
    this.dragStart = this.config.vertical ? event.clientY : event.clientX
    this.dragStartTarget = this.target
    this.wrapper.style.cursor = "grabbing"
  }

  #handleDragMove(event: MouseEvent | Touch): void {
    if (!this.isDragging || this.#isPaused) return

    const delta = this.config.vertical
      ? event.clientY - this.dragStart
      : event.clientX - this.dragStart
    const sensitivity = this.config.variableWidth
      ? 1
      : this.config.dragSensitivity
    let newTarget = this.dragStartTarget + delta * sensitivity

    this.target = this.#calculateBounds(newTarget)

    // Calculate movement for both mouse and touch events
    if ("movementX" in event) {
      // Mouse event - use movementX/movementY property
      const movement = this.config.vertical
        ? (event as MouseEvent).movementY
        : (event as MouseEvent).movementX
      this.speed += movement * 0.01
    } else {
      // Touch event - calculate movement using tracked previous position
      const current = this.config.vertical ? event.clientY : event.clientX
      const previous = this.config.vertical
        ? (this.touchPreviousY || current)
        : (this.touchPreviousX || current)
      const movement = current - previous
      this.speed += movement * 0.01
    }
  }

  #handleDragEnd(): void {
    this.isDragging = false
    this.wrapper.style.cursor = "grab"

    if (this.config.variableWidth) {
      if (!this.config.infinite) {
        if (this.target > 0) {
          this.target = 0
        } else if (this.target < this.maxScroll) {
          this.target = this.maxScroll
        }
      }

      if (this.config.snap) {
        this.target = this.#snapToNearest(this.target)
      }
    } else {
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
  }

  /** Update */
  update(): void {
    if (!this.isVisible || !this.#isActive) return

    const currentTime = performance.now()
    this.deltaTime = (currentTime - this.#previousTime) / 1000
    this.#previousTime = currentTime

    if (this.config.snap && !this.isDragging) {
      if (this.config.variableWidth) {
        const snapped = this.#snapToNearest(this.target)
        const diff = snapped - this.target
        this.target += diff * this.config.snapStrength
      } else {
        const currentSnap = Math.round(this.target)
        const diff = currentSnap - this.target
        this.target += diff * this.config.snapStrength
      }
    }

    this.current = damp(
      this.current,
      this.target,
      1 / this.config.lerpFactor,
      this.deltaTime
    )

    if (this.config.infinite) {
      if (this.config.variableWidth) {
        const wrapperCenter = this.config.vertical
          ? this.viewport.wrapperHeight / 2
          : this.viewport.wrapperWidth / 2
        const centerPos = this.#normalizePosition(
          -this.current + wrapperCenter
        )
        const nearestIndex = this.#findNearestSlide(centerPos)
        this.#updateCurrentSlide(nearestIndex)
        this.#updateInfiniteVariableWidth()
      } else {
        const rawIndex = Math.round(-this.current)
        const length = this.items.length
        const normalizedIndex = ((rawIndex % length) + length) % length
        this.#updateCurrentSlide(normalizedIndex)
        this.#updateInfinite()
      }
    } else {
      if (this.config.variableWidth) {
        const wrapperCenter = this.config.vertical
          ? this.viewport.wrapperHeight / 2
          : this.viewport.wrapperWidth / 2
        const total = this.config.vertical
          ? this.viewport.totalHeight
          : this.viewport.totalWidth
        const normalized = Math.max(
          0,
          Math.min(
            -this.current + wrapperCenter,
            total
          )
        )
        this.#updateCurrentSlide(this.#findNearestSlide(normalized))
        this.#updateFiniteVariableWidth()
      } else {
        this.#updateCurrentSlide(Math.round(Math.abs(this.current)))
        this.#updateFinite()
      }
    }

    this.#renderSpeed()
    this.onUpdate?.(this)
  }

  #updateFinite(): void {
    this.parallaxValues = this.items.map((item, i) => {
      const translate = this.config.vertical
        ? this.current * this.viewport.itemHeight
        : this.current * this.viewport.itemWidth
      const transform = this.config.vertical
        ? `translateY(${translate}px)`
        : `translateX(${translate}px)`
      item.style.transform = transform

      return translate
    })
  }

  #updateInfinite(): void {
    this.parallaxValues = this.items.map((item, i) => {
      const unitPos = this.current + i
      const x = symmetricMod(unitPos, this.items.length) - i

      const itemSize = this.config.vertical
        ? this.viewport.itemHeight
        : this.viewport.itemWidth
      const translate = x * itemSize
      const transform = this.config.vertical
        ? `translateY(${translate}px)`
        : `translateX(${translate}px)`
      item.style.transform = transform

      return symmetricMod(unitPos, this.items.length)
    })
  }

  #getSlideCenter(index: number): number {
    if (this.config.vertical) {
      const height = this.itemHeights[index] ?? this.viewport.itemHeight ?? 0
      const offset = this.itemHeightOffsets[index] ?? 0
      return offset + height / 2
    } else {
      const width = this.itemWidths[index] ?? this.viewport.itemWidth ?? 0
      const offset = this.itemOffsets[index] ?? 0
      return offset + width / 2
    }
  }

  #getSnapTargetForIndex(index: number): number {
    const total = this.config.vertical
      ? (this.viewport.totalHeight || 1)
      : (this.viewport.totalWidth || 1)
    const wrapperCenter = this.config.vertical
      ? this.viewport.wrapperHeight / 2
      : this.viewport.wrapperWidth / 2
    const center = this.#getSlideCenter(index)
    let rawTarget = -(center - wrapperCenter)

    if (this.config.infinite) {
      // Use current position to find shortest path
      const k = Math.round((this.current - rawTarget) / total)
      rawTarget += k * total
    } else {
      rawTarget = Math.min(0, Math.max(this.maxScroll, rawTarget))
    }

    return rawTarget
  }

  #normalizePosition(value: number): number {
    const total = this.config.vertical
      ? (this.viewport.totalHeight || 1)
      : (this.viewport.totalWidth || 1)
    return ((value % total) + total) % total
  }

  #findNearestSlide(position: number): number {
    const offsets = this.config.vertical ? this.itemHeightOffsets : this.itemOffsets
    if (!offsets.length) return 0

    const total = this.config.vertical
      ? (this.viewport.totalHeight || 1)
      : (this.viewport.totalWidth || 1)
    const normalized = this.config.infinite
      ? this.#normalizePosition(position)
      : Math.max(0, Math.min(position, total))

    let nearestIndex = 0
    let minDistance = Number.POSITIVE_INFINITY

    offsets.forEach((offset, index) => {
      const center = this.#getSlideCenter(index)
      const distance = Math.abs(normalized - center)
      if (distance < minDistance) {
        minDistance = distance
        nearestIndex = index
      }
    })

    return nearestIndex
  }

  #snapToNearest(target: number): number {
    const offsets = this.config.vertical ? this.itemHeightOffsets : this.itemOffsets
    if (!offsets.length) return target

    const total = this.config.vertical
      ? (this.viewport.totalHeight || 1)
      : (this.viewport.totalWidth || 1)
    const wrapperCenter = this.config.vertical
      ? this.viewport.wrapperHeight / 2
      : this.viewport.wrapperWidth / 2
    const centerPosition = this.config.infinite
      ? this.#normalizePosition(-target + wrapperCenter)
      : Math.max(0, Math.min(-target + wrapperCenter, total))

    const nearestIndex = this.#findNearestSlide(centerPosition)
    return this.#getSnapTargetForIndex(nearestIndex)
  }

  #updateFiniteVariableWidth(): void {
    this.parallaxValues = this.items.map((item, i) => {
      const translate = this.current
      const offsets = this.config.vertical ? this.itemHeightOffsets : this.itemOffsets
      const transform = this.config.vertical
        ? `translateY(${translate}px)`
        : `translateX(${translate}px)`
      item.style.transform = transform
      return translate + offsets[i]
    })
  }

  #updateInfiniteVariableWidth(): void {
    const total = this.config.vertical
      ? (this.viewport.totalHeight || 1)
      : (this.viewport.totalWidth || 1)
    this.parallaxValues = this.items.map((item, i) => {
      const offsets = this.config.vertical ? this.itemHeightOffsets : this.itemOffsets
      const offset = offsets[i] ?? 0
      const x = symmetricMod(this.current + offset, total) - offset
      const transform = this.config.vertical
        ? `translateY(${x}px)`
        : `translateX(${x}px)`
      item.style.transform = transform
      return symmetricMod(this.current + offset, total)
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
    if (this.config.variableWidth) {
      const nextIndex = this.config.infinite
        ? (this.currentSlide + 1) % this.items.length
        : Math.min(this.currentSlide + 1, this.items.length - 1)
      this.target = this.#getSnapTargetForIndex(nextIndex)
    } else {
      if (!this.config.infinite) {
        this.target = Math.max(this.maxScroll, Math.round(this.target - 1))
      } else {
        this.target = Math.round(this.target - 1)
      }
    }
  }

  goToPrev(): void {
    if (this.config.variableWidth) {
      const prevIndex = this.config.infinite
        ? (this.currentSlide - 1 + this.items.length) % this.items.length
        : Math.max(this.currentSlide - 1, 0)
      this.target = this.#getSnapTargetForIndex(prevIndex)
    } else {
      if (!this.config.infinite) {
        this.target = Math.min(0, Math.round(this.target + 1))
      } else {
        this.target = Math.round(this.target + 1)
      }
    }
  }

  goToIndex(index: number): void {
    if (this.config.variableWidth) {
      const clamped = this.config.infinite
        ? ((index % this.items.length) + this.items.length) % this.items.length
        : Math.min(Math.max(index, 0), this.items.length - 1)
      // #getSnapTargetForIndex now uses shortest path based on current position
      this.target = this.#getSnapTargetForIndex(clamped)
    } else {
      if (this.config.infinite) {
        // Shortest path in terms of slide steps around the loop
        const length = this.items.length
        const targetIndex = ((index % length) + length) % length
        const currentIndex = this.currentSlide

        let diff = targetIndex - currentIndex
        if (diff > length / 2) diff -= length
        if (diff < -length / 2) diff += length

        // Moving one slide forward means target-- (more negative), so subtract diff
        this.target = Math.round(this.target - diff)
      } else {
        // For finite sliders, clamp index and set target directly
        const clamped = Math.min(Math.max(index, 0), this.items.length - 1)
        this.target = -clamped
      }
    }
  }

  set snap(value: boolean) {
    this.config.snap = value
  }

  getProgress(): number {
    if (this.config.variableWidth) {
      const total = this.config.vertical
        ? (this.viewport.totalHeight || 1)
        : (this.viewport.totalWidth || 1)
      const position = ((-this.current % total) + total) % total
      return position / total
    }

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
    this.touchPreviousX = undefined
    this.touchPreviousY = undefined
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
    if (this.config.variableWidth) {
      const total = this.config.vertical
        ? (this.viewport.totalHeight || 1)
        : (this.viewport.totalWidth || 1)
      const position = -this.target

      if (this.config.infinite) {
        const normalized = ((position % total) + total) % total
        return normalized / total
      } else {
        const clamped = Math.max(0, Math.min(position, total))
        return clamped / total
      }
    } else {
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
  }

  resize(): void {
    this.#setupViewport()

    // Re-center current slide for variable width non-infinite sliders
    if (
      this.config.variableWidth &&
      !this.config.infinite &&
      this.items.length > 0
    ) {
      const currentIndex = this.currentSlide
      const snapTarget = this.#getSnapTargetForIndex(currentIndex)
      this.target = snapTarget
      // Only update current if we're already snapped (close to target)
      if (Math.abs(this.current - this.target) < 1) {
        this.current = snapTarget
      }
    }

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
