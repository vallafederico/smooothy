import Core from "smooothy"
import gsap from "../gsap"
import { Raf } from "../utils/subscribable"
import { Gl } from "../gl/gl"
import { symmetricMod } from "../utils/math"

export const calculateSlidePosition = (index, slider) => {
  const unitPos = slider.current + index
  const wrappedPos = symmetricMod(unitPos, slider.items.length)
  return (wrappedPos - index) * slider.viewport.itemWidth * Gl.vp.px
}

export class FSlider extends Core {
  #raf = Raf.subscribe(this.update.bind(this), 11)

  constructor(element: HTMLElement) {
    super(element.querySelector('[data-slider="wrapper"]'))
  }

  onUpdate = () => {
    if (Gl.scene && Gl.scene.fslider) {
      Gl.scene.fslider.children.forEach((child, i) => {
        const arr = calculateSlidePosition(i, this)
        child.onSlide?.(arr)
      })
    }
  }
}
