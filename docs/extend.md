# Extending Examples

## AKA Smarter Usage

While it works as just the Core, the idea is for the library to provide all the baseline functionality and a nice interface to extend it, keep it as light as it can be but as flexible as you want.


### Controls

Add dots, arrows and navigation methods.

```js
import Core from "smooothy"
import gsap from "gsap"

class ControlsSlider extends Core {
  constructor(container: HTMLElement, config = {}) {
    super(container.querySelector("[data-slider]"))

    this.createInterface(container.querySelector("[data-interface]"))
    this.parallaxy = [...container.querySelectorAll("[data-p]")]

    this.onSlideChange(0, 0)
    gsap.ticker.add(this.update.bind(this))
  }

  createInterface(int: HTMLElement) {
    this.dots = [...int.querySelector("[data-dots]").children]
    const arrows = [...int.querySelector("[data-arrows]").children]

    arrows.forEach(
      (arrow, index) =>
        (arrow.onclick = () =>
          index === 0 ? this.goToPrev() : this.goToNext())
    )

    this.dots.forEach(
      (dot, index) => (dot.onclick = () => this.goToIndex(index))
    )
  }

  onSlideChange = (current, previous) => {
    this.items[previous].children[0].children[0].classList.remove("active")
    this.items[current].children[0].children[0].classList.add("active")

    this.dots[previous].children[0].classList.remove("active-dot")
    this.dots[current].children[0].classList.add("active-dot")
  }
}


```

### Capture Link Clicks

Pretty common issue is mixing sliding and click behaviour with slides that are actual links.

```js
  import Core from "smooothy"
  import gsap from "~/js/gsap"

  export class LinkSlider extends Core {
    constructor(container: HTMLElement, config = {}) {
      super(container.querySelector("[data-slider]"))
      gsap.ticker.add(this.update.bind(this))

      this.#handleLinks()
    }
    #handleLinks() {
      ;[...this.wrapper.querySelectorAll("a")].forEach((item, i) => {
        let startX = 0
        let startY = 0
        let startTime = 0
        let isDragging = false

        item.style.pointerEvents = "none"

        const handleMouseDown = e => {
          startX = e.clientX
          startY = e.clientY
          startTime = Date.now()
          isDragging = false
        }

        const handleMouseMove = e => {
          if (!startTime) return

          const deltaX = Math.abs(e.clientX - startX)
          const deltaY = Math.abs(e.clientY - startY)

          if (deltaX > 5 || deltaY > 5) {
            isDragging = true
          }
        }

        const handleMouseUp = e => {
          const deltaTime = Date.now() - startTime

          if (!isDragging && deltaTime < 200) {
            item.click()
          }

          startTime = 0
          isDragging = false
        }

        item.parentElement.addEventListener("mousedown", handleMouseDown)
        item.parentElement.addEventListener("mousemove", handleMouseMove)
        item.parentElement.addEventListener("mouseup", handleMouseUp)
      })
    }
  }
```
### Keyboard Controls

Adds keyboard (arrows, spacebar) controls for next and previous slide, and numpad controls to get to a specific slide.

```js
import Core from "smooothy"
import gsap from "gsap"

export class KeyboardSlider extends Core {
  constructor(wrapper, config) {
    super(wrapper, config)

    gsap.ticker.add(this.update.bind(this))
    this.#addKeyboardEvents()
  }

  #handleKeydown = e => {
    if (!this.isVisible) return

    // this for numbers are pressed
    if (/^[0-9]$/.test(e.key)) {
      const slideIndex = parseInt(e.key)
      if (this.config.infinite) {
        // automatically takes the shortest path
        this.goToIndex(slideIndex)
      } else {
        if (slideIndex > this.items.length - 1) return
        this.goToIndex(slideIndex)
      }
      return
    }

    // this for arrows and spacebar
    switch (e.key) {
      case "ArrowLeft":
        this.goToPrev()
        break
      case "ArrowRight":
        this.goToNext()
        break
      case " ":
        this.goToNext()
        break
    }
  }

  #addKeyboardEvents() {
    window.addEventListener("keydown", this.#handleKeydown)
  }
}
```

