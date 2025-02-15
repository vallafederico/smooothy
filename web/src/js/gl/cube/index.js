import { Mesh, NodeMaterial, BoxGeometry } from "three/webgpu"
import * as tsl from "three/tsl"
// import { positionGeometry, cameraProjectionMatrix, modelViewProjection, modelScale, positionView, modelViewMatrix, storage, attribute, float, timerLocal, uniform, tslFn, vec3, vec4, rotate, PI2, sin, cos, instanceIndex, negate, texture, uv, vec2, positionLocal, int } from 'three/tsl';

// https://github.com/mrdoob/three.js/wiki/Three.js-Shading-Language
// https://medium.com/@christianhelgeson/three-js-webgpurenderer-part-1-fragment-vertex-shaders-1070063447f0

export class Cube extends Mesh {
  geometry = new BoxGeometry(1, 1, 1)
  material = new Material()

  constructor() {
    super()
  }

  update = () => {
    this.material.update()
  }
}

class Material extends NodeMaterial {
  constructor() {
    super()

    this.fragmentNode = tsl.Fn(() => {
      return tsl.vec4(1, 0, 0, 1)
    })()

    // this.vertexNode = tsl.Fn(() => {
    //   console.log(tsl.positionGeometry)
    //   //   return tsl.vec4(1, 0, 0, 1)

    //   const position = tsl.positionGeometry

    //   return tsl.vec4(position, 1)
    // })()

    this.updatePosition = tsl.Fn(() => {
      const position = tsl.positionLocal
      position.x.addAssign(tsl.sin(tsl.time))
      position.y.addAssign(tsl.cos(tsl.time))

      return tsl.vec4(position, 1)
    })

    console.log(this)
  }

  update = () => {
    this.positionNode = this.updatePosition()
  }
}
