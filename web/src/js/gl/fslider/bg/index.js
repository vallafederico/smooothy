import { Mesh, PlaneGeometry, Color } from "three"
import { RawShaderMaterial, DoubleSide } from "three"
import gsap from "~/js/gsap"

import vertexShader from "./vertex.vert"
import fragmentShader from "./fragment.frag"

const RESOLUTION = 18

export class Bg extends Mesh {
  geometry = new PlaneGeometry(1, 1, RESOLUTION, RESOLUTION * 1.3)
  material = new Material()

  constructor(lib) {
    super()
    this.setBackground(lib)
  }

  #a_view = null
  set view(val) {
    if (this.#a_view) this.#a_view.kill()

    this.#a_view = gsap.to(this.material.uniforms.u_a_view, {
      value: val,
      duration: 1.4,
      delay: val > 0.7 ? 0.07 + Math.random() * 0.08 : 0,
      ease: "expo.out",
    })
  }

  #a_center = null

  set center(val) {
    if (this.#a_center) this.#a_center.kill()

    this.#a_center = gsap.to(this.material.uniforms.u_a_center, {
      value: val,
      duration: 1.4,
      ease: "expo.out",
    })
  }

  setBackground(lib) {
    this.material.uniforms.COL_1.value = new Color(lib.bg[0])
    this.material.uniforms.COL_2.value = new Color(lib.bg[1])
    this.material.uniforms.COL_3.value = new Color(lib.bg[2])
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
        // gradient
        COL_1: { value: [0, 0, 0] },
        COL_2: { value: [0, 0, 0] },
        COL_3: { value: [0, 0, 0] },
        // animation
        u_a_view: { value: 0 },
        u_a_speed: { value: 0 },
        u_a_center: { value: 0 },
        u_a_in: { value: 0 },
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
