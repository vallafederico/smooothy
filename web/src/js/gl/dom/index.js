import { Mesh, PlaneGeometry } from "three"
import { RawShaderMaterial, DoubleSide } from "three"
import { clientRectGl } from "../../utils/client-rect"
import { Resize } from "../../utils/subscribable"
import { Scroll } from "../../scroll"
import { Gl } from "../gl"
import vertexShader from "./vertex.vert"
import fragmentShader from "./fragment.frag"
import { symmetricMod } from "../../utils/math"

export const calculateSlidePosition = (index, slider) => {
  const unitPos = slider.current + index
  const wrappedPos = symmetricMod(unitPos, slider.items.length)
  return (wrappedPos - index) * slider.viewport.itemWidth * Gl.vp.px
}

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
    this.index = index
  }

  #resize() {
    this.bounds = clientRectGl(this.element)
    this.scale.set(this.bounds.width, this.bounds.height, 1)

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

export class NoScrollDom extends Mesh {
  geometry = new PlaneGeometry(1, 1, 1, 1)
  material = new Material()
  frustumCulled = false

  #isIn = false
  x = 0

  #resizer = Resize.subscribe(this.#resize.bind(this), 0)

  constructor(element) {
    super()
    this.element = element
  }

  #resize() {
    this.bounds = clientRectGl(this.element)
    this.scale.set(this.bounds.width, this.bounds.height, 1)

    this.resize?.()
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
