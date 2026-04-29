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
  /**
   * When true, Core skips installing its own pointer/wheel/cursor handlers.
   * The instance becomes "passive": its state is only driven by external
   * code calling `pointerDown`, `pointerMove`, `pointerUp` and `scroll`.
   * The intersection and resize observers are still installed so
   * `update()` keeps working when the wrapper is visible/resized.
   *
   * Useful for composing multiple Cores on the same wrapper (e.g. a 2D
   * omnidirectional grid), or for driving Core from a non-DOM input
   * source (timeline, scroll-link, gamepad, etc.). Default: false.
   */
  disableInput: boolean
  /**
   * When true, Core will NOT re-collect `items` from `wrapper.children`
   * inside `resize()`, and will NOT install a `MutationObserver` on the
   * wrapper. Use this when you're managing the `items` array externally
   * — for example, when composing multiple Cores on the same wrapper
   * where each one targets a different subset of the children (see the
   * omnidirectional example), or when the slides live somewhere other
   * than the immediate children of the wrapper.
   *
   * With this flag on, you're responsible for keeping `items` in sync
   * with the DOM yourself. Default: false.
   */
  controlledItems: boolean
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
  setOffset: ({
    itemWidth,
    wrapperWidth,
    itemHeight,
    wrapperHeight,
    vertical,
  }) => (vertical ? itemHeight : itemWidth),

  /** Functionality */
  scrollInput: false,
  disableInput: false,
  controlledItems: false,
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
  isTouching: boolean = false
  dragStart: number = 0
  dragStartTarget: number = 0
  isVisible: boolean = false
  current: number = 0
  target: number = 0
  maxScroll: number = 0
  resizeTimeout?: ReturnType<typeof setTimeout>
  virtualScroll?: any
  observer?: IntersectionObserver
  resizeObserver?: ResizeObserver
  mutationObserver?: MutationObserver
  parallaxValues?: number[]
  webglValue: number = 0 // (*) ADD WEBGL VALUE TO SLIDER (better name)

  /** Bound input handlers — kept as fields so destroy() can remove them. */
  #onPointerDown?: (e: PointerEvent) => void
  #onPointerMove?: (e: PointerEvent) => void
  #onPointerEnd?: (e: PointerEvent) => void
  #onVirtualScroll?: (event: any) => void

  /** PointerId of the pointer currently driving the drag, or null. We
   * only track one pointer at a time so multi-touch / second-mouse
   * input doesn't fight the active drag. */
  #activePointerId: number | null = null

  /** Previous CSS values restored on destroy(), so we don't leak our
   * touch-action / cursor / user-select overrides into the host page. */
  #prevTouchAction: string = ""
  #prevCursor: string = ""
  #prevUserSelect: string = ""

  /** Smoothed per-pointerMove target delta, used to project an inertial
   * resting position at pointerUp so flicks travel proportional to throw
   * speed instead of always advancing one slide. */
  #dragDelta: number = 0

  /** True once update() has run a full transform pass at least once.
   * Gates the idle fast-path so `parallaxValues` is guaranteed to exist
   * the first time consumers read it inside `onUpdate`. */
  #hasRendered: boolean = false

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
    this.isTouching = false
    this.dragStart = 0
    this.dragStartTarget = 0
    this.isVisible = false
    this.#activePointerId = null

    this.#currentSlide = 0
    this.#previousSlide = 0

    // Initialize
    this.#setupViewport()
    this.#setupIntersectionObserver()
    this.#setupResizeObserver()
    if (!this.config.controlledItems) this.#setupMutationObserver()

    if (!this.config.disableInput) {
      this.#setupInputListeners()
      this.#setupVirtualScroll()
    }

    this.#setupViewport()

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
        ? this.viewport.itemHeight || 1
        : this.viewport.itemWidth || 1
      const total = this.config.vertical
        ? this.viewport.totalHeight
        : this.viewport.totalWidth
      this.maxScroll = -(total - this.#offset) / denominator
    }

    queueMicrotask(() => {
      this.onResize?.(this)
    })
  }

  #setupInputListeners(): void {
    // Snapshot inline styles so destroy() can restore them.
    this.#prevTouchAction = this.wrapper.style.touchAction
    this.#prevCursor = this.wrapper.style.cursor
    this.#prevUserSelect = this.wrapper.style.userSelect

    // touch-action declares to the browser which gestures we want.
    // Horizontal slider lets the browser handle vertical page scroll
    // (and vice versa) — this replaces the manual axis-lock dance and
    // means we never need passive:false / preventDefault inside move.
    this.wrapper.style.touchAction = this.config.vertical ? "pan-x" : "pan-y"
    // Stop the host page from selecting text while the user drags.
    this.wrapper.style.userSelect = "none"
    this.wrapper.style.cursor = "grab"

    this.#onPointerDown = (e: PointerEvent) => {
      if (this.#isPaused) return
      // Only one pointer at a time. Secondary pointers (multi-touch,
      // second mouse) are ignored until the active drag finishes.
      if (this.#activePointerId !== null) return
      this.#activePointerId = e.pointerId
      this.isTouching = e.pointerType === "touch"
      // Pointer capture redirects subsequent moves/ups to the wrapper
      // even if the cursor leaves it, so we don't need window-level
      // listeners. Wrapped in try because some browsers throw if the
      // pointer can't be captured (e.g. already released).
      try {
        this.wrapper.setPointerCapture(e.pointerId)
      } catch {
        /* noop */
      }
      this.pointerDown(e)
    }

    this.#onPointerMove = (e: PointerEvent) => {
      if (this.#activePointerId !== e.pointerId) return
      this.pointerMove(e)
    }

    // pointerup, pointercancel, and lostpointercapture all share end
    // semantics. Capture is auto-released on up/cancel, which then
    // fires lostpointercapture too — the activePointerId guard makes
    // the second invocation a no-op.
    this.#onPointerEnd = (e: PointerEvent) => {
      if (this.#activePointerId !== e.pointerId) return
      this.#activePointerId = null
      this.isTouching = false
      this.pointerUp()
    }

    this.wrapper.addEventListener("pointerdown", this.#onPointerDown)
    this.wrapper.addEventListener("pointermove", this.#onPointerMove)
    this.wrapper.addEventListener("pointerup", this.#onPointerEnd)
    this.wrapper.addEventListener("pointercancel", this.#onPointerEnd)
    this.wrapper.addEventListener("lostpointercapture", this.#onPointerEnd)
  }

  #setupResizeObserver(): void {
    this.resizeObserver = new ResizeObserver(() => {
      if (this.resizeTimeout) clearTimeout(this.resizeTimeout)
      this.resizeTimeout = setTimeout(() => this.resize(), 10)
    })
    this.resizeObserver.observe(this.wrapper)
  }

  /** Watches the wrapper for added/removed direct children so consumers
   * can mutate slides at runtime (e.g. fetched data) without manually
   * re-initialising. Scoped to `childList` only — not `subtree` — to
   * avoid firing on every descendant style/text change. */
  #setupMutationObserver(): void {
    this.mutationObserver = new MutationObserver(mutations => {
      const hasChildChanges = mutations.some(
        m =>
          m.type === "childList" &&
          (m.addedNodes.length > 0 || m.removedNodes.length > 0)
      )
      if (hasChildChanges) this.resize()
    })
    this.mutationObserver.observe(this.wrapper, { childList: true })
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
    this.#onVirtualScroll = (event: any) => this.scroll(event)
    this.virtualScroll.on(this.#onVirtualScroll)
  }

  /**
   * Begin a drag/press. Sets `isDragging` and snapshots the start
   * position. Called internally by Core's own `mousedown`/`touchstart`
   * listeners, or externally when `disableInput: true`.
   *
   * @param event Anything with `{ clientX, clientY }` (MouseEvent, Touch,
   * or a synthesized object).
   */
  pointerDown(event: { clientX: number; clientY: number }): void {
    if (this.#isPaused) return
    this.isDragging = true
    this.dragStart = this.config.vertical ? event.clientY : event.clientX
    this.dragStartTarget = this.target
    this.#dragDelta = 0
    if (!this.config.disableInput) this.wrapper.style.cursor = "grabbing"
  }

  /**
   * Continue a drag/press. Reads `clientX/Y` to compute the new target
   * and `movementX/Y` (when present) to feed `speed`. For pure touch
   * events without `movementX/Y`, falls back to Core's tracked
   * `touchPrevious*` state when its own listeners are in charge; when
   * driven externally, prefer to synthesize `movementX/Y` per frame.
   */
  pointerMove(event: {
    clientX: number
    clientY: number
    movementX?: number
    movementY?: number
  }): void {
    if (!this.isDragging || this.#isPaused) return

    const prevTarget = this.target

    const delta = this.config.vertical
      ? event.clientY - this.dragStart
      : event.clientX - this.dragStart
    const sensitivity = this.config.variableWidth
      ? 1
      : this.config.dragSensitivity
    let newTarget = this.dragStartTarget + delta * sensitivity

    this.target = this.#calculateBounds(newTarget)

    // EMA-smoothed per-pointerMove target delta. Used by pointerUp to
    // project where an inertial throw would come to rest, so a hard
    // flick can carry past one slide. Uses the post-bounds target so
    // overscroll doesn't inflate the projection.
    const targetDelta = this.target - prevTarget
    this.#dragDelta = this.#dragDelta * 0.7 + targetDelta * 0.3

    // PointerEvents always provide movement{X,Y}; the optional chain
    // keeps the public method tolerant to externally synthesised input
    // (disableInput: true) that may pass plain {clientX, clientY}.
    const movement = this.config.vertical
      ? (event.movementY ?? 0)
      : (event.movementX ?? 0)
    this.speed += movement * 0.01
  }

  /**
   * Finish a drag/press. Clears `isDragging`, applies snap/bounce
   * resolution. Safe to call even if no `pointerDown` happened.
   */
  pointerUp(): void {
    this.isDragging = false
    if (!this.config.disableInput) this.wrapper.style.cursor = "grab"

    // Project the inertial resting position from the smoothed drag
    // velocity. Closed-form sum of a per-frame velocity that decays by
    // `speedDecay` each frame: total = v / (1 - decay). Only used when
    // snapping; free-scroll mode keeps its dead-stop release.
    const friction = 1 - this.config.speedDecay
    const projection =
      this.config.snap && friction > 0 ? this.#dragDelta / friction : 0
    const projectedTarget = this.target + projection
    this.#dragDelta = 0

    if (this.config.variableWidth) {
      let next = projectedTarget
      if (!this.config.infinite) {
        if (next > 0) next = 0
        else if (next < this.maxScroll) next = this.maxScroll
      }
      this.target = this.config.snap ? this.#snapToNearest(next) : next
    } else {
      if (!this.config.infinite) {
        let next = projectedTarget
        if (next > 0) {
          next = 0
        } else if (next < this.maxScroll) {
          next = this.maxScroll
        } else if (this.config.snap) {
          const snapped = Math.round(next)
          next = Math.min(0, Math.max(this.maxScroll, snapped))
        }
        this.target = next
      } else if (this.config.snap) {
        this.target = Math.round(projectedTarget)
      }
    }
  }

  /**
   * Apply a wheel/virtual-scroll event. Uses `deltaX` or `deltaY`
   * depending on `config.vertical` (and `config.scrollInput`). When
   * `event.touchDevice` is true, applies the per-axis dominance lock
   * to suppress noisy off-axis trackpad scrolls.
   *
   * Called internally by the `virtual-scroll` listener Core installs by
   * default; with `disableInput: true`, drive it from your own input
   * source.
   */
  scroll(event: {
    deltaX: number
    deltaY: number
    touchDevice?: boolean
  }): void {
    if (this.isDragging || this.#isPaused) return

    const SCROLL_THRESHOLD = 5

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
      ? !this.config.scrollInput
        ? event.deltaY
        : Math.abs(event.deltaY) > Math.abs(event.deltaX)
          ? event.deltaY
          : event.deltaX
      : !this.config.scrollInput
        ? event.deltaX
        : Math.abs(event.deltaX) > Math.abs(event.deltaY)
          ? event.deltaX
          : event.deltaY

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

  /** Returns true when the slider has nothing to render: not being
   * dragged, no kinetic speed, target and current have converged, and
   * (when snapping) we're parked at a snap point. Consumers running a
   * shared RAF loop can use this to skip their own per-frame work for
   * idle sliders. Internally, `update()` reads the same flag and skips
   * the transform write pass while the slider is idle. */
  get isIdle(): boolean {
    if (this.isDragging) return false
    if (Math.abs(this.speed) > 0.0001) return false
    if (Math.abs(this.target - this.current) > 0.0001) return false

    if (this.config.snap) {
      const snapped = this.config.variableWidth
        ? this.#snapToNearest(this.target)
        : Math.round(this.target)
      if (Math.abs(snapped - this.target) > 0.0001) return false
    }

    return true
  }

  /** Update */
  update(): void {
    if (!this.isVisible || !this.#isActive) return

    const currentTime = performance.now()
    this.deltaTime = (currentTime - this.#previousTime) / 1000
    this.#previousTime = currentTime

    // Cheap fast-path: if nothing is changing, skip the per-item
    // transform writes (the expensive part of update()) but still fire
    // onUpdate so consumers can hook into the idle frame if they want.
    // Only short-circuit once we've rendered at least once, otherwise
    // `parallaxValues` would still be undefined for first-frame readers.
    if (this.#hasRendered && this.isIdle) {
      this.onUpdate?.(this)
      return
    }

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
        const centerPos = this.#normalizePosition(-this.current + wrapperCenter)
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
          Math.min(-this.current + wrapperCenter, total)
        )
        this.#updateCurrentSlide(this.#findNearestSlide(normalized))
        this.#updateFiniteVariableWidth()
      } else {
        this.#updateCurrentSlide(Math.round(Math.abs(this.current)))
        this.#updateFinite()
      }
    }

    this.#renderSpeed()
    this.#hasRendered = true
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
      ? this.viewport.totalHeight || 1
      : this.viewport.totalWidth || 1
    const wrapperCenter = this.config.vertical
      ? this.viewport.wrapperHeight / 2
      : this.viewport.wrapperWidth / 2
    const center = this.#getSlideCenter(index)
    let rawTarget = -(center - wrapperCenter)

    if (this.config.infinite) {
      const k = Math.round((this.target - rawTarget) / total)
      rawTarget += k * total
    } else {
      rawTarget = Math.min(0, Math.max(this.maxScroll, rawTarget))
    }

    return rawTarget
  }

  #normalizePosition(value: number): number {
    const total = this.config.vertical
      ? this.viewport.totalHeight || 1
      : this.viewport.totalWidth || 1
    return ((value % total) + total) % total
  }

  #findNearestSlide(position: number): number {
    const offsets = this.config.vertical
      ? this.itemHeightOffsets
      : this.itemOffsets
    if (!offsets.length) return 0

    const total = this.config.vertical
      ? this.viewport.totalHeight || 1
      : this.viewport.totalWidth || 1
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
    const offsets = this.config.vertical
      ? this.itemHeightOffsets
      : this.itemOffsets
    if (!offsets.length) return target

    const total = this.config.vertical
      ? this.viewport.totalHeight || 1
      : this.viewport.totalWidth || 1
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
      const offsets = this.config.vertical
        ? this.itemHeightOffsets
        : this.itemOffsets
      const transform = this.config.vertical
        ? `translateY(${translate}px)`
        : `translateX(${translate}px)`
      item.style.transform = transform
      return translate + offsets[i]
    })
  }

  #updateInfiniteVariableWidth(): void {
    const total = this.config.vertical
      ? this.viewport.totalHeight || 1
      : this.viewport.totalWidth || 1
    this.parallaxValues = this.items.map((item, i) => {
      const offsets = this.config.vertical
        ? this.itemHeightOffsets
        : this.itemOffsets
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
      this.target = this.#getSnapTargetForIndex(clamped)
    } else {
      this.target = -index
    }
  }

  set snap(value: boolean) {
    this.config.snap = value
  }

  getProgress(): number {
    if (this.config.variableWidth) {
      const total = this.config.vertical
        ? this.viewport.totalHeight || 1
        : this.viewport.totalWidth || 1
      const position = ((-this.current % total) + total) % total
      return position / total
    }

    const totalSlides = this.items.length
    const currentIndex = Math.abs(this.current) % totalSlides
    return currentIndex / totalSlides
  }

  destroy(): void {
    this.kill()

    if (this.#onPointerDown) {
      this.wrapper.removeEventListener("pointerdown", this.#onPointerDown)
    }
    if (this.#onPointerMove) {
      this.wrapper.removeEventListener("pointermove", this.#onPointerMove)
    }
    if (this.#onPointerEnd) {
      this.wrapper.removeEventListener("pointerup", this.#onPointerEnd)
      this.wrapper.removeEventListener("pointercancel", this.#onPointerEnd)
      this.wrapper.removeEventListener(
        "lostpointercapture",
        this.#onPointerEnd
      )
    }

    // Release any in-flight pointer capture so the host page recovers
    // input cleanly even if destroy() runs mid-drag.
    if (this.#activePointerId !== null) {
      try {
        this.wrapper.releasePointerCapture(this.#activePointerId)
      } catch {
        /* noop */
      }
      this.#activePointerId = null
    }

    if (this.resizeTimeout) clearTimeout(this.resizeTimeout)

    if (this.virtualScroll) {
      if (this.#onVirtualScroll) this.virtualScroll.off?.(this.#onVirtualScroll)
      this.virtualScroll.destroy?.()
    }

    this.observer?.disconnect()
    this.resizeObserver?.disconnect()
    this.mutationObserver?.disconnect()

    if (!this.config.disableInput) {
      // Restore inline styles to their pre-init values so the host
      // page doesn't inherit our touch-action / cursor / user-select.
      this.wrapper.style.touchAction = this.#prevTouchAction
      this.wrapper.style.cursor = this.#prevCursor
      this.wrapper.style.userSelect = this.#prevUserSelect
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
    this.#hasRendered = false
    this.isTouching = false
    this.#activePointerId = null
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
        ? this.viewport.totalHeight || 1
        : this.viewport.totalWidth || 1
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
    // Re-collect items so consumers can add/remove slides at runtime and
    // call resize() (or rely on the MutationObserver) without re-init.
    // Skipped when `controlledItems` is on so consumers managing items
    // externally (e.g. omnidirectional grids) aren't clobbered.
    if (!this.config.controlledItems) {
      this.items = [...this.wrapper.children] as HTMLElement[]
    }

    // Clamp currentSlide so removing items doesn't leave a stale index.
    if (this.items.length > 0) {
      if (this.#currentSlide >= this.items.length) {
        this.#currentSlide = this.items.length - 1
      }
      if (this.#previousSlide >= this.items.length) {
        this.#previousSlide = this.items.length - 1
      }
    }

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

    // Force a single update, bypassing the visibility check AND the
    // idle fast-path. After a viewport change the previous transforms
    // are stale (item widths / wrapper size may have changed), so the
    // next update() must run the full per-item pass even if speed,
    // target and current haven't moved.
    const wasActive = this.#isActive
    const wasVisible = this.isVisible

    this.#isActive = true
    this.isVisible = true
    this.#hasRendered = false
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
