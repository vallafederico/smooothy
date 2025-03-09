import { Mesh, PlaneGeometry } from "three"
import { RawShaderMaterial, DoubleSide } from "three"
import { clientRectGl } from "../../utils/client-rect"
import { Resize } from "../../utils/subscribable"
import { Scroll } from "../../scroll"
import { Gl } from "../gl"
import vertexShader from "./vertex.vert"
import fragmentShader from "./fragment.frag"

// (*) fix sync resize with slider when out of view

export class Dom extends Mesh {
  geometry = new PlaneGeometry(1, 1, 1, 1)
  material = new Material()
  frustumCulled = false

  #isIn = false
  x = 0

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
    this.scale.set(this.bounds.width, this.bounds.height, 1)
    this.bounds.centerx -= this.x
    this.position.y = this.bounds.centery

    this.#scroll()
    this.resize?.()
  }

  #scroll() {
    this.position.y = this.bounds.centery + Scroll.y * Gl.vp.px
    this.scroll?.()
  }

  onSlide(x) {
    this.x = x
    this.position.x = x + this.bounds.centerx
  }
}

class Material extends RawShaderMaterial {
  constructor(options) {
    super({
      vertexShader,
      fragmentShader,
      uniforms: {
        u_time: { value: options?.u_time || 0 },
        u_t1: { value: options?.u_t1 || null },
      },
      side: DoubleSide,
      wireframe: false,
      transparent: true,
    })
  }

  set time(t) {
    this.uniforms.u_time.value = t
  }
}
