# Smooothy Slider Usage Rules

When working with the smooothy slider, follow these rules for proper usage and configuration.

## Import and Setup

- Import `Core` from `"smooothy"` for the base slider functionality
- Import utilities like `damp`, `lerp` from `"smooothy"` when needed
- Always register the update loop using `gsap.ticker.add(this.update.bind(this))` or your own animation loop
- The slider wrapper element should have `[data-slider]` attribute or be passed directly to the constructor

```javascript
import Core from "smooothy"
import gsap from "gsap"

const slider = new Core(document.querySelector("[data-slider]"), {
  infinite: true,
  snap: true,
})

gsap.ticker.add(slider.update.bind(slider))
```

## HTML Structure

- The slider wrapper should contain only slide elements as direct children
- Use `display: flex` and `overflow-x-hidden` (or `overflow-y-hidden` for vertical) on the wrapper
- Each slide should have `flex-shrink: 0` to prevent shrinking
- Use padding on slides for gaps, not CSS `gap` property (slider doesn't support gaps)

```html
<div data-slider class="flex overflow-x-hidden">
  <div class="w-[80vw] shrink-0">Slide 1</div>
  <div class="w-[80vw] shrink-0">Slide 2</div>
  <div class="w-[80vw] shrink-0">Slide 3</div>
</div>
```

## Configuration

- Always pass configuration as the second parameter to the constructor
- Merge default config with custom config: `{ ...defaultConfig, ...customConfig }`
- Use `infinite: true` for looping sliders, `infinite: false` for finite with bounds
- Use `snap: true` to enable snap-to-slide behavior
- Use `variableWidth: true` when slides have different widths/heights
- Use `vertical: true` for vertical scrolling (default is horizontal)
- Use `scrollInput: true` to enable mouse wheel/trackpad scrolling

```javascript
const slider = new Core(wrapper, {
  infinite: true,
  snap: true,
  variableWidth: false,
  vertical: false,
  scrollInput: false,
  lerpFactor: 0.3, // Lower = smoother (default: 0.3)
  snapStrength: 0.1, // Snap animation strength (default: 0.1)
})
```

## Callbacks

- Use `onSlideChange(current, previous)` for slide change events
- Use `onUpdate(instance)` for frame-by-frame updates (access `parallaxValues`, `speed`, `progress`, etc.)
- Use `onResize(instance)` for resize events
- Callbacks receive the slider instance as context

```javascript
const slider = new Core(wrapper, {
  onSlideChange: (current, previous) => {
    console.log(`Slide changed from ${previous} to ${current}`)
  },
  onUpdate: (instance) => {
    // Access instance properties: parallaxValues, speed, progress, current, target
    instance.parallaxValues.forEach((value, i) => {
      // Apply parallax effects
    })
  },
  onResize: (instance) => {
    console.log("Slider resized", instance.viewport)
  },
})
```

## Navigation

- Use `slider.goToNext()` to navigate to the next slide
- Use `slider.goToPrev()` to navigate to the previous slide
- Use `slider.goToIndex(index)` to jump to a specific slide
- These methods update `target`, which smoothly interpolates to `current`

```javascript
// Programmatic navigation
slider.goToNext()
slider.goToPrev()
slider.goToIndex(2)
```

## State Management

- Access `slider.currentSlide` to get the current slide index (read-only)
- Access `slider.progress` to get progress from 0 to 1 (read-only)
- Access `slider.target` to get/set target position
- Access `slider.current` to get/set current position (read-only, updated by Core)
- Access `slider.speed` to get current scroll speed
- Access `slider.isVisible` to check if slider is in viewport (read-only)
- Set `slider.paused = true/false` to pause/unpause interactions
- Set `slider.snap = true/false` to enable/disable snap behavior

```javascript
// Read state
const currentIndex = slider.currentSlide
const progress = slider.progress
const isVisible = slider.isVisible

// Control state
slider.paused = true // Pause interactions
slider.snap = false // Disable snapping
slider.target = -2 // Set target position (will lerp to it)
```

## Viewport Access

- Access `slider.viewport` for dimensions: `itemWidth`, `wrapperWidth`, `totalWidth`, `itemHeight`, `wrapperHeight`, `totalHeight`, `vertical`
- Use viewport data for responsive calculations and custom effects

```javascript
slider.onUpdate = (instance) => {
  const { itemWidth, wrapperWidth, totalWidth } = instance.viewport
  // Use dimensions for calculations
}
```

## Parallax Effects

- Use `parallaxValues` array from `onUpdate` callback for parallax effects
- `parallaxValues[i]` contains the translate value for slide `i`
- Apply transforms to child elements based on parallax values

```javascript
class ParallaxSlider extends Core {
  constructor(wrapper, config) {
    super(wrapper, config)
    this.parallaxElements = [...wrapper.querySelectorAll(".parallax")]
  }

  onUpdate({ parallaxValues }) {
    this.parallaxElements.forEach((element, i) => {
      const offset = parallaxValues[i] * 20 // Adjust multiplier for effect strength
      element.style.transform = `translateX(${offset}%)`
    })
  }
}
```

## Variable Width Sliders

- Set `variableWidth: true` when slides have different widths
- Each slide's width is calculated automatically from CSS
- Slides snap to center based on their individual widths
- Works with both `infinite: true` and `infinite: false`

```javascript
const slider = new Core(wrapper, {
  variableWidth: true,
  infinite: true,
  snap: true,
})
```

## Vertical Sliders

- Set `vertical: true` for vertical scrolling
- Use `flex-col` and `overflow-y-hidden` in CSS
- Use `height` instead of `width` for slide dimensions
- Keyboard navigation uses ArrowUp/ArrowDown

```javascript
const slider = new Core(wrapper, {
  vertical: true,
  infinite: true,
  snap: true,
})
```

## Cleanup

- Always call `slider.destroy()` when removing the slider
- Remove GSAP ticker: `gsap.ticker.remove(slider.update.bind(slider))`
- Clean up custom event listeners in destroy methods

```javascript
// Cleanup
gsap.ticker.remove(slider.update.bind(slider))
slider.destroy()
```

## Extension Pattern

- Extend `Core` class for custom slider implementations
- Call `super(wrapper, config)` in constructor
- Register update loop with `gsap.ticker.add(this.update.bind(this))`
- Override callbacks as methods: `onUpdate`, `onSlideChange`, `onResize`

```javascript
import Core from "smooothy"
import gsap from "gsap"

export class CustomSlider extends Core {
  constructor(wrapper, config) {
    super(wrapper, config)
    gsap.ticker.add(this.update.bind(this))
  }

  onUpdate = (instance) => {
    // Custom update logic
  }

  onSlideChange = (current, previous) => {
    // Custom slide change logic
  }
}
```

## Common Mistakes to Avoid

- ❌ Don't add gaps using CSS `gap` property - use padding on slides instead
- ❌ Don't forget to register the update loop (`gsap.ticker.add`)
- ❌ Don't add non-slide elements as direct children of the slider wrapper
- ❌ Don't manually update `item.style.transform` - use `parallaxValues` from callbacks
- ❌ Don't forget to call `destroy()` when removing sliders
- ❌ Don't access `current` as a setter for smooth movement - use `target` instead
- ❌ Don't add duplicate event listeners for drag/touch - Core handles these internally

## Best Practices

- ✅ Always check `isVisible` before handling user input in custom extensions
- ✅ Use `deltaTime` from the instance for frame-rate independent animations
- ✅ Leverage `parallaxValues` for smooth parallax effects
- ✅ Use callbacks (`onUpdate`, `onSlideChange`) instead of polling state
- ✅ Set both `current` and `target` to the same value for instant positioning
- ✅ Use `variableWidth: true` for mixed content layouts
- ✅ Test both `infinite: true` and `infinite: false` modes
- ✅ Handle cleanup properly in component unmount lifecycle
