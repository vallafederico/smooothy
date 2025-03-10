import { Track } from "./_/track"
import gsap, { reduced } from "../gsap"

// (*) IDEA make it based on vertical or not

export class Bouncy extends Track {
  svg: SVGGElement[]

  #anim = null
  anim = {
    duration: 0.8,
    yPercent: 0,
    xPercent: 0,
    scale: 1,
    stagger: {
      each: 0.06,
      from: "random",
    },
  }

  constructor(element: HTMLElement) {
    super(element)
    this.svg = [...this.element.querySelector("svg").children].filter(
      (el): el is SVGGElement => el instanceof SVGGElement
    )

    this.isOut()
  }

  handleScroll = value => {
    // console.log(value)
  }

  isIn = ({ direction }) => {
    if (reduced) return
    this.#anim = gsap.to(this.svg, {
      ...this.anim,
    })
  }

  isOut = ({ direction } = { direction: -1 }) => {
    if (reduced) return
    if (this.#anim) this.#anim.kill()

    gsap.set(this.svg, {
      yPercent: i => 80 * -direction,
      xPercent: i => (i - this.svg.length / 2) * 50,
    })
  }
}
