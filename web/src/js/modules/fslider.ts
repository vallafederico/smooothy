import Core from "smooothy"
import gsap from "../gsap"
import { Raf } from "../utils/subscribable"
import { Gl } from "../gl/gl"
import { symmetricMod } from "../utils/math"

// (*) fix sync resize with webgl when out of view

export class FSlider extends Core {
  #raf = Raf.subscribe(this.update.bind(this), 11)

  constructor(element: HTMLElement) {
    super(element.querySelector('[data-slider="wrapper"]'))
  }

  onUpdate = () => {
    if (Gl.scene && Gl.scene.children[0]) {
      Gl.scene.children[0].children.forEach((child, i) => {
        child.onSlide?.(this)
      })
    }
  }
}
