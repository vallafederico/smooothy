import { Group as G } from "three"
import { clientRectGl } from "../../utils/client-rect"
import { Resize } from "../../utils/subscribable"
import { Scroll } from "../../scroll"
import { Gl } from "../gl"
// import { Observe } from "../../modules/_/observe"

export class Group extends G {
  #isIn = false
  #resizer = Resize.subscribe(this.#resize.bind(this))
  #scroller = Scroll.subscribe(this.#scroll.bind(this))

  constructor(element) {
    super()
    this.element = element

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
