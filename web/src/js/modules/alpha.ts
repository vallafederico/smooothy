import gsap, { reduced } from "../gsap"
import { Observe } from "./_/observe"

export class Alpha extends Observe {
  #anim = null

  constructor(element: HTMLElement) {
    super(element)
    this.isOut()
  }

  isIn() {
    if (reduced) return

    this.#anim = gsap.to(this.element, {
      autoAlpha: 1,
      duration: 1,
      delay: 0.2,
    })
  }

  isOut() {
    if (reduced) return
    if (this.#anim) this.#anim.kill()

    gsap.set(this.element, {
      autoAlpha: 0,
    })
  }
}
