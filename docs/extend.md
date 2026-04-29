# Extending Examples

## AKA Smarter Usage

While it works as just the Core, the idea is for the library to provide all the baseline functionality and a nice interface to extend it, keep it as light as it can be but as flexible as you want.

## Examples

- [Controls](#controls)
- [Capture Link Clicks](#capture-link-clicks)
- [Keyboard Controls](#keyboard-controls)
- [Vertical Slider](#vertical-slider)
- [Base parallax](#base-parallax)
- [Parallax and Speed](#parallax-and-speed)
- [Variable Width](#variable-width)
- [Auto-scroll](#auto-scroll)
- [Passive Cores (`disableInput`)](#passive-cores-disableinput)
- [Omnidirectional](#omnidirectional)
- [Wip](#wip)

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

Simple parallax effect using `parallaxValues` from the `onUpdate` callback. Each slide's parallax value represents its position relative to the viewport center.

```html
<div data-slider class="flex overflow-x-hidden">
  <div class="w-[80vw] md:w-[30vw] shrink-0">
    <div class="relative h-full w-full">
      <div data-p class="h-full w-full">
        <!-- Parallax element -->
      </div>
    </div>
  </div>
  <div class="w-[80vw] md:w-[30vw] shrink-0">
    <div class="relative h-full w-full">
      <div data-p class="h-full w-full">
        <!-- Parallax element -->
      </div>
    </div>
  </div>
</div>
```

```js
import Core from "smooothy"
import gsap from "gsap"

export class ParallaxSlider extends Core {
  constructor(wrapper, config = {}) {
    super(wrapper, config)

    this.parallaxElements = [...wrapper.querySelectorAll("[data-p]")]
    gsap.ticker.add(this.update.bind(this))
  }

  onUpdate = ({ parallaxValues }) => {
    this.parallaxElements.forEach((element, i) => {
      // parallaxValues provides normalized position values for each slide
      // Multiply by a factor to control the parallax strength
      const offset = parallaxValues[i] * 20 // Adjust multiplier for stronger/weaker effect
      element.style.transform = `translateX(${offset}%)`
    })
  }
}
```

### Parallax and Speed

Combines parallax effects with speed-based animations. The speed value is dampened using the `damp` utility function for smooth, frame-rate independent animations. This creates a dynamic effect where parallax movement is influenced by how fast the slider is scrolling.

```html
<div data-slider class="flex overflow-x-hidden">
  <div class="w-[80vw] md:w-[30vw] shrink-0">
    <div class="relative h-full w-full">
      <div data-p class="h-full w-full">
        <!-- Parallax element -->
      </div>
    </div>
  </div>
  <div class="w-[80vw] md:w-[30vw] shrink-0">
    <div class="relative h-full w-full">
      <div data-p class="h-full w-full">
        <!-- Parallax element -->
      </div>
    </div>
  </div>
</div>
```

```js
import Core, { damp } from "smooothy"
import gsap from "gsap"

export class ParallaxSpeedSlider extends Core {
  lspeed = 0 // Lerped (smoothed) speed value

  constructor(wrapper, config = {}) {
    super(wrapper, {
      ...config,
      speedDecay: 0.9, // Speed decay factor for smoother speed calculation
    })

    this.parallaxElements = [...wrapper.querySelectorAll("[data-p]")]
    gsap.ticker.add(this.update.bind(this))
  }

  onUpdate = ({ parallaxValues, speed, deltaTime }) => {
    // Smooth out the speed using damp for frame-rate independent animation
    this.lspeed = damp(this.lspeed, speed, 5, deltaTime)

    // Apply parallax based on both position and smoothed speed
    this.parallaxElements.forEach((element, i) => {
      const offset = parallaxValues[i] * Math.abs(this.lspeed) * 20
      element.style.transform = `translateX(${offset}%)`
    })
  }
}
```

**Key points:**
- Import `damp` from `smooothy` for smooth speed interpolation
- Use `deltaTime` from `onUpdate` for frame-rate independent animations
- `speed` represents the current scroll velocity
- `Math.abs(this.lspeed)` ensures the effect works in both directions
- Adjust the multiplier (`20`) to control the parallax strength
- `speedDecay` in config affects how quickly speed changes (lower = smoother)

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

### Passive Cores (`disableInput`)

By default, `Core` installs its own Pointer Events listeners (using
`setPointerCapture`) plus a `virtual-scroll` wheel handler, and sets
`touch-action`, `user-select`, and `cursor` inline styles on the
wrapper. With `disableInput: true`, Core skips **all** of that and you
drive the instance manually by calling its public input methods. Useful
for:

- Composing multiple Cores on the same wrapper (see
  [Omnidirectional](#omnidirectional) below).
- Sourcing input from a non-DOM origin: GSAP timeline, scroll-link,
  custom gesture, gamepad, etc.

```js
import Core from "smooothy"
import VirtualScroll from "virtual-scroll"
import gsap from "gsap"

const core = new Core(wrapper, { disableInput: true })

// Pointer Events — one handler set for mouse / touch / pen.
// Use setPointerCapture so drag continues if the cursor leaves the wrapper.
wrapper.addEventListener("pointerdown", e => {
  wrapper.setPointerCapture(e.pointerId)
  core.pointerDown(e)
})
wrapper.addEventListener("pointermove", e => core.pointerMove(e))
wrapper.addEventListener("pointerup",       () => core.pointerUp())
wrapper.addEventListener("pointercancel",   () => core.pointerUp())

// Wheel / trackpad
new VirtualScroll({ el: wrapper }).on(e => core.scroll(e))

gsap.ticker.add(core.update.bind(core))
```

**Method reference:**

- `pointerDown(event)` — `{ clientX, clientY }`. Begins a drag, resets
  the velocity tracker.
- `pointerMove(event)` — `{ clientX, clientY, movementX?, movementY? }`.
  Continues the drag. `PointerEvent` always provides `movementX/Y`. For
  synthesised input (e.g. from a raw `Touch`), pass `movementX/Y`
  yourself so the speed accumulator is fed correctly — drag distance is
  still tracked from `clientX/Y` even without it.
- `pointerUp()` — Ends the drag. Projects an inertial resting position
  from the smoothed drag velocity and snaps to the nearest slide (when
  `snap` is on); free-scroll mode keeps a dead-stop release.
- `scroll(event)` — `{ deltaX, deltaY, touchDevice? }`. Applies a
  wheel/virtual-scroll delta. Reads `deltaX` or `deltaY` based on
  `config.vertical` and `config.scrollInput`.

**Notes:**

- Intersection, resize, and mutation observers are *still* installed in
  passive mode, so `update()`'s visibility gate keeps working,
  `resize()` runs automatically on layout changes, and added/removed
  slides are picked up automatically.
- `touch-action`, `user-select`, and `cursor: grab/grabbing` are **not**
  applied in passive mode — manage them yourself in your own listener
  setup. (You almost certainly want `touch-action: pan-y` for a
  horizontal slider.)

### Omnidirectional

A 2D grid that scrolls on **both** axes at once, with snap, infinite
wrap, and per-axis parallax. Built by composing two passive `Core`
instances on the same wrapper:

- A vertical core (`super`) whose items are the **rows** — writes
  `translateY` on each row.
- A horizontal core (`hCore`) whose items are the slides of the first
  row (the **columns**) — writes `translateX` on those slides.
- Each frame, the horizontal transform from row 0 is mirrored onto the
  same column in every other row so columns stay aligned.

Because both cores live on the same wrapper, the parent attaches input
listeners **once** and dispatches each event to both cores. A diagonal
mouse drag/scroll moves both axes simultaneously.

```html
<div data-slider="omni" class="flex flex-col w-[80svw] h-[80svh] overflow-hidden">
  {rows.map(r => (
    <div class="flex h-[20rem] shrink-0">
      {cols.map(c => (
        <div class="flex aspect-[5/3] h-[20rem] shrink-0 items-center justify-center">
          <div class="relative flex h-full w-full items-center justify-center p-8 outline">
            <p>Slide {r + 1}.{c + 1}</p>
            <div data-parallax class="pointer-events-none absolute inset-4 outline outline-dashed" />
          </div>
        </div>
      ))}
    </div>
  ))}
</div>
```

```js
import VirtualScroll from "virtual-scroll"
import Core from "smooothy"
import gsap from "gsap"

class OmniSlider extends Core {
  constructor(wrapper, config = {}) {
    super(wrapper, { ...config, vertical: true, disableInput: true })

    this.rows = this.items
    this.grid = this.rows.map(row => [...row.children])

    // Strip callbacks from hCore so they don't fire twice per frame.
    const hConfig = { ...config, vertical: false, disableInput: true }
    delete hConfig.onSlideChange
    delete hConfig.onUpdate
    delete hConfig.onResize
    this.hCore = new Core(wrapper, hConfig)

    if (this.grid[0]) {
      this.hCore.items = this.grid[0]
      this.hCore.resize()
    }

    // Drop the duplicate intersection observer; mirror visibility manually.
    this.hCore.observer?.disconnect()
    this.hCore.observer = undefined

    // Per-axis parallax on `[data-parallax]` children.
    this.parallaxStrength = config.parallax ?? 0
    this.parallaxEls = this.grid.map(row =>
      row.map(cell => cell.querySelector("[data-parallax]"))
    )

    this.#setupSharedInput(config)
    gsap.ticker.add(this.tick.bind(this))
  }

  #setupSharedInput(config) {
    const wrapper = this.wrapper
    const cores = [this, this.hCore]
    const abort = new AbortController()
    const signal = abort.signal
    this._abort = abort

    wrapper.style.cursor = "grab"

    wrapper.addEventListener("mousedown", e => {
      for (const c of cores) c.pointerDown(e)
      wrapper.style.cursor = "grabbing"
    }, { signal })
    window.addEventListener("mousemove", e => {
      for (const c of cores) c.pointerMove(e)
    }, { signal })
    window.addEventListener("mouseup", () => {
      for (const c of cores) c.pointerUp()
      wrapper.style.cursor = "grab"
    }, { signal })

    // Touch: no per-axis lock — diagonal swipes drive both axes.
    let prevX, prevY
    wrapper.addEventListener("touchstart", e => {
      const t = e.touches[0]
      prevX = t.clientX; prevY = t.clientY
      for (const c of cores) c.pointerDown(t)
    }, { signal })
    window.addEventListener("touchmove", e => {
      const t = e.touches[0]
      e.preventDefault()
      const synth = {
        clientX: t.clientX, clientY: t.clientY,
        movementX: t.clientX - (prevX ?? t.clientX),
        movementY: t.clientY - (prevY ?? t.clientY),
      }
      prevX = t.clientX; prevY = t.clientY
      for (const c of cores) c.pointerMove(synth)
    }, { passive: false, signal })
    window.addEventListener("touchend", () => {
      for (const c of cores) c.pointerUp()
    }, { signal })

    new VirtualScroll({ ...(config.virtualScroll ?? {}), el: wrapper })
      .on(event => { for (const c of cores) c.scroll(event) })
  }

  tick() {
    this.update()
    this.hCore.isVisible = this.isVisible
    this.hCore.update()

    // Mirror the horizontal transform onto every row's same-column slide.
    const master = this.hCore.items
    for (let c = 0; c < master.length; c++) {
      const t = master[c].style.transform
      for (let r = 1; r < this.grid.length; r++) {
        const slide = this.grid[r][c]
        if (slide) slide.style.transform = t
      }
    }

    // Per-axis parallax: (hCore.parallaxValues[c], this.parallaxValues[r]).
    const s = this.parallaxStrength
    if (!s) return
    const px = this.hCore.parallaxValues
    const py = this.parallaxValues
    if (!px || !py) return
    for (let r = 0; r < this.parallaxEls.length; r++) {
      const yVal = (py[r] ?? 0) * s
      for (let c = 0; c < this.parallaxEls[r].length; c++) {
        const el = this.parallaxEls[r][c]
        if (el) el.style.transform = `translate(${(px[c] ?? 0) * s}%, ${yVal}%)`
      }
    }
  }

  // Cell-aware accessors — handy on top of the inherited single-axis API.
  get currentRow() { return this.currentSlide }
  get currentCol() { return this.hCore?.currentSlide ?? 0 }
  get currentCell() { return [this.currentRow, this.currentCol] }
  goToCell(row, col) {
    if (row != null) this.goToIndex(row)
    if (col != null) this.hCore?.goToIndex(col)
  }
}
```

**Key points:**

- Both cores use `disableInput: true`; the parent class owns the single
  set of pointer/wheel listeners and dispatches to both.
- `slider.currentSlide` returns the row (back-compat with single-axis
  `Core`); use `slider.currentCol` / `slider.currentCell` for the column
  / pair, and `slider.goToCell(r, c)` to drive both at once.
- Callbacks (`onSlideChange`, `onUpdate`, `onResize`) are deleted from
  the `hCore` config to avoid double-firing per frame.
- For per-cell parallax, add `[data-parallax]` inside each cell and
  pass `parallax: 20` (or any % strength). Cell `(r, c)` gets
  `translate(hCore.parallaxValues[c], this.parallaxValues[r])` scaled
  by that strength.

### Wip

```html
<!-- ... -->
```

```js
// 
```
