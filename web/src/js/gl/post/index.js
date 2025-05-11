import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js"
import { RenderPass } from "three/addons/postprocessing/RenderPass.js"

import { hey } from "~/js//hey"
import gsap from "~/js/gsap"

import { Shader } from "./base"
import { Gl } from "../gl"

export class Post extends EffectComposer {
  isOn = true

  constructor() {
    super(Gl.renderer)
    this.renderPass = new RenderPass(Gl.scene, Gl.camera)
    this.addPass(this.renderPass)
    this.createPasses()
  }

  createPasses() {
    this.base = new Shader()
    this.addPass(this.base)
  }

  renderPasses(t) {}

  // *
  renderPost() {
    if (this.isOn) {
      this.renderPasses(Gl.time)
      this.render()
    } else {
      Gl.renderer.render(Gl.scene, Gl.camera)
    }
  }

  #onStart = hey.on("START", () => this.animateIn())

  animateIn = () => {
    // console.log("animateIn")

    gsap.to(this.base.uniforms.u_a_in, {
      value: 1,
      duration: 1.3,
      delay: 0.5,
      ease: "slow.out",
    })
  }
}
