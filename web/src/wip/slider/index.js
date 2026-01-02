import Core, { lerp, damp } from "../../../../package/index.ts"
import gsap from "../../js/gsap.ts"

export class Slider extends Core {
  constructor(wrapper, config) {
    super(wrapper, config)

    gsap.ticker.add(this.update.bind(this))
    this.#addKeyboardEvents()
  }

  #handleKeydown = e => {
    if (!this.isVisible) return

    if (/^[0-9]$/.test(e.key)) {
      const slideIndex = parseInt(e.key)
      if (this.config.infinite) {
        this.goToIndex(slideIndex)
      } else {
        if (slideIndex > this.items.length - 1) return
        this.goToIndex(slideIndex)
      }
      return
    }

    switch (e.key) {
      case "ArrowLeft":
        if (!this.config.vertical) {
          this.goToPrev()
        }
        break
      case "ArrowRight":
        if (!this.config.vertical) {
          this.goToNext()
        }
        break
      case "ArrowUp":
        if (this.config.vertical) {
          this.goToPrev()
        }
        break
      case "ArrowDown":
        if (this.config.vertical) {
          this.goToNext()
        }
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

export { lerp, damp }
export default Core
