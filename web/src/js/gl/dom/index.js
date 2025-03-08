import { Mesh, PlaneGeometry } from "three"
import { RawShaderMaterial, DoubleSide } from "three"
import { clientRectGl } from "../../utils/client-rect"
import { Resize } from "../../utils/subscribable"
import { Scroll } from "../../scroll"
import { Gl } from "../gl"
import vertexShader from "./vertex.vert"
import fragmentShader from "./fragment.frag"

export class Dom extends Mesh {
  geometry = new PlaneGeometry(1, 1, 1, 1)
  material = new Material()

  constructor(element) {
    super()
    this.element = element

    Resize.subscribe(this.resize.bind(this))
    Scroll.subscribe(this.scroll.bind(this))
  }

  resize() {
    this.bounds = clientRectGl(this.element)
    this.scale.set(this.bounds.width, this.bounds.height, 1)
    this.position.x = this.bounds.centerx
    this.position.y = this.bounds.centery

    this.scroll()
  }

  scroll() {
    this.position.y = this.bounds.centery + Scroll.y * Gl.vp.px
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
