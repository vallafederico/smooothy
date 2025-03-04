# Extending Examples

## AKA Smarter Usage

While it works as just the Core, the idea is to provide all the core functionality, keep it as light as it can be, and extend it based on your needs.

### Keyboard Controls

Adds keyboard (arrows, spacebar) controls for next and previous slide, and numpad controls to get to a specific slide.

```js
import Core from "smooothy"
import gsap from "../gsap"

export class KeyboardSlider extends Core {
  constructor(wrapper, config) {
    super(wrapper, config)

    gsap.ticker.add(this.update.bind(this))
    this.#addKeyboardEvents()
  }

  #handleKeydown = e => {
    if (!this.isVisible) return

    // this for numbers are pressed
    if (/^[0-9]$/.test(e.key)) {
      const slideIndex = parseInt(e.key)
      if (this.config.infinite) {
        // automatically takes the shortest path
        this.goToIndex(slideIndex)
      } else {
        if (slideIndex > this.items.length - 1) return
        this.goToIndex(slideIndex)
      }
      return
    }

    // this for arrows and spacebar
    switch (e.key) {
      case "ArrowLeft":
        this.goToPrev()
        break
      case "ArrowRight":
        this.goToNext()
        break
      case " ":
        this.goToNext()
        break
    }
  }

  #addKeyboardEvents() {
    window.addEventListener("keydown", this.#handleKeydown)
  }
}
```

### Capture Link Clicks — TO BE TESTED

Pretty common issue is mixing sliding and click behaviour with slides that are actual links.

```js
import Core from "smooothy"

export class LinkSlider extends Slider {
  constructor(wrapper, config) {
    super(wrapper, config)

    this.#handleLinks()
  }

  #handleLinks() {
    ;[...this.wrapper.querySelectorAll("a")].forEach((item, i) => {
      let startX = 0
      let startTime = 0

      item.addEventListener("mousedown", e => {
        e.preventDefault()
        startX = e.clientX
        startTime = Date.now()
      })

      item.addEventListener("mouseup", e => {
        e.preventDefault()
        const deltaX = Math.abs(e.clientX - startX)
        const deltaTime = Date.now() - startTime

        if (deltaX < 5 && deltaTime < 200) {
          item.children[0].click()
        }
      })
    })
  }
}
```

### Full Control Interface

```html
<!-- ... -->
```

```js
import Core from "smooothy"
import gsap from "../gsap"

export class ControlSlider extends Core {
  constructor(wrapper, config) {
    super(wrapper, config)

    // ...
  }
}
```