### Vertical Slider

The slider supports vertical scrolling when `vertical: true` is set in the config. All the same functionality works in both horizontal and vertical orientations. Keyboard navigation automatically adapts to use ArrowUp/ArrowDown for vertical sliders.

```html
<div data-slider class="flex flex-col overflow-y-hidden h-[80vh]">
  <div class="h-[30vh] shrink-0">
    <!-- Slide 1 -->
  </div>
  <div class="h-[30vh] shrink-0">
    <!-- Slide 2 -->
  </div>
  <div class="h-[30vh] shrink-0">
    <!-- Slide 3 -->
  </div>
</div>
```

```js
import Core from "smooothy"
import gsap from "gsap"

export class VerticalSlider extends Core {
  constructor(wrapper, config) {
    super(wrapper, {
      ...config,
      vertical: true,
      infinite: true,
      snap: true,
    })

    gsap.ticker.add(this.update.bind(this))
    this.#addKeyboardEvents()
  }

  #handleKeydown = e => {
    if (!this.isVisible) return

    if (/^[0-9]$/.test(e.key)) {
      const slideIndex = parseInt(e.key)
      if (this.config.infinite) {
        this.goToIndex(slideIndex)
      } else {
        if (slideIndex > this.items.length - 1) return
        this.goToIndex(slideIndex)
      }
      return
    }

    // Use ArrowUp/ArrowDown for vertical, ArrowLeft/ArrowRight for horizontal
    switch (e.key) {
      case "ArrowLeft":
        if (!this.config.vertical) {
          this.goToPrev()
        }
        break
      case "ArrowRight":
        if (!this.config.vertical) {
          this.goToNext()
        }
        break
      case "ArrowUp":
        if (this.config.vertical) {
          this.goToPrev()
        }
        break
      case "ArrowDown":
        if (this.config.vertical) {
          this.goToNext()
        }
        break
      case " ":
        this.goToNext()
        break
    }
  }

  #addKeyboardEvents() {
    window.addEventListener("keydown", this.#handleKeydown)
  }
}
```

**Key points:**
- Set `vertical: true` in the config
- Use `flex-col` and `overflow-y-hidden` in CSS for vertical layout
- Use `height` instead of `width` for slide dimensions
- Keyboard navigation uses ArrowUp/ArrowDown instead of ArrowLeft/ArrowRight
- All features (infinite, snap, variable width, etc.) work in vertical mode
- The viewport provides both `itemWidth`/`itemHeight` and `wrapperWidth`/`wrapperHeight` dimensions

### Base parallax

```html
<!-- ... -->
```

```js
// 
```

### Parallax and Speed

```html
<!-- ... -->
```

```js
// 
```

### Capture Link Clicks

Pretty common issue is mixing sliding and click behaviour with slides that are actual links.

```js
import Core from "smooothy"
import gsap from "gsap"

export class LinkSlider extends Core {
  constructor(container: HTMLElement, config = {}) {
    super(container.querySelector("[data-slider]"))
    gsap.ticker.add(this.update.bind(this))

    this.#handleLinks()
  }
  #handleLinks() {
    ;[...this.wrapper.querySelectorAll("a")].forEach((item, i) => {
      let startX = 0
      let startY = 0
      let startTime = 0
      let isDragging = false

      item.style.pointerEvents = "none"

      const handleMouseDown = e => {
        startX = e.clientX
        startY = e.clientY
        startTime = Date.now()
        isDragging = false
      }

      const handleMouseMove = e => {
        if (!startTime) return

        const deltaX = Math.abs(e.clientX - startX)
        const deltaY = Math.abs(e.clientY - startY)

        if (deltaX > 5 || deltaY > 5) {
          isDragging = true
        }
      }

      const handleMouseUp = e => {
        const deltaTime = Date.now() - startTime

        if (!isDragging && deltaTime < 200) {
          item.click()
        }

        startTime = 0
        isDragging = false
      }

      item.parentElement.addEventListener("mousedown", handleMouseDown)
      item.parentElement.addEventListener("mousemove", handleMouseMove)
      item.parentElement.addEventListener("mouseup", handleMouseUp)
    })
  }
}
```

