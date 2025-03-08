import Core from "smooothy"
import gsap from "../gsap"
import { Raf } from "../utils/subscribable"

export class FSlider extends Core {
  #raf = Raf.subscribe(this.update.bind(this))

  constructor(element: HTMLElement) {
    super(element.querySelector('[data-slider="wrapper"]'))
  }
}
