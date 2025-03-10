# Extending Examples

## AKA Smarter Usage

While it works as just the Core, the idea is for the library to provide all the baseline functionality and a nice interface to extend it, keep it as light as it can be but as flexible as you want.


### Controls

Add dots, arrows and navigation methods.

```js
import Core from "smooothy"
import gsap from "gsap"

class ControlsSlider extends Core {
  constructor(container: HTMLElement, config = {}) {
    super(container.querySelector("[data-slider]"))

    this.createInterface(container.querySelector("[data-interface]"))
    this.parallaxy = [...container.querySelectorAll("[data-p]")]

    this.onSlideChange(0, 0)
    gsap.ticker.add(this.update.bind(this))
  }

  createInterface(int: HTMLElement) {
    this.dots = [...int.querySelector("[data-dots]").children]
    const arrows = [...int.querySelector("[data-arrows]").children]

    arrows.forEach(
      (arrow, index) =>
        (arrow.onclick = () =>
          index === 0 ? this.goToPrev() : this.goToNext())
    )

    this.dots.forEach(
      (dot, index) => (dot.onclick = () => this.goToIndex(index))
    )
  }

  onSlideChange = (current, previous) => {
    this.items[previous].children[0].children[0].classList.remove("active")
    this.items[current].children[0].children[0].classList.add("active")

    this.dots[previous].children[0].classList.remove("active-dot")
    this.dots[current].children[0].classList.add("active-dot")
  }
}


```

### Capture Link Clicks

Pretty common issue is mixing sliding and click behaviour with slides that are actual links.

```js
  import Core from "smooothy"
  import gsap from "~/js/gsap"

  export class LinkSlider extends Core {
    constructor(container: HTMLElement, config = {}) {
      super(container.querySelector("[data-slider]"))
      gsap.ticker.add(this.update.bind(this))

      this.#handleLinks()
    }
    #handleLinks() {
      ;[...this.wrapper.querySelectorAll("a")].forEach((item, i) => {
        let startX = 0
        let startY = 0
        let startTime = 0
        let isDragging = false

        item.style.pointerEvents = "none"

        const handleMouseDown = e => {
          startX = e.clientX
          startY = e.clientY
          startTime = Date.now()
          isDragging = false
        }

        const handleMouseMove = e => {
          if (!startTime) return

          const deltaX = Math.abs(e.clientX - startX)
          const deltaY = Math.abs(e.clientY - startY)

          if (deltaX > 5 || deltaY > 5) {
            isDragging = true
          }
        }

        const handleMouseUp = e => {
          const deltaTime = Date.now() - startTime

          if (!isDragging && deltaTime < 200) {
            item.click()
          }

          startTime = 0
          isDragging = false
        }

        item.parentElement.addEventListener("mousedown", handleMouseDown)
        item.parentElement.addEventListener("mousemove", handleMouseMove)
        item.parentElement.addEventListener("mouseup", handleMouseUp)
      })
    }
  }
```
### Keyboard Controls

Adds keyboard (arrows, spacebar) controls for next and previous slide, and numpad controls to get to a specific slide.

```js
import Core from "smooothy"
import gsap from "gsap"

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



### Base parallax

```html
<!-- ... -->
```

```js
// 
```

### Parallax and Speed

```html
<!-- ... -->
```

```js
// 
```

### Capture Link Clicks

Pretty common issue is mixing sliding and click behaviour with slides that are actual links.

```js
import Core from "smooothy"
import gsap from "gsap"

export class LinkSlider extends Core {
  constructor(container: HTMLElement, config = {}) {
    super(container.querySelector("[data-slider]"))
    gsap.ticker.add(this.update.bind(this))

    this.#handleLinks()
  }
  #handleLinks() {
    ;[...this.wrapper.querySelectorAll("a")].forEach((item, i) => {
      let startX = 0
      let startY = 0
      let startTime = 0
      let isDragging = false

      item.style.pointerEvents = "none"

      const handleMouseDown = e => {
        startX = e.clientX
        startY = e.clientY
        startTime = Date.now()
        isDragging = false
      }

      const handleMouseMove = e => {
        if (!startTime) return

        const deltaX = Math.abs(e.clientX - startX)
        const deltaY = Math.abs(e.clientY - startY)

        if (deltaX > 5 || deltaY > 5) {
          isDragging = true
        }
      }

      const handleMouseUp = e => {
        const deltaTime = Date.now() - startTime

        if (!isDragging && deltaTime < 200) {
          item.click()
        }

        startTime = 0
        isDragging = false
      }

      item.parentElement.addEventListener("mousedown", handleMouseDown)
      item.parentElement.addEventListener("mousemove", handleMouseMove)
      item.parentElement.addEventListener("mouseup", handleMouseUp)
    })
  }
}
```

### Settled Queue

```html
<!-- ... -->
```

```js
// 
```
