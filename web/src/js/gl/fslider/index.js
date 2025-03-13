import { Group as G } from "three"
import { Slide } from "./slide"
import { symmetricMod } from "../../utils/math"
import { hey } from "../../hey"

export class FSlider extends G {
  slides = []
  frustumCulled = false

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
  }

  onSlide(x) {
    this.slides.forEach((slide, i) => {
      const actual = symmetricMod(x, this.slides.length / 2)
      slide.onSlide(actual)
    })
  }

  onSlideChange = ([current, prev]) => {
    // console.log(current, prev)
    // this.slides[index].onSlideChange()
    // this.slides[prev].bg.view = 0.9
    // this.slides[current].bg.view = 1
  }
}
