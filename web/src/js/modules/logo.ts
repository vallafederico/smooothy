import gsap from "../gsap"

export class Logo {
  element: HTMLElement
  svg: SVGElement[]
  resetTimeout: number | null = null

  anim = {
    stagger: 0.02,
    duration: 0.8,
    yPercent: 0,
    xPercent: 0,
  }

  constructor(element: HTMLElement) {
    this.element = element
    this.svg = [...element.querySelector("svg").children] as SVGElement[]
    this.init()
  }

  scheduleReset() {
    if (this.resetTimeout) clearTimeout(this.resetTimeout)
    this.resetTimeout = window.setTimeout(
      () => gsap.to(this.svg, this.anim),
      3000 + Math.random() * 1000
    )
  }

  init() {
    this.element.onmouseenter = () => {
      gsap.to(this.svg, {
        ...this.anim,
        ...randomXY(20),
      })
      this.scheduleReset()
    }

    this.element.onmouseleave = () => {
      gsap.to(this.svg, {
        ...this.anim,
        ...randomXY(20),
      })
      this.scheduleReset()
    }

    this.animateIn()
  }

  destroy() {
    if (this.resetTimeout) {
      clearTimeout(this.resetTimeout)
    }
    this.element.onmouseenter = null
    this.element.onmouseleave = null
  }

  animateIn() {
    gsap.set(this.svg, {
      ...randomXY(1000),
      autoAlpha: 1,
    })

    gsap.to(this.svg, {
      ...this.anim,
      xPercent: 0,
      yPercent: 0,
      ease: "back.out(1.2)",
    })
  }

  animateOut() {}
}

const randomXY = (spread: number) => {
  return {
    yPercent: (i: number) =>
      i % 2 === 0 ? Math.random() * spread : -Math.random() * spread,
    xPercent: (i: number) =>
      i % 2 === 0 ? -Math.random() * spread : Math.random() * spread,
  }
}
