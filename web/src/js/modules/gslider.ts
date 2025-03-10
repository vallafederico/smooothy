// import gsap from "../gsap"
import Core from "smooothy"
import { Raf } from "../utils/subscribable"

export class GSlider extends Core {
  #raf = Raf.subscribe(this.update.bind(this))

  constructor(element: HTMLElement) {
    super(element.querySelector('[data-slider="wrapper"]'), {
      infinite: true,
    })

    this.letters = [...element.querySelectorAll('[data-a="letter"]')]
  }

  onUpdate = ({ parallaxValues }) => {
    this.letters.forEach((letter, i) => {
      letter.style.transform = `
      translateY(${Math.sin(parallaxValues[i] * 1) * 20}%)
      scale(${Math.sin(Math.abs(parallaxValues[i]) * 0.5 + 0.5)})
      `
    })
  }
}
