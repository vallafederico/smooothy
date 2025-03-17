import { BoxGeometry, SphereGeometry, MeshNormalMaterial, Mesh } from "three"
import { SliderGroup } from "../dom/group"
import gsap from "../../gsap"

import { hey } from "../../hey"
import { Gl } from "../gl"
import { Raf } from "../../utils/subscribable"
import { Observe } from "../../modules/_/observe"
import { Bg } from "./bg/"
import { Food } from "./food"

export class Slide extends SliderGroup {
  #visible = true
  #raf = Raf.subscribe(t => this.raf(t))
  #observe = new Observe(this.element, {
    threshold: 0.05,
    // rootMargin: "0% 20% 0% -20%",
    callback: ({ isIn }) => {
      this.handleInView(isIn)
    },
  })

  constructor(element, { index }) {
    super(element, { index })
    this.element = element
    this.index = index

    this.bg = new Bg()
    this.add(this.bg)

    hey.on("WEBGL_LOADED", this.onLoad)
  }

  onLoad = () => {
    this.food = new Food(Gl.scene.assets.model.children[0], this.index)
    this.add(this.food)
  }

  resize() {
    this.bg.scale.set(this.bounds.width, this.bounds.height, 1)
  }

  raf = ({ time }) => {
    if (!this.#visible) return

    this.bg.speed = hey.FSLIDER.lspeed
    this.bg.time = time * 0.4

    if (this.food) {
      this.food.onRaf(time, hey.FSLIDER.parallaxValues[this.index])
    }
  }

  /** -- Animation */
  handleInView = isIn => {
    if (isIn) {
      this.#visible = true
      this.bg.view = 1
    } else {
      this.#visible = false
      this.bg.view = 0.45
    }

    if (this.food) {
      this.food.handleInView(isIn)
    }
  }
}
