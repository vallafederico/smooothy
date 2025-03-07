import gsap from "../gsap"

export class Logo {
  element: HTMLElement
  svg: SVGElement[]

  constructor(element: HTMLElement) {
    this.element = element
    this.svg = [...element.querySelector("svg").children] as SVGElement[]
    this.init()
  }

  init() {
    this.element.onmouseenter = () => {
      gsap.to(this.svg, {
        duration: 0.6,
        yPercent: (i: number) =>
          i % 2 === 0 ? Math.random() * 25 : -Math.random() * 20,
        stagger: 0.02,
      })
    }

    this.element.onmouseleave = () => {
      gsap.to(this.svg, {
        duration: 0.6,
        yPercent: 0,
        stagger: 0.02,
      })
    }
  }

  destroy() {
    this.element.onmouseenter = null
    this.element.onmouseleave = null
  }
}
