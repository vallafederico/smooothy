# Smooth Extensible Slider

**Tiny real smooth fast cool all events and evenn more responsive _bring your own tooling slider._ Framework agnostic but it's a you problem.**

![alt text](/docs/img/github-brand-short.svg)



# Docs (Core)

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

#### CSS

```css
[data-slider] {
  display: flex;
}

[data-slider] > * {
  flex-shrink: 0;
  width: <number [unit]>;
  padding-right: 1rem; /* If you want gaps */
  padding-left: 1rem; /* If you want gaps */
}
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

Can be used as just the `Core`, but the idea and the way it's made is to be extended. Here's some [extending ideas/premade sliders](/docs/extend.md).

```js
// import slider
import { Core } from "smooothy"
// or whatever just using GSAP for request animation frame
import gsap from "../gsap"

export class Slider extends Core {
  constructor(wrapper, config) {
    super({ wrapper, config })

    // create your UI / do whatever
    // ...
  }

  doSomething() {
    // add your custom methods
  }
}
```

Most of those can be exported directly from the package, but if you want to combine functionality you might want to just look at source.


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
slider.paused = false // Unpause slider interactions
slider.snap = true // Snaps slide in place
slider.snap = false // Allows free scroll
```

### State Queries / Setters

```javascript
slider.currentSlide // Get current slide index
slider.progress // Get slider progress (0-1)
slider.target // Get target position / Set slider target
slider.current // Get current position / Set slider current
slider.viewport // Get viewport dimensions
slider.viewport.itemWidth // Size of a single slide
slider.viewport.wrapperWidth // Size of the wrapper
slider.viewport.totalWidth // Size of the scrollable width
slider.isVisible // Boolean if the slider is in view or not
```

`Target` and `Current` can be used as setters as well. Setting `target` will make the slider lerp to that position, setting current will make it move instantly.
Setting both is what you should do if you want to move it instantly to a specific position.

```javascript
slider.target = 5 // Lerp to slide 5
slider.current = slider.target = 5 // Instantly move to slide 5
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

## CSS and Styling

It's made to be styled/configured as much as possible from CSS directly. Position things as you wish to start directly in CSS, then add the slider. Use the `setOffset` callback in params as an aid for when it should end in case it's not infinite.

Assuming the slider is marked with `[data-slider]`, you'll probably want at least the following css to be applied.

```css
[data-slider] {
  display: flex;
}

[data-slider] > * {
  flex-shrink: 0
  width: <number [unit]> 
}
``` 

> ⚡️ CSS Gotcha
> To keep it as lignhtweight as possible it does not support gaps.
> If you want gaps use full width slides as the first child,
> apply padding to those (1/2 of the gap), and have the actual slide
> inside so you'll get the spacing you want. Voilà.


## Effects / Utils

### Parallax

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

This does the bare minimum, well, and provides ways to extend it and make it into what you need. Callbacks are a great way to extend the functionality, [here's some useful ones](/docs//callbacks.md).

## Touch and Mouse Interaction

The slider automatically handles:

- Mouse drag interactions
- Touch swipes with horizontal/vertical detection
- Momentum-based sliding
- Bounce effects (when `infinite: false`)
- Snap behavior (when `snap: true`)

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

## Premade Options

```js
import Core, { LinkSlider, ... } from "smooothy"
```

| Name | Description |
|------|-------------|
| `Core` | Base slider with core functionality |
| `KeyboardSlider` | Adds keyboard controls (arrows, spacebar, numpad) |
| `LinkSlider` | Handles link clicks within slides |
| `ControlSlider` | Full UI controls interface <sup>1</sup>  |

_(1) Needs matching HTML setup_

---

# WebGl

Made this because all other slider were mostly syncing bad with WebGl.

[_In depth webgl related docs._](/docs/webgl.md)

---

## Smooothy in use.

[**Siena Film Foundation**](https://www.siena.film/) by _[Niccolò Miranda](https://www.niccolomiranda.com/) [Federico Valla](https://federic.ooo/) [Carolina Hernando](https://www.behance.net/carohernando)_

---

[Changelog](/docs/changelog.md)
