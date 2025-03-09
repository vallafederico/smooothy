import { Track } from "./_/track"
import gsap from "../gsap"

export class Footer extends Track {
  svg: SVGElement[]
  lerped: number = 0
  tl: any

  constructor(element: HTMLElement) {
    super(element, {
      top: "bottom",
      bottom: "bottom",
      bounds: [0, 1],
    })
    this.element = element
    this.svg = [...element.querySelector("svg").children].map(
      child => child as SVGElement
    )

    this.tl = this._tl
  }

  // isIn = () => {
  //   // console.log("in")
  // }

  // isOut = () => {
  //   // console.log("out")
  // }

  get _tl() {
    return gsap
      .timeline({
        paused: true,
        ease: "linear",
      })
      .fromTo(
        this.svg,
        {
          yPercent: 150,
          scale: 0.2,
          // rotate: () => Math.random() * 120 - 60,
        },
        {
          yPercent: 0,
          rotate: 0,
          scale: 1,
          stagger: {
            each: 0.05,
            from: "random",
          },
        }
      )
  }

  handleScroll = () => {
    this.tl.seek(this.value)
  }
}
