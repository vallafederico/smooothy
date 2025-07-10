import { Group as G } from "three"
import { clientRectGl } from "../../utils/client-rect"
import { Resize } from "../../utils/subscribable"
import { Scroll } from "../../scroll"
import { Gl } from "../gl"

export class Group extends G {
  #isIn = false
  #resizer = Resize.subscribe(this.#resize.bind(this))
  #scroller = Scroll.subscribe(this.#scroll.bind(this))

  x = 0

  constructor(element, { index } = {}) {
    super()
    this.element = element
    this.index = index

    // this.#observe = new Observe(this.element, {
    //   callback: ({ isIn }) => {
    //     this.#isIn = isIn
    //   },
    // })
  }

  #resize() {
    this.bounds = clientRectGl(this.element)

    this.position.x = this.bounds.centerx
    this.position.y = this.bounds.centery

    this.#scroll()
    this.resize?.()
  }

  #scroll() {
    this.position.y = this.bounds.centery + Scroll.y * Gl.vp.px
    this.scroll?.()
  }
}

export class SliderGroup extends G {
  #isIn = false
  #resizer = Resize.subscribe(this.#resize.bind(this))
  #scroller = Scroll.subscribe(this.#scroll.bind(this))

  x = 0

  constructor(element) {
    super()
    this.element = element
  }

  #resize() {
    this.bounds = clientRectGl(this.element)
    this.bounds.centerx -= this.x

    this.position.x = this.bounds.centerx
    this.position.y = this.bounds.centery

    this.#scroll()
    this.resize?.()

    setTimeout(() => {
      this.bounds = clientRectGl(this.element)
      this.bounds.centerx -= this.x

      this.position.x = this.bounds.centerx
      this.position.y = this.bounds.centery
      this.#scroll()
    }, 100)
  }

  #scroll() {
    this.position.y = this.bounds.centery + Scroll.y * Gl.vp.px
    this.scroll?.()
  }

  onSlide(value) {
    this.x = value
    this.position.x = this.bounds.centerx + this.x
  }
}
