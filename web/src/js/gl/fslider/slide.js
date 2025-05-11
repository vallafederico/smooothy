import { SliderGroup } from "../dom/group"
import gsap from "../../gsap"

import { hey } from "../../hey"
import { Gl } from "../gl"
import { Raf } from "../../utils/subscribable"
import { Observe } from "../../modules/_/observe"
import { Bg } from "./bg/"
import { Food } from "./food"

import { SLIDER_FOOD } from "../../../content"

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

  #onSlideSettle = hey.on("FSLIDE_CHANGE", ([current, old]) => {
    this.onSettle(current, old)
  })

  #onLoad = hey.on("WEBGL_LOADED", () => {
    this.onLoad()
  })

  #onStart = hey.on("START", () => this.animateIn())

  constructor(element, { index }) {
    super(element, { index })
    this.lib = SLIDER_FOOD[index]
    this.element = element
    this.index = index

    this.bg = new Bg(this.lib)
    this.add(this.bg)
  }

  onLoad = () => {
    const model = Gl.scene.assets.model.children.filter(
      child => child.name === this.lib.name
    )[0]

    this.food = new Food(model, this.index, this.lib)
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
      this.bg.view = 0
    }

    if (this.food) {
      this.food.handleInView(isIn)
    }
  }

  onSettle = (current, old) => {
    if (current === old) return

    if (this.index === current) {
      this.bg.center = 1
    } else if (this.index === old) {
      this.bg.center = 0
    }
  }

  animateIn = () => {
    // console.log("animateIn")

    gsap.to(this.food.a, {
      rotation: 0,
      startY: 0,
      duration: 2.2,
      ease: "elastic.out(1,0.7)",
      delay: 0.2 + Math.random() * 0.6,
    })
  }
}
