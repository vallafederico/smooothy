import { BoxGeometry, SphereGeometry, MeshNormalMaterial, Mesh } from "three"
import { SliderGroup } from "../dom/group"

import { hey } from "../../hey"
import { Gl } from "../gl"
import { Raf } from "../../utils/subscribable"
import { Observe } from "../../modules/_/observe"
import gsap from "../../gsap"
import { Bg } from "./bg/"
import { Food } from "./food"

const randomShape = () => {
  const geometry =
    Math.random() > 0.5
      ? new BoxGeometry(0.2, 0.2, 0.2)
      : new SphereGeometry(0.2, 16, 16)
  const material = new MeshNormalMaterial()
  return new Mesh(geometry, material)
}

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

    if (this.index === 0) {
      hey.on("WEBGL_LOADED", this.onLoad)
    } else {
      this.shape = randomShape()
      this.shape.rotation.set(0.4, 0.2, 0.7)
      this.add(this.shape)
    }
  }

  onLoad = () => {
    const model = Gl.scene.assets.model
    this.food = new Food(model, this.index)
    this.add(this.food)
  }

  resize() {
    this.bg.scale.set(this.bounds.width, this.bounds.height, 1)
  }

  raf = ({ time }) => {
    this.bg.speed = hey.FSLIDER.lspeed
    this.bg.time = time

    if (this.food) {
      this.food.onRaf(time)
    }
  }

  /** -- Animation */
  handleInView = isIn => {
    if (isIn) {
      this.#visible = true
      this.bg.view = 1
    } else {
      this.#visible = false
      this.bg.view = 0.5
    }

    if (this.food) {
      this.food.handleInView(isIn)
    }
  }
}
