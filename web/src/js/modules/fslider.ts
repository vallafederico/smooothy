import Core from "smooothy"
import { Raf } from "../utils/subscribable"
import { Gl } from "../gl/gl"
import { symmetricMod } from "../utils/math"
import { hey } from "../hey"
import { damp } from "../utils/math"

export const calculateSlidePosition = (index, slider) => {
  const unitPos = slider.current + index
  const wrappedPos = symmetricMod(unitPos, slider.items.length)
  return (wrappedPos - index) * slider.viewport.itemWidth * Gl.vp.px
}

export class FSlider extends Core {
  #queue = []
  #current = 0
  #raf = Raf.subscribe(this.update.bind(this), 11)

  lspeed = 0

  #buttons: HTMLUListElement[]
  #progress: HTMLDivElement
  #arrows: HTMLButtonElement[]

  constructor(element: HTMLElement) {
    super(element.querySelector('[data-slider="wrapper"]'), {
      lerpFactor: 0.27,
    })

    hey.FSLIDER = this

    this.createInterface(element)
  }

  createInterface(element: HTMLElement) {
    this.#buttons = [
      ...element.querySelector('[data-slider="controls"]').children[0].children,
    ] as HTMLUListElement[]

    this.#progress = element.querySelector(
      '[data-slider="controls"]'
    ) as HTMLDivElement

    this.#arrows = [
      ...element.querySelector('[data-slider="arrows"]').children,
    ] as HTMLButtonElement[]

    this.#buttons.forEach((button, i) => {
      button.onclick = () => this.goToIndex(i)
    })

    this.#arrows.forEach((button, i) => {
      button.children[0].onclick = () =>
        i === 0 ? this.goToPrev() : this.goToNext()
    })
  }

  lprogress = 0

  onUpdate = () => {
    this.lspeed = damp(this.lspeed, this.speed, 10)
    this.lprogress = damp(this.lprogress, this.progress, 5)

    if (Gl.scene && Gl.scene.fslider) {
      Gl.scene.fslider.children.forEach((child, i) => {
        const arr = calculateSlidePosition(i, this)
        child.onSlide?.(arr)
      })
    }

    this.#progress.children[0].style.left = `${
      this.lprogress * this.#progress.clientWidth
    }px`
  }

  onSlideChange = (index: number) => {
    this.#queue.push(index)

    if (this._timeout) clearTimeout(this._timeout)

    this._timeout = setTimeout(() => {
      const lastIndex = this.#queue[this.#queue.length - 1]
      this.#queue = []
      this.onSettled(lastIndex)
    }, 350)
  }

  onSettled = index => {
    this.items[this.#current].classList.remove("active")
    this.items[index].classList.add("active")
    this.#buttons[this.#current].classList.remove("active")
    this.#buttons[index].classList.add("active")

    hey.FSLIDE_CHANGE = [index, this.#current]

    this.#current = index
  }
}
