import { Observe } from "./_/observe"
import gsap, { reduced } from "../gsap"

export class Draw extends Observe {
  #anim = null
  anim = {
    duration: 1,
    stagger: i => 0.2 + i * 0.3 + Math.random() * 0.2,
  }

  private svg: SVGElement[]
  constructor(element: HTMLElement) {
    super(element)
    this.element = element
    this.svg = [...this.element.querySelector("svg").children].map(
      el => el as SVGElement
    )

    this.isOut()
  }

  get sizes() {
    return this.svg.map(item => item.getTotalLength())
  }

  isIn() {
    if (reduced) return
    this.#anim = gsap.to(this.svg, {
      drawSVG: i => this.sizes[i],
      ...this.anim,
    })
  }

  isOut() {
    if (reduced) return
    if (this.#anim) this.#anim.kill()

    gsap.set(this.svg, {
      drawSVG: 0,
    })
  }
}
