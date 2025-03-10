import { Mesh, PlaneGeometry } from "three"
import { RawShaderMaterial, DoubleSide } from "three"
import { Gl } from "../gl"

import vertexShader from "./vertex.vert"
import fragmentShader from "./fragment.frag"

export class Quad extends Mesh {
  geometry = new PlaneGeometry(1, 1, 1, 1)
  material = new Material()

  constructor() {
    super()
  }

  render(t) {
    // console.log(t);
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
