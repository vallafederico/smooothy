import VirtualScroll from "virtual-scroll"
import { damp, lerp, symmetricMod } from "./utils"

/** default config */
const DEFAULT_CONFIG = {
  // params
  dragSensitivity: 0.005,
  lerpFactor: 0.08,
  infinite: true,
  scrollSensitivity: 1,
  snap: true,
  snapStrength: 0.1,
  speedDecay: 0.85,
  totalWidthOffset: ({ itemWidth, wrapperWidth }) => itemWidth,
  // functionlity
  useScroll: false,
  // callbacks
  onSlideChange: null,
  onResize: null,
  onUpdate: null,
}

export class Core {
  /* config */
  speed = 0
  #lspeed = 0
  #_bounceLimit = 0.5 // How far past the edges we can drag
  #offset = 0
  #previousTime = 0
  #deltaTime = 0

  #currentSlide = 0
  #previousSlide = 0 // Add this to track previous slide

  /* callbacks */
  #onSlideChange = null // Add callback property
  #onResize = null

  /* flags */
  #isActive = true
  #isPaused = false // New flag for pause state

  constructor(wrapper, config = {}) {
    this.config = {
      ...DEFAULT_CONFIG,
      ...config,
    }

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
    this.#setupParallaxItems()
    this.#setupIntersectionObserver()
    this.#addEventListeners()
    this.wrapper.style.cursor = "grab"

    this.#setupViewport()
    this.#setupVirtualScroll()
    this.speed = 0 // Initialize in constructor
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

    this.#offset = this.config.totalWidthOffset(this.viewport)

    this.maxScroll =
      -(this.viewport.totalWidth - this.#offset) / this.viewport.itemWidth

    queueMicrotask(() => {
      this.config.onResize?.(this)
    })
  }

  #setupParallaxItems() {
    this.parallaxItems = this.items
      .map(item => {
        const elements = [...item.querySelectorAll("[data-parallax]")].map(
          el => ({
            element: el,
            value: +el.dataset.parallax || 1,
          })
        )
        return elements.length ? elements : null
      })
      .filter(Boolean)
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

        // Determine direction only if we haven't yet and threshold is met
        if (
          !this.scrollDirection &&
          (deltaX > SCROLL_THRESHOLD || deltaY > SCROLL_THRESHOLD)
        ) {
          this.scrollDirection = deltaX > deltaY ? "horizontal" : "vertical"
        }

        // If horizontal, prevent default and handle drag
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
      if (newTarget > this.#_bounceLimit) {
        return this.#_bounceLimit
      } else if (newTarget < this.maxScroll - this.#_bounceLimit) {
        return this.maxScroll - this.#_bounceLimit
      }
    }
    return newTarget
  }

  #setupVirtualScroll() {
    this.virtualScroll = new VirtualScroll({
      mouseMultiplier: 0.5,
      touchMultiplier: 2,
      firefoxMultiplier: 30,
      useKeyboard: false,
      passive: true,
      el: this.wrapper,
    })

    const SCROLL_THRESHOLD = 5

    this.virtualScroll.on(event => {
      if (!this.isDragging && !this.#isPaused) {
        // More strict threshold check for touch devices
        if (event.touchDevice) {
          const deltaY = Math.abs(event.deltaY)
          const deltaX = Math.abs(event.deltaX)

          if (deltaY < SCROLL_THRESHOLD && deltaX < SCROLL_THRESHOLD) return
          if (deltaY > deltaX) return
        }

        const delta = !this.config.useScroll
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
    if (this.#isPaused) return // Block if paused
    this.isDragging = true
    this.dragStart = event.clientX
    this.dragStartTarget = this.target
    this.wrapper.style.cursor = "grabbing"
  }

  #handleDragMove(event) {
    if (!this.isDragging || this.#isPaused) return // Block if paused

    const deltaX = event.clientX - this.dragStart
    let newTarget = this.dragStartTarget + deltaX * this.config.dragSensitivity

    this.target = this.#calculateBounds(newTarget)
    this.speed += event.movementX * 0.01
  }

  #handleDragEnd() {
    this.isDragging = false
    this.wrapper.style.cursor = "grab"

    // Snap back to bounds if not infinite
    if (!this.config.infinite) {
      if (this.target > 0) {
        this.target = 0
      } else if (this.target < this.maxScroll) {
        this.target = this.maxScroll
      } else if (this.config.snap) {
        // Only snap if snap is enabled
        const snapped = Math.round(this.target)
        this.target = Math.min(0, Math.max(this.maxScroll, snapped))
      }
    } else if (this.config.snap) {
      // Snap in infinite mode if enabled
      this.target = Math.round(this.target)
    }
  }

  /** Update */

  update() {
    if (!this.isVisible || !this.#isActive) return

    // Update deltaTime
    const currentTime = performance.now()
    this.#deltaTime = (currentTime - this.#previousTime) / 1000
    this.#previousTime = currentTime

    // Handle snapping in one place
    if (this.config.snap && !this.isDragging) {
      const currentSnap = Math.round(this.target)
      const diff = currentSnap - this.target
      this.target += diff * this.config.snapStrength
    }

    this.current = damp(this.current, this.target, 5, this.#deltaTime)

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

    this.config.onUpdate?.(this)

    // console.log(this.target);
  }

  #updateFinite() {
    this.items.forEach((item, i) => {
      const translateX = this.current * this.viewport.itemWidth
      item.style.transform = `translateX(${translateX}px)`
    })
  }

  #updateInfinite() {
    this.items.forEach((item, i) => {
      const unitPos = this.current + i
      const x = symmetricMod(unitPos, this.items.length) - i

      const translateX = x * this.viewport.itemWidth
      item.style.transform = `translateX(${translateX}px)`

      //   Update parallax elements if they exist
      if (this.parallaxItems[i]) {
        const baseX = symmetricMod(unitPos, this.items.length / 2)

        this.parallaxItems[i].forEach(({ element, value }) => {
          element.style.transform = `translateX(${baseX * value * 20}%)`
        })
      }
    })
  }

  #renderSpeed() {
    this.#lspeed = damp(this.#lspeed, this.speed, 5, this.#deltaTime)
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
    if (this.virtualScroll && this.config.useScroll) {
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

      this.config.onSlideChange?.(this.#currentSlide, this.#previousSlide)
    }
  }

  /** Interfaces */
  // resetting interface
  kill() {
    this.#isActive = false
    // Reset all transforms
    this.items.forEach(item => {
      item.style.transform = ""
    })
    // Reset parallax items if they exist
    this.parallaxItems?.forEach(group => {
      group?.forEach(({ element }) => {
        element.style.transform = ""
      })
    })
    // Reset state
    this.current = 0
    this.target = 0
    this.speed = 0
    this.#lspeed = 0
  }

  init() {
    this.#isActive = true
    this.#previousTime = performance.now()
  }

  // pausing interface
  set paused(value) {
    this.#isPaused = value // Use new pause flag
  }

  get paused() {
    return this.#isPaused // Return new pause flag
  }
}

// actual class

// export class ModelSlider extends Slider {
//   constructor(wrapper, config = {}) {
//     super(wrapper, config);

//     this.items.forEach((item, i) => {
//       let startX = 0;
//       let startTime = 0;

//       item.addEventListener("mousedown", (e) => {
//         e.preventDefault();
//         startX = e.clientX;
//         startTime = Date.now();
//       });

//       item.addEventListener("mouseup", (e) => {
//         e.preventDefault();
//         const deltaX = Math.abs(e.clientX - startX);
//         const deltaTime = Date.now() - startTime;

//         if (deltaX < 5 && deltaTime < 200) {
//           item.children[0].click();
//         }
//       });
//     });
//   }
// }
