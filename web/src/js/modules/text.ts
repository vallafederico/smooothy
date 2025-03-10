import { Observe } from "./_/observe"
import SplitText from "@activetheory/split-text"
import gsap, { reduced } from "../gsap"

const DEFAULT = "words"

const split = (element: HTMLElement) => {
  const type = element.dataset.type || DEFAULT
  const split = new SplitText(element, { type })
  element.setAttribute("aria-label", split.originals[0])
  split.result = split[type]
  return split
}

// //////////////////////////////////////////

export class Text extends Observe {
  #anim: any
  private split: any

  a = {
    duration: 1,
    delay: 0.2 + Math.random() * 0.w,
    autoAlpha: 1,
    // yPercent: 0,
    stagger: {
      each: 0.03,
      from: "random",
      grid: "auto",
    },
  }

  constructor(element: HTMLElement) {
    super(element)
    this.split = split(this.element).result
    let delay = this.element.dataset.delay
    if (delay) this.a.delay += parseFloat(delay)
    // console.log(this.a.delay)

    this.isOut()
  }

  isIn = () => {
    if (reduced) return

    this.#anim = gsap.to(this.split, {
      ...this.a,
    })
  }

  isOut = () => {
    if (reduced) return

    if (this.#anim) this.#anim.kill()
    gsap.set(this.split, {
      autoAlpha: 0,
      //   yPercent: i => Math.random() * 100,
    })
  }
}
