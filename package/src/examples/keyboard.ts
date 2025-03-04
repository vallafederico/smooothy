import { Core } from "../core"

interface SliderConfig {
  infinite?: boolean
  // ... add other config properties as needed
}

export class Slider extends Core {
  constructor(wrapper: HTMLElement, config: SliderConfig) {
    super(wrapper, config)

    // gsap.ticker.add(this.update.bind(this))
    this.#addKeyboardEvents()
  }

  #handleKeydown = (e: KeyboardEvent): void => {
    if (!this.isVisible) return

    if (/^[0-9]$/.test(e.key)) {
      const slideIndex: number = parseInt(e.key)
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

  #addKeyboardEvents(): void {
    window.addEventListener("keydown", this.#handleKeydown)
  }
}
