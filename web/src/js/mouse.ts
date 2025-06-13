import { Resize, Raf } from "./utils/subscribable"
import { damp } from "./utils/math"

// (*) REMOVE FROM MOBILE

// Event types
type EventType = "enter" | "leave" | "blur"

// Callback types
type Callback = () => void
type RemoveCallback = () => void
type CallbackEvents = {
  [K in EventType]?: Callback
}
type CallbackStore = {
  [K in EventType]: Map<symbol, NonNullable<CallbackEvents[K]>>
}

// Config types
type EventConfig = {
  name: string
  handler: (self: Mouse) => (...args: any[]) => void
}
type Config = {
  damp: number
  dampFunc: (
    current: number,
    target: number,
    lambda: number,
    dt?: number,
    dampDecay?: number
  ) => number
  dampDecay: number
  events: readonly EventConfig[]
}

// Configuration
const CONFIG: Config = {
  damp: 4,
  dampFunc: damp,
  dampDecay: 1.2,
  events: [
    { name: "mousemove", handler: (self: Mouse) => self.handleMove.bind(self) },
    {
      name: "blur",
      handler: (self: Mouse) => () => {
        self.in = false
        self._callbacks.blur.forEach(cb => cb())
      },
    },
    {
      name: "mouseenter",
      handler: (self: Mouse) => () => {
        self.in = true
        self._callbacks.enter.forEach(cb => cb())
        document.body.classList.remove("mouse-out")
      },
    },
    {
      name: "mouseleave",
      handler: (self: Mouse) => () => {
        self.in = false
        self._callbacks.leave.forEach(cb => cb())
        document.body.classList.remove("mouse-down")
        document.body.classList.add("mouse-out")
      },
    },
    {
      name: "visibilitychange",
      handler: (self: Mouse) => () => {
        self.in = !document.hidden
        self._callbacks[document.hidden ? "leave" : "enter"].forEach(cb => cb())
      },
    },
    {
      name: "mousedown",
      handler: (self: Mouse) => () => {
        self.down = true
        // console.log("mousedown")
        document.body.classList.add("mouse-down")
      },
    },
    {
      name: "mouseup",
      handler: (self: Mouse) => () => {
        self.down = false
        // console.log("mouseup")
        document.body.classList.remove("mouse-down")
      },
    },
  ] as const,
}

export class Mouse {
  private static _callbacks: CallbackStore = {
    enter: new Map(),
    leave: new Map(),
    blur: new Map(),
  }

  static #raf = Raf.subscribe(this.#handleRaf.bind(this))

  static add(callbacks: CallbackEvents): RemoveCallback {
    const id = Symbol()
    const cleanupFns: RemoveCallback[] = []

    Object.entries(callbacks).forEach(([event, callback]) => {
      if (callback && event in this._callbacks) {
        this._callbacks[event as EventType].set(id, callback)
        cleanupFns.push(() => this._callbacks[event as EventType].delete(id))
      }
    })

    return () => cleanupFns.forEach(fn => fn())
  }

  static handleMove(e: MouseEvent) {
    this.#xy = e
    this.#sxy = e

    if (this.down) {
      document.body.classList.add("mouse-dragging")
    }
  }

  static #handleRaf() {
    // if (!this.in) return

    this.#exy = { x: this.x, y: this.y }
    this.#sexy = { x: this.sx, y: this.sy }

    if (!this.down) {
      document.body.classList.remove("mouse-dragging")
    }
  }

  static {
    CONFIG.events.forEach(({ name, handler }) => {
      document.addEventListener(name, handler(this))
    })

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        this.in = false
      } else {
        this.in = true
      }
    })
  }

  static in: boolean = true
  static down: boolean = false

  static x: number = window.innerWidth / 2
  static y: number = window.innerHeight / 2
  static ex: number[] = [0, 0]
  static ey: number[] = [0, 0]
  static sx: number = 0
  static sy: number = 0
  static sex: number = 0
  static sey: number = 0

  static set #xy({ clientX, clientY }: MouseEvent) {
    this.x = clientX
    this.y = clientY
  }

  static set #sxy({ clientX, clientY }: MouseEvent) {
    this.sx = (clientX / Resize.window.innerWidth) * 2 - 1
    this.sy = -(clientY / Resize.window.innerHeight) * 2 + 1
  }

  static set #sexy({ x, y }: { x: number; y: number }) {
    this.sex = CONFIG.dampFunc(this.sex, x, CONFIG.damp)
    this.sey = CONFIG.dampFunc(this.sey, y, CONFIG.damp)
  }

  static set #exy({ x, y }: { x: number; y: number }) {
    this.ex[0] = CONFIG.dampFunc(this.ex[0], x, CONFIG.damp)
    this.ey[0] = CONFIG.dampFunc(this.ey[0], y, CONFIG.damp)

    if (this.down) {
      this.ex[1] = CONFIG.dampFunc(
        this.ex[1],
        x,
        CONFIG.damp * CONFIG.dampDecay * 0.2
      )
      this.ey[1] = CONFIG.dampFunc(
        this.ey[1],
        y,
        CONFIG.damp * CONFIG.dampDecay * 0.2
      )
    } else {
      this.ex[1] = CONFIG.dampFunc(
        this.ex[1],
        x,
        CONFIG.damp * CONFIG.dampDecay
      )
      this.ey[1] = CONFIG.dampFunc(
        this.ey[1],
        y,
        CONFIG.damp * CONFIG.dampDecay
      )
    }
    // console.log(this.ex, this.ey)
  }
}
