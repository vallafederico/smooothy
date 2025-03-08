import gsap from "../gsap"

export class Logo {
  element: HTMLElement
  svg: SVGElement[]

  anim = {
    stagger: 0.02,
    duration: 0.6,
    yPercent: 0,
    xPercent: 0,
  }

  constructor(element: HTMLElement) {
    this.element = element
    this.svg = [...element.querySelector("svg").children] as SVGElement[]
    this.init()
  }

  init() {
    this.element.onmouseenter = () => {
      gsap.to(this.svg, {
        ...this.anim,
        yPercent: (i: number) =>
          i % 2 === 0 ? Math.random() * 35 : -Math.random() * 35,
        xPercent: (i: number) =>
          i % 2 === 0 ? -Math.random() * 15 : Math.random() * 15,
      })
    }

    this.element.onmouseleave = () => {
      gsap.to(this.svg, {
        ...this.anim,
      })
    }
  }

  destroy() {
    this.element.onmouseenter = null
    this.element.onmouseleave = null
  }
}
