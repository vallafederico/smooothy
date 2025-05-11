import { Observe } from "./_/observe"
import gsap from "../gsap"

export class Footer extends Observe {
  svg: SVGElement[]
  lerped: number = 0
  tl: any

  constructor(element: HTMLElement) {
    super(element)
    this.element = element
    this.svg = [...element.querySelector("svg").children].map(
      child => child as SVGElement
    )
  }

  #aIn = null
  isIn = () => {
    this.#aIn = gsap.to(this.svg, {
      yPercent: 0,
      xPercent: 0,
      rotate: 0,
      duration: 1,
      stagger: {
        each: 0.02,
        from: "random",
      },
      ease: "expo.out",
    })
  }

  isOut = () => {
    if (this.#aIn) this.#aIn.kill()
    gsap.set(this.svg, {
      yPercent: 100,
      rotate: () => Math.random() * 120 - 60,
      xPercent: () => Math.random() * 100 - 50,
    })
  }
}
