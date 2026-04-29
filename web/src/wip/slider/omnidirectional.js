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

    this.hCore = new Core(wrapper, {
      ...config,
      vertical: false,
      disableInput: true,
    })

    if (this.grid[0]) {
      this.hCore.items = this.grid[0]
      this.hCore.resize()
    }

    // The vertical core already observes wrapper visibility; drop the
    // duplicate observer on hCore and forward visibility manually.
    this.hCore.observer?.disconnect()
    this.hCore.observer = undefined

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
        // Synthesize movementX/Y so pointerMove takes the mouse-style
        // path and computes per-frame velocity without depending on
        // Core's touchPrevious* internal state.
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
