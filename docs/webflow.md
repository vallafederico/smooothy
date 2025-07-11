# Webflow Implementation

[Cloneable](https://webflow.com/made-in-webflow/website/smooothy)

## Html

Before the script taking effect, you need to import the the library globally.

```html
<script src="https://unpkg.com/smooothy"></script>
```

For the most basic setup, you only need a container, `flex horizontal`, with slides inside. Don't use gap, but in case wrap the slides in a div and give padding to those.

Select this and pass it to Smooothy as a configuration.

## Css

Container should be flex horizontal so the slides tile correctly. Probably have a `max-width` of at least 100vw (or less, depending on your design) so it doesn't overflow.

## Js

```js
// Select the wrapper <Div>
const sliderWrapper = document.querySelector('[data-smooothy="1"]')

// Initialise the Slider
const slider = new Smooothy(sliderWrapper, {
  // infinite: true,
  // snap: false,
  // dragSensitivity: 0.005,
  // lerpFactor: 0.3,
  // scrollSensitivity: 1,
  // snapStrength: 0.5,
  // ...
})

// Animate in a Raf
function animate() {
  slider.update()
  requestAnimationFrame(animate)
}

animate()
```

You might want to wrap this in a DOMContentLoaded but this ultimately depends on your setup.

```js
document.addEventListener("DOMContentLoaded", () => {
  // ...
})
```
