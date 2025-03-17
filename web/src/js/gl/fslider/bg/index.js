import { Mesh, PlaneGeometry } from "three"
import { RawShaderMaterial, DoubleSide } from "three"
import gsap from "~/js/gsap"

import vertexShader from "./vertex.vert"
import fragmentShader from "./fragment.frag"

const RESOLUTION = 32

export class Bg extends Mesh {
  geometry = new PlaneGeometry(1, 1, RESOLUTION, RESOLUTION * 1.3)
  material = new Material()

  constructor() {
    super()
  }

  #a_view = null
  set view(val) {
    if (this.#a_view) this.#a_view.kill()

    this.#a_view = gsap.to(this.material.uniforms.u_a_view, {
      value: val,
      duration: 1.4,
      delay: val > 0.7 ? 0.05 : 0,
      ease: "expo.out",
    })
  }

  set speed(val) {
    this.material.uniforms.u_a_speed.value = val
  }

  set time(t) {
    this.material.uniforms.u_time.value = t
  }
}

class Material extends RawShaderMaterial {
  constructor(options) {
    super({
      vertexShader,
      fragmentShader,
      uniforms: {
        u_time: { value: 0 },
        u_t1: { value: options?.u_t1 || null },
        u_random: {
          value: [Math.random() * 3, Math.random() * 3, Math.random() * 4],
        },
        u_a_view: { value: 0 },
        u_a_speed: { value: 0 },
      },
      side: DoubleSide,
      // wireframe: true,
      transparent: false,
      depthWrite: false,
    })
  }

  set time(t) {
    this.uniforms.u_time.value = t

    // console.log(this.uniforms.u_a_view.value)
  }
}