### Variable Width

Slides with different widths that snap to center. Perfect for mixed content layouts where some slides need more space than others. The slider automatically calculates the center position for each slide based on its width.

```html
<div data-slider class="flex overflow-x-hidden">
  <div class="w-[80vw] md:w-[30vw] shrink-0">
    <!-- Normal width slide -->
  </div>
  <div class="w-[110vw] md:w-[50vw] shrink-0">
    <!-- Wide slide -->
  </div>
  <div class="w-[80vw] md:w-[30vw] shrink-0">
    <!-- Normal width slide -->
  </div>
</div>
```

```js
import Core from "smooothy"
import gsap from "gsap"

export class VariableWidthSlider extends Core {
  constructor(wrapper, config = {}) {
    super(wrapper, {
      ...config,
      variableWidth: true,
    })

    gsap.ticker.add(this.update.bind(this))
  }
}
```

**Key points:**
- Set `variableWidth: true` in the config
- Each slide's width is calculated automatically
- Slides snap to center based on their individual widths
- The first slide is automatically centered on initialization

### Auto-scroll

A slider that continuously scrolls at a constant speed. The auto-scroll pauses when the user hovers over the slider or interacts with it (touch/drag), and resumes automatically after interaction ends.

```js
import Core from "smooothy"
import gsap from "gsap"

class AutoScrollSlider extends Core {
  #isPaused = false
  #scrollSpeed = 0.15 // units per second (adjust for faster/slower)
  #wasDragging = false

  constructor(container: HTMLElement, config = {}) {
    super(container.querySelector("[data-slider]"), {
      ...config,
      infinite: true,
      snap: false, // Disable snap for smooth continuous scrolling
    })

    gsap.ticker.add(this.update.bind(this))

    // Override update to add continuous scrolling
    const originalUpdate = this.update.bind(this)
    this.update = () => {
      // Apply continuous auto-scroll before the original update
      if (!this.#isPaused && this.isVisible && !this.isDragging) {
        // Continuously move target forward
        this.target -= this.#scrollSpeed * this.deltaTime
      }

      originalUpdate()
      this.#checkDragging()
    }

    this.#setupPauseOnInteraction()
  }

  #checkDragging() {
    if (this.isDragging && !this.#wasDragging) {
      // Started dragging
      this.#isPaused = true
      this.#wasDragging = true
    } else if (!this.isDragging && this.#wasDragging) {
      // Stopped dragging - resume after delay
      this.#wasDragging = false
      setTimeout(() => {
        this.#isPaused = false
      }, 2000)
    }
  }

  #setupPauseOnInteraction() {
    const slider = this.wrapper

    // Pause on hover
    slider.addEventListener("mouseenter", () => {
      this.#isPaused = true
    })

    slider.addEventListener("mouseleave", () => {
      this.#isPaused = false
    })

    // Pause on touch start
    slider.addEventListener("touchstart", () => {
      this.#isPaused = true
    })

    slider.addEventListener("touchend", () => {
      // Resume after a delay when touch ends
      setTimeout(() => {
        this.#isPaused = false
      }, 2000)
    })
  }

  destroy() {
    super.destroy?.()
  }
}
```

**Key points:**
- Continuously scrolls by updating `target` position using `deltaTime` for frame-rate independence
- Pauses on hover, touch, and drag interactions
- Only scrolls when `isVisible` is true (slider is in viewport)
- Set `snap: false` for smooth continuous motion (or keep snap enabled for subtle snapping effect)
- Adjust `#scrollSpeed` to change the scrolling speed (higher = faster)
- Works best with `infinite: true` for seamless looping

### Wip

```html
<!-- ... -->
```

```js
// 
```
