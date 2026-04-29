import VirtualScroll from "virtual-scroll"
import Core, { damp } from "../../../../package/index.ts"
import gsap from "../../js/gsap.ts"

/**
 * Omnidirectional slider.
 *
 * Composes two passive `Core` instances (`disableInput: true`) — one for
 * the rows on the Y axis (this) and one for the slides on the X axis
 * (`hCore`). The Slider owns a single set of pointer/wheel listeners on
 * the wrapper and dispatches each event to both cores, so a diagonal
 * drag/scroll moves both axes at once.
 *
 * Each frame:
 *  - vertical core writes `translateY` on each row,
 *  - horizontal core writes `translateX` on every slide of the first row,
 *  - we mirror those `translateX` values onto the same column in every
 *    other row so columns stay aligned.
 */
export class Slider extends Core {
  constructor(wrapper, config = {}) {
    super(wrapper, { ...config, vertical: true, disableInput: true })

    this.rows = this.items
    this.grid = this.rows.map(row => [...row.children])

    // Strip callbacks from the hCore config so onSlideChange/onUpdate/
    // onResize don't fire twice per frame (once per core). The vertical
    // core (this) keeps them; per-column events are still reachable via
    // `slider.hCore.onSlideChange = ...` if a consumer wants them.
    const hConfig = { ...config, vertical: false, disableInput: true }
    delete hConfig.onSlideChange
    delete hConfig.onUpdate
    delete hConfig.onResize
    this.hCore = new Core(wrapper, hConfig)

    if (this.grid[0]) {
      this.hCore.items = this.grid[0]
      this.hCore.resize()
    }

    // The vertical core already observes wrapper visibility; drop the
    // duplicate observer on hCore and forward visibility manually.
    this.hCore.observer?.disconnect()
    this.hCore.observer = undefined

    // Per-axis parallax. Looks up `[data-parallax]` inside every cell once
    // and translates them by (hCore.parallaxValues[c], vCore.parallaxValues[r])
    // each frame, scaled by `parallax` (in % units). 0 = off (default).
    this.parallaxStrength = config.parallax ?? 0
    this.parallaxEls = this.grid.map(row =>
      row.map(cell => cell.querySelector("[data-parallax]"))
    )
    this.hasParallax =
      this.parallaxStrength !== 0 &&
      this.parallaxEls.some(row => row.some(el => el !== null))

    this._cores = [this, this.hCore]
    this._setupSharedInput(config)

    this._tick = this.tick.bind(this)
    gsap.ticker.add(this._tick)
  }

  _setupSharedInput(config) {
    const wrapper = this.wrapper
    const cores = this._cores

    this._abort = new AbortController()
    const signal = this._abort.signal

    wrapper.style.cursor = "grab"

    wrapper.addEventListener(
      "mousedown",
      e => {
        for (const c of cores) c.pointerDown(e)
        wrapper.style.cursor = "grabbing"
      },
      { signal }
    )
    window.addEventListener(
      "mousemove",
      e => {
        for (const c of cores) c.pointerMove(e)
      },
      { signal }
    )
    window.addEventListener(
      "mouseup",
      () => {
        for (const c of cores) c.pointerUp()
        wrapper.style.cursor = "grab"
      },
      { signal }
    )

    // Touch: no per-axis lock — diagonal swipes should drive both axes.
    let prevX
    let prevY
    wrapper.addEventListener(
      "touchstart",
      e => {
        const t = e.touches[0]
        prevX = t.clientX
        prevY = t.clientY
        for (const c of cores) c.pointerDown(t)
      },
      { signal }
    )
    window.addEventListener(
      "touchmove",
      e => {
        const t = e.touches[0]
        e.preventDefault()
        // Touch events don't carry movementX/Y, so synthesize them per
        // frame. Core's pointerMove uses these for the speed accumulator
        // and the velocity-aware snap projection.
        const synth = {
          clientX: t.clientX,
          clientY: t.clientY,
          movementX: t.clientX - (prevX ?? t.clientX),
          movementY: t.clientY - (prevY ?? t.clientY),
        }
        prevX = t.clientX
        prevY = t.clientY
        for (const c of cores) c.pointerMove(synth)
      },
      { passive: false, signal }
    )
    window.addEventListener(
      "touchend",
      () => {
        prevX = undefined
        prevY = undefined
        for (const c of cores) c.pointerUp()
      },
      { signal }
    )

    this._vs = new VirtualScroll({
      ...(config.virtualScroll ?? {}),
      el: wrapper,
    })
    this._vs.on(event => {
      for (const c of cores) c.scroll(event)
    })
  }

  tick() {
    this.update()

    const hCore = this.hCore
    if (!hCore) return

    hCore.isVisible = this.isVisible
    hCore.update()

    const master = hCore.items
    const grid = this.grid
    const cols = master.length
    for (let c = 0; c < cols; c++) {
      const t = master[c].style.transform
      for (let r = 1, rows = grid.length; r < rows; r++) {
        const slide = grid[r][c]
        if (slide) slide.style.transform = t
      }
    }

    if (this.hasParallax) {
      const px = hCore.parallaxValues
      const py = this.parallaxValues
      if (px && py) {
        const s = this.parallaxStrength
        const els = this.parallaxEls
        for (let r = 0, rows = els.length; r < rows; r++) {
          const rowEls = els[r]
          const yVal = (py[r] ?? 0) * s
          for (let c = 0, len = rowEls.length; c < len; c++) {
            const el = rowEls[c]
            if (el) {
              el.style.transform = `translate(${(px[c] ?? 0) * s}%, ${yVal}%)`
            }
          }
        }
      }
    }
  }

  /** Index of the centered row (alias for `currentSlide`). */
  get currentRow() {
    return this.currentSlide
  }

  /** Index of the centered column. */
  get currentCol() {
    return this.hCore?.currentSlide ?? 0
  }

  /** [row, col] of the centered cell. */
  get currentCell() {
    return [this.currentRow, this.currentCol]
  }

  /** Drive both axes at once. Either argument may be omitted. */
  goToCell(row, col) {
    if (row != null) this.goToIndex(row)
    if (col != null) this.hCore?.goToIndex(col)
  }

  destroy() {
    gsap.ticker.remove(this._tick)
    this._abort?.abort()
    this._vs?.destroy()
    super.destroy()
    if (this.hCore) this.hCore.destroy()
  }
}

export { damp }
export default Core
