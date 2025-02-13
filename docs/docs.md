# Core Slider Documentation

The Core class is a flexible and performant slider/carousel implementation that supports infinite scrolling, snapping, touch interactions, and parallax effects.

## Installation

```shell
pnpm i smooothy
```

```js
import Core from "smooothy"
```

<details>
<summary><strong>TLDR</strong></summary>

#### HTML

```html
<div class="slider-wrapper">
  <div class="slide">Slide 1</div>
  <div class="slide">Slide 2</div>
  <div class="slide">Slide 3</div>
</div>
```

#### Javascript

```javascript
// Create a new slider instance
const slider = new Core(document.querySelector("[data-slider]"))

// Update the slider (typically in an animation loop)
function animate() {
  slider.update()
  requestAnimationFrame(animate)
}
animate()

// Clean up when done
// slider.destroy()
```

</details>

## Features

### Really Really Really Basic Usage

```javascript
// Create a new slider instance
const slider = new Core(wrapperElement, {
  infinite: true,
  snap: true,
})

// Update the slider (typically in an animation loop)
function animate() {
  slider.update()
  requestAnimationFrame(animate)
}
animate()

// Clean up when done
slider.destroy()
```

### Smarter Usage

Made to be extended, can be used as core.
Premade ones will be listed somewhere eventualy and exported from same package.

```js
// import slider
import { Core } from "smooothy"
// or whatever just using GSAP raf
import gsap from "../gsap"

/** Basic Example */

export class Slider extends Core {
  constructor(container, config) {
    const wrapper = container.querySelector("[data-slider]")
    super({ wrapper, config })

    this.container = container

    // create your UI / do whatever
    this.previousNext = this.container.querySelector("...")
    // ...
  }
}
```

More [examples on how to extend here](/extend.md).

### Configuration Options

The slider accepts the following configuration options:
| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `infinite` | boolean | `true` | Enables infinite looping of slides |
| `snap` | boolean | `true` | Enables snapping to slide positions |
| `dragSensitivity` | number | `0.005` | Multiplier for drag movement sensitivity |
| `lerpFactor` | number | `0.3` | Controls the smoothness of animations (lower = smoother) |
| `scrollSensitivity` | number | `1` | Multiplier for scroll wheel sensitivity |
| `snapStrength` | number | `0.1` | How strongly the slider snaps to positions |
| `speedDecay` | number | `0.85` | How quickly the sliding speed decays |
| `bounceLimit` | number | `1` | Maximum overscroll amount when infinite is false |
| `scrollInput` | boolean | `false` | Enables mouse wheel/trackpad scrolling |
| `setOffset` | function | `({itemWidth, wrapperWidth}) => itemWidth` | Custom function to set slide end offset |
| `onSlideChange` | function | `null` | Callback when active slide changes |
| `onResize` | function | `null` | Callback when slider is resized |
| `onUpdate` | function | `null` | Callback on each update frame |

## Methods

### Navigation

```javascript
slider.goToNext() // Go to next slide
slider.goToPrev() // Go to previous slide
slider.goToIndex(n) // Go to specific slide index
```

### State Control

```javascript
slider.init() // Initialize the slider
slider.kill() // Temporarily disable the slider
slider.destroy() // Clean up event listeners and remove slider
slider.paused = true // Pause slider interactions
```

### State Queries

```javascript
slider.currentSlide // Get current slide index
slider.progress // Get slider progress (0-1)
slider.getProgress() // Alternative way to get progress
slider.target // Get target position
slider.current // Get current position
slider.viewport // Get viewport dimensions
```

## HTML Structure

The slider expects a wrapper element containing slide elements:

```html
<div class="slider-wrapper">
  <div class="slide">Slide 1</div>
  <div class="slide">Slide 2</div>
  <div class="slide">Slide 3</div>
</div>
```

Everything that's inside the container is going to be treated as slide, so only slides should go in.

## Styling

It's made to be style as much as possible from CSS directly. Position things as you wish to start directly in CSS, then add the slider. Use the `setOffset` callback in params as an aid for when it should end in case it's not infinite.

## Parallax Effects

You can add parallax elements within slides using the `data-parallax` attribute:

```html
<div class="slide">
  <div data-parallax="0.5">Moves at half speed</div>
  <div data-parallax="2">Moves at double speed</div>
</div>
```

## Event Callbacks

```javascript
const slider = new Core(wrapper, {
  onSlideChange: (currentSlide, previousSlide) => {
    console.log(`Moved from slide ${previousSlide} to ${currentSlide}`)
  },
  onResize: instance => {
    console.log("Slider was resized")
  },
  onUpdate: instance => {
    console.log("Slider updated")
  },
})
```

This does the bare minimum, well, and provides ways to extend it and make it into what you need.
Callbacks are a great way to extend the functionality, [here's some useful ones]("/callbacks.md").

## Touch and Mouse Interaction

The slider automatically handles:

- Mouse drag interactions
- Touch swipes with horizontal/vertical detection
- Momentum-based sliding
- Bounce effects (when `infinite: false`)
- Snap-to-grid behavior (when `snap: true`)

## Responsive Behavior

The slider automatically recalculates dimensions on window resize. You can customize the offset behavior using the `setOffset` config option:

```javascript
const slider = new Core(wrapper, {
  setOffset: ({ itemWidth, wrapperWidth }) => {
    return wrapperWidth / 2 // Center the active slide
  },
})
```

## Cleanup

Always call `destroy()` when removing the slider to clean up event listeners:

```javascript
slider.destroy()
```

This documentation covers the main features and usage patterns of the Core slider class. Let me know if you need any clarification or have questions about specific features!
