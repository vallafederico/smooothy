import VirtualScroll from "virtual-scroll"
import { damp, symmetricMod } from "./utils"

// (*) [PERF] make parallax values dependant on getParallax config
// (*) [PERF] only run raf when needed (watch for non standard events)

/** default config */
const DEFAULT_CONFIG = {
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
    // (* NEEDS DOCS)
    mouseMultiplier: 0.5,
    touchMultiplier: 2,
    firefoxMultiplier: 30,
    useKeyboard: false,
    passive: true,
  },
  setOffset: ({ itemWidth, wrapperWidth }) => itemWidth,

  /** Functionality */
  scrollInput: false,
  // getParallax: false, // (* NEEDS DOCS)

  /** Callbacks */
  // onSlideChange: null,
  // onResize: null,
  // onUpdate: null,
}

export class Core {
  /* config */
  speed = 0
  #lspeed = 0
  #offset = 0
  #previousTime = 0
  deltaTime = 0 // (* NEEDS DOCS)

  /* flags */
  #isActive = true
  #isPaused = false

  #currentSlide = 0
  #previousSlide = 0

  constructor(wrapper, config = {}) {
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
    this.items = [...wrapper.children]

    // State
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
    // this.#setupParallaxItems()
    this.#setupIntersectionObserver()
    this.#addEventListeners()
    this.wrapper.style.cursor = "grab"

    this.#setupViewport()
    this.#setupVirtualScroll()
  }

  #setupIntersectionObserver() {
    const options = {
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

  #setupViewport() {
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

  #addEventListeners() {
    this.wrapper.addEventListener("mousedown", e => this.#handleDragStart(e))
    window.addEventListener("mousemove", e => this.#handleDragMove(e))
    window.addEventListener("mouseup", () => this.#handleDragEnd())

    const SCROLL_THRESHOLD = 5

    this.wrapper.addEventListener("touchstart", e => {
      const touch = e.touches[0]
      this.touchStartY = touch.clientY
      this.touchStartX = touch.clientX
      this.scrollDirection = null
      this.#handleDragStart(touch)
    })

    window.addEventListener(
      "touchmove",
      e => {
        const touch = e.touches[0]
        const deltaY = Math.abs(touch.clientY - this.touchStartY)
        const deltaX = Math.abs(touch.clientX - this.touchStartX)

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
      },
      { passive: false }
    )

    window.addEventListener("touchend", () => {
      this.scrollDirection = null
      this.#handleDragEnd()
    })

    window.addEventListener("resize", e => {
      if (this.resizeTimeout) clearTimeout(this.resizeTimeout)
      this.resizeTimeout = setTimeout(() => this.#setupViewport(), 10)
    })
  }

  /** Events */

  #calculateBounds(newTarget) {
    if (!this.config.infinite) {
      if (newTarget > this.config.bounceLimit) {
        return this.config.bounceLimit
      } else if (newTarget < this.maxScroll - this.config.bounceLimit) {
        return this.maxScroll - this.config.bounceLimit
      }
    }
    return newTarget
  }

  #setupVirtualScroll() {
    this.virtualScroll = new VirtualScroll({
      ...this.config.virtualScroll,
      el: this.wrapper,
    })

    const SCROLL_THRESHOLD = 5

    this.virtualScroll.on(event => {
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

  #handleDragStart(event) {
    if (this.#isPaused) return
    this.isDragging = true
    this.dragStart = event.clientX
    this.dragStartTarget = this.target
    this.wrapper.style.cursor = "grabbing"
  }

  #handleDragMove(event) {
    if (!this.isDragging || this.#isPaused) return

    const deltaX = event.clientX - this.dragStart
    let newTarget = this.dragStartTarget + deltaX * this.config.dragSensitivity

    this.target = this.#calculateBounds(newTarget)
    this.speed += event.movementX * 0.01
  }

  #handleDragEnd() {
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
  update() {
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

  #updateFinite() {
    this.parallaxValues = this.items.map((item, i) => {
      const translateX = this.current * this.viewport.itemWidth
      item.style.transform = `translateX(${translateX}px)`

      return translateX
    })
  }

  #updateInfinite() {
    this.parallaxValues = this.items.map((item, i) => {
      const unitPos = this.current + i
      const x = symmetricMod(unitPos, this.items.length) - i

      const translateX = x * this.viewport.itemWidth
      item.style.transform = `translateX(${translateX}px)`

      return symmetricMod(unitPos, this.items.length / 2)
    })
  }

  #renderSpeed() {
    this.#lspeed = damp(
      this.#lspeed,
      this.speed,
      1 / this.config.lerpFactor,
      this.deltaTime
    )
    this.speed *= this.config.speedDecay
  }

  goToNext() {
    if (!this.config.infinite) {
      this.target = Math.max(this.maxScroll, Math.round(this.target - 1))
    } else {
      this.target = Math.round(this.target - 1)
    }
  }

  goToPrev() {
    if (!this.config.infinite) {
      this.target = Math.min(0, Math.round(this.target + 1))
    } else {
      this.target = Math.round(this.target + 1)
    }
  }

  goToIndex(index) {
    this.target = -index
  }

  set snap(value) {
    this.config.snap = value
  }

  getProgress() {
    const totalSlides = this.items.length
    const currentIndex = Math.abs(this.current) % totalSlides
    return currentIndex / totalSlides
  }

  destroy() {
    this.kill()
    window.removeEventListener("mousemove", this.#handleDragMove)
    window.removeEventListener("mouseup", this.#handleDragEnd)
    window.removeEventListener("touchmove", this.#handleDragMove)
    window.removeEventListener("touchend", this.#handleDragEnd)
    this.wrapper.removeEventListener("mousedown", this.#handleDragStart)
    this.wrapper.removeEventListener("touchstart", this.#handleDragStart)
    if (this.resizeTimeout) clearTimeout(this.resizeTimeout)
    if (this.virtualScroll && this.config.scrollInput) {
      this.virtualScroll.destroy()
    }
    if (this.observer) {
      this.observer.disconnect()
    }
  }

  get currentSlide() {
    return this.#currentSlide
  }

  #updateCurrentSlide(newSlide) {
    if (this.#currentSlide !== newSlide) {
      this.#previousSlide = this.#currentSlide
      this.#currentSlide = newSlide

      this.onSlideChange?.(this.#currentSlide, this.#previousSlide)
    }
  }

  /** Interfaces */
  kill() {
    this.#isActive = false

    this.items.forEach(item => {
      item.style.transform = ""
    })

    this.current = 0
    this.target = 0
    this.speed = 0
    this.#lspeed = 0
  }

  init() {
    this.#isActive = true
    this.#previousTime = performance.now()
  }

  set paused(value) {
    this.#isPaused = value
  }

  get paused() {
    return this.#isPaused
  }

  get progress() {
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

export default Core
