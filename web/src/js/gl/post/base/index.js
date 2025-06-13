import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js"
import fragmentShader from "./fragment.frag"
import vertexShader from "./vertex.vert"

export const CopyShader = {
  uniforms: {
    tDiffuse: { value: null },
    opacity: { value: 1.0 },
    u_a_in: { value: 0 },
  },
  vertexShader,
  fragmentShader,
}

export class Shader extends ShaderPass {
  constructor() {
    super(CopyShader)
  }
}
