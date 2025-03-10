import gsap, { reduced } from "../gsap"
import { Observe } from "./_/observe"

import { computeParams } from "./_/index"

export class Alpha extends Observe {
  #anim = null
  a = {
    duration: 1,
    delay: 0.2,
    autoAlpha: 1,
  }

  constructor(element: HTMLElement) {
    super(element)

    computeParams(this.element, this.a)
    this.isOut()
  }

  isIn() {
    if (reduced) return

    this.#anim = gsap.to(this.element, {
      ...this.a,
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
