# API Reference

## Core Class

The main slider class that provides all the functionality.

```js
import Core from "smooothy"

const slider = new Core(wrapper, config)
```

### Constructor

**Parameters:**

- `wrapper` (HTMLElement) - The container element with slides as direct children
- `config` (Partial<CoreConfig>) - Configuration object (optional)

### Configuration Options

```js
interface CoreConfig {
  // Basic behavior
  infinite: boolean           // Enable infinite scrolling (default: true)
  snap: boolean              // Enable snap to slides (default: true)
  variableWidth: boolean     // Enable variable width slides (default: false)
  vertical: boolean          // Enable vertical scrolling (default: false)

  // Sensitivity and animation
  dragSensitivity: number    // Mouse/touch drag sensitivity (default: 0.005)
  lerpFactor: number         // Animation smoothing factor (default: 0.3)
  scrollSensitivity: number  // Scroll wheel sensitivity (default: 1)
  snapStrength: number       // Snap animation strength (default: 0.1)
  speedDecay: number         // Speed decay factor (default: 0.85)
  bounceLimit: number        // Bounce limit for finite sliders (default: 1)

  // Virtual scroll configuration
  virtualScroll: {
    mouseMultiplier: number  // Mouse wheel multiplier (default: 0.5)
    touchMultiplier: number  // Touch scroll multiplier (default: 2)
    firefoxMultiplier: number // Firefox specific multiplier (default: 30)
    useKeyboard: boolean     // Enable keyboard controls (default: false)
    passive: boolean         // Use passive event listeners (default: true)
  }

  // Custom offset calculation
  setOffset: (viewport: Viewport) => number  // Function to calculate offset (default: itemWidth)

  // Input handling
  scrollInput: boolean       // Enable scroll input (default: false)
  disableInput: boolean      // Skip Core's own pointer/wheel listeners (default: false).
                             // Drive the instance via pointerDown/pointerMove/pointerUp/scroll.

  // Items management
  watchItems: boolean        // When true (default), resize() re-collects items
                             // from wrapper.children and Core installs a
                             // MutationObserver so dynamically added/removed
                             // slides are picked up automatically. Set to
                             // `false` when you manage the `items` array
                             // externally (e.g. composing multiple cores on
                             // the same wrapper, or when slides aren't direct
                             // children).

  // Callbacks
  onSlideChange?: (current: number, previous: number) => void
  onResize?: (core: Core) => void
  onUpdate?: (core: Core) => void
}
```

### Properties

#### Read-only Properties

- `wrapper` (HTMLElement) - The slider container element
- `items` (HTMLElement[]) - Array of slide elements (re-collected on `resize()` and on `MutationObserver`-driven slide changes)
- `viewport` (Viewport) - Current viewport information
- `config` (CoreConfig) - Current configuration
- `currentSlide` (number) - Current slide index
- `progress` (number) - Progress through slider (0-1)
- `isVisible` (boolean) - Whether slider is visible in viewport
- `isDragging` (boolean) - Whether user is currently dragging
- `isTouching` (boolean) - Whether the active drag is a touch input (vs mouse / pen). Set from `PointerEvent.pointerType === 'touch'`.
- `isIdle` (boolean) - True when not dragging, `speed ~ 0`, `target ~ current`, and (when snapping) parked at a snap point. `update()` reads this internally to skip per-item transform writes; consumers can read it to skip their own per-frame work.
- `maxScroll` (number) - Maximum scroll position

#### Mutable Properties

- `current` (number) - Current position
- `target` (number) - Target position
- `speed` (number) - Current speed
- `deltaTime` (number) - Time since last update
- `parallaxValues` (number[]) - Parallax values for each item
- `webglValue` (number) - WebGL-specific value

#### Getters/Setters

- `paused` (boolean) - Get/set pause state
- `snap` (boolean) - Get/set snap behavior

### Methods

#### Navigation

- `goToNext()` - Go to next slide
- `goToPrev()` - Go to previous slide
- `goToIndex(index: number)` - Go to specific slide index

#### State Control

- `kill()` - Stop the slider and reset transforms
- `init()` - Restart the slider
- `destroy()` - Clean up event listeners and observers
- `resize()` - Manually trigger resize recalculation

#### Information

- `getProgress()` - Get current progress (0-1)
- `update()` - Update slider state (called in animation loop)

#### Input (manual / passive mode)

When `disableInput` is `false` (the default), Core installs its own
`pointerdown` / `pointermove` / `pointerup` / `pointercancel` /
`lostpointercapture` listeners on the wrapper, uses
`setPointerCapture` to keep tracking when the cursor leaves, and sets
`touch-action`, `user-select`, and `cursor` inline styles on the
wrapper (all restored on `destroy()`).

