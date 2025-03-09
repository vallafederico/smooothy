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
    const tl = gsap
      .timeline({
        paused: true,
        ease: "none",
      })
      .fromTo(
        this.svg,
        {
          yPercent: 150,
          // scale: 0.2,
          rotate: () => Math.random() * 120 - 60,
        },
        {
          yPercent: 0,
          rotate: 0,
          scale: 1,
          ease: "back.out(.3)",
          stagger: {
            each: 0.05,
            from: "random",
          },
        }
      )
    console.log(tl)

    return tl
  }

  handleScroll = () => {
    console.log(this.value * this.tl.duration())
    this.tl.seek(this.value * this.tl.duration())
  }
}
