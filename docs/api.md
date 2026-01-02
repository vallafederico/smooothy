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

  // Callbacks
  onSlideChange?: (current: number, previous: number) => void
  onResize?: (core: Core) => void
  onUpdate?: (core: Core) => void
}
```

### Properties

#### Read-only Properties

- `wrapper` (HTMLElement) - The slider container element
- `items` (HTMLElement[]) - Array of slide elements
- `viewport` (Viewport) - Current viewport information
- `config` (CoreConfig) - Current configuration
- `currentSlide` (number) - Current slide index
- `progress` (number) - Progress through slider (0-1)
- `isVisible` (boolean) - Whether slider is visible in viewport
- `isDragging` (boolean) - Whether user is currently dragging
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
