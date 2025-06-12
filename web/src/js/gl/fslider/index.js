import { Group as G } from "three"
import { Slide } from "./slide"
import { symmetricMod } from "../../utils/math"
import { hey } from "../../hey"

export class FSlider extends G {
  slides = []
  frustumCulled = false

  #settledTimer = null

  constructor(wrapper) {
    super()
    this.wrapper = wrapper
    this.element = wrapper.querySelector('[data-slider="wrapper"]')
    this.create()
  }

  create() {
    this.slides = [...this.element.children].map((child, i) => {
      return new Slide(child.querySelector("[data-gl]"), {
        index: i,
      })
    })

    this.add(...this.slides)
    hey.on("FSLIDE_CHANGE", this.onSlideChange)

    setTimeout(() => {
      this.onSlideChange([0, 0])
    }, 3000)
  }

  onSlide(x) {
    this.slides.forEach((slide, i) => {
      const actual = symmetricMod(x, this.slides.length / 2)
      slide.onSlide(actual)
    })
  }

  onSlideChange = ([current, prev]) => {
    const baseDuration = 4.2

    this.slides[prev].invalidate()

    this.slides[current].animateCentral(baseDuration)

    if (this.#settledTimer) {
      clearTimeout(this.#settledTimer)
      this.#settledTimer = null
    }

    const scheduleNextAnimation = () => {
      const randomDelay = Math.random() * 600 + baseDuration * 1000 * 2

      this.#settledTimer = setTimeout(() => {
        this.slides[current].animateCentral(baseDuration)

        scheduleNextAnimation()
      }, randomDelay)
    }

    scheduleNextAnimation()
  }
}
