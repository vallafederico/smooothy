// import gsap from "../gsap"
import Core from "smooothy"
import { Raf } from "../utils/subscribable"

const SCALE_CTRL = 0.5

export class GSlider extends Core {
  #raf = Raf.subscribe(this.update.bind(this))

  constructor(element: HTMLElement) {
    super(element.querySelector('[data-slider="wrapper"]'), {
      infinite: true,
    })

    this.letters = [...element.querySelectorAll('[data-a="letter"]')]
    this.#addKeyboardEvents()
  }

  onUpdate = ({ parallaxValues }) => {
    const speed = Math.abs(this.speed) * 0.04 + 0.5

    this.letters.forEach((letter, i) => {
      letter.style.transform = `
      translateY(${Math.sin(parallaxValues[i] * 1) * 20}%)
      scale(${Math.sin(Math.abs(parallaxValues[i]) * 0.5 + 2) + speed})
      `
    })
  }

  #handleKeydown = e => {
    if (!this.isVisible) return

    if (/^[0-9]$/.test(e.key)) {
      const slideIndex = parseInt(e.key)

      if (this.config.infinite) {
        this.goToIndex(slideIndex)
      } else {
        e.preventDefault()
        if (slideIndex > this.items.length - 1) return
        this.goToIndex(slideIndex)
      }
      return
    }

    if (e.key === " ") {
      e.preventDefault()
      e.stopPropagation()
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

  #addKeyboardEvents() {
    window.addEventListener("keydown", this.#handleKeydown)
  }
}