With `disableInput: true` Core skips all of that, and you drive the
instance by calling these public methods directly — useful for
composing multiple Cores on one wrapper, or for sourcing input from a
non-DOM origin (timeline, scroll-link, gamepad, etc.). In passive mode
**Core does not set `touch-action` or `user-select`** — manage those
yourself if needed.

- `pointerDown(event: { clientX, clientY })` - Begin a drag (sets
  `isDragging`, snapshots start position, resets the velocity tracker).
- `pointerMove(event: { clientX, clientY, movementX?, movementY? })` -
  Continue the drag. `PointerEvent` always provides `movementX/Y`. For
  externally-synthesized input (e.g. from a `Touch` object) pass
  `movementX/Y` yourself for proper velocity; if omitted, Core treats
  movement as `0` for the speed accumulator only — drag distance is
  still tracked from `clientX/Y`.
- `pointerUp()` - Finish the drag. Projects the inertial resting
  position from the smoothed drag velocity (`projection = dragDelta /
  (1 - speedDecay)`) and snaps to the nearest slide. Projection is
  only applied when `snap` is enabled.
- `scroll(event: { deltaX, deltaY, touchDevice? })` - Apply a wheel /
  virtual-scroll delta. Uses `deltaX` or `deltaY` based on
  `config.vertical` / `config.scrollInput`.

```js
const core = new Core(wrapper, { disableInput: true })

// Pointer Events: one path for mouse/touch/pen
wrapper.addEventListener("pointerdown", e => {
  wrapper.setPointerCapture(e.pointerId)
  core.pointerDown(e)
})
wrapper.addEventListener("pointermove", e => core.pointerMove(e))
wrapper.addEventListener("pointerup",   () => core.pointerUp())

import VirtualScroll from "virtual-scroll"
new VirtualScroll({ el: wrapper }).on(e => core.scroll(e))
```

### Callbacks

#### onSlideChange(current: number, previous: number)

Called when the current slide changes.

```js
const slider = new Core(wrapper, {
  onSlideChange: (current, previous) => {
    console.log(`Slide changed from ${previous} to ${current}`)
  },
})
```

#### onResize(core: Core)

Called when the slider is resized.

```js
const slider = new Core(wrapper, {
  onResize: core => {
    console.log("Slider resized", core.viewport)
  },
})
```

#### onUpdate(core: Core)

Called on every update frame.

```js
const slider = new Core(wrapper, {
  onUpdate: core => {
    // Access current state
    console.log("Progress:", core.progress)
    console.log("Speed:", core.speed)
    console.log("Parallax values:", core.parallaxValues)
  },
})
```

## Utility Functions

### lerp(v0: number, v1: number, t: number): number

Linear interpolation between two values.

```js
import { lerp } from "smooothy"

const value = lerp(0, 100, 0.5) // Returns 50
```

### damp(a: number, b: number, lambda: number, deltaTime: number): number

Damped interpolation for smooth animations.

```js
import { damp } from "smooothy"

// Smoothly animate towards target
const current = damp(current, target, 0.1, deltaTime)
```

### symmetricMod(value: number, base: number): number

Symmetric modulo operation for infinite scrolling.

```js
import { symmetricMod } from "smooothy"

const normalized = symmetricMod(5, 3) // Returns -1
```

## Viewport Interface

```js
interface Viewport {
  // Horizontal dimensions
  itemWidth: number    // Width of a single item
  wrapperWidth: number // Width of the wrapper
  totalWidth: number   // Total width of all items
  
  // Vertical dimensions
  itemHeight: number   // Height of a single item
  wrapperHeight: number // Height of the wrapper
  totalHeight: number  // Total height of all items
  
  // Orientation
  vertical: boolean    // Whether slider is in vertical mode
}
```

## Examples

### Basic Usage

```js
import Core from "smooothy"
import gsap from "gsap"

const wrapper = document.querySelector(".slider")
const slider = new Core(wrapper, {
  infinite: true,
  snap: true,
})

gsap.ticker.add(slider.update.bind(slider))
```

### With Callbacks

```js
const slider = new Core(wrapper, {
  onSlideChange: (current, previous) => {
    // Update UI indicators
    updateDots(current, previous)
  },
  onUpdate: core => {
    // Update progress bar
    progressBar.style.transform = `scaleX(${core.progress * 100}%)`
  },
})
```

### Variable Width

```js
const slider = new Core(wrapper, {
  infinite: false,
  snap: true,
  variableWidth: true,
  scrollInput: true,
})

// Each slide can have a different width
// The slider automatically centers each slide based on its width
```

### State Control

```js
// Pause/resume
slider.paused = true // Pause
slider.paused = false // Resume

// Enable/disable snap
slider.snap = false

// Kill and restart
slider.kill()
slider.init()

// Manual navigation
slider.goToIndex(3)
slider.goToNext()
slider.goToPrev()
```
