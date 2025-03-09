import { Group as G, BoxGeometry, MeshNormalMaterial, Mesh } from "three"
import { Group } from "../dom/group"
import { Dom } from "../dom"
import { symmetricMod } from "../../utils/math"

import { App } from "../../app"

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
      //   console.log(child)
      return new Slide(child.children[0], {
        index: i,
      })
    })

    this.add(...this.slides)
  }

  onSlide(x, parallaxValues) {
    this.slides.forEach((slide, i) => {
      const actual = symmetricMod(x, this.slides.length / 2)
      slide.onSlide(actual)
    })
    // console.log("onSlide", x)
  }
}

class Slide extends Dom {
  constructor(element, { index }) {
    super(element)
    // this.element = element
    // this.index = index
    // this.total = total

    // this.add(new Mesh(new BoxGeometry(1, 1, 1), new MeshNormalMaterial()))
    // console.log(this)
  }
}
