import {
  InstancedMesh,
  PlaneGeometry,
  RawShaderMaterial,
  DoubleSide,
} from "three";

import { calcAttributes } from "./utils";

import vertexShader from "./vertex.vert";
import fragmentShader from "./fragment.frag";

export class Instance extends InstancedMesh {
  count = 10;

  constructor() {
    super();

    this.geometry = new PlaneGeometry(1, 1, 1, 1);
    this.setAttributes();
    this.material = new Material();
  }

  setAttributes() {
    const attributes = calcAttributes(this.count);
    for (const key in attributes) {
      const { name, data } = attributes[key];
      this.geometry.setAttribute(name, data);
    }
  }

  render(t) {}

  resize() {}
}

class Material extends RawShaderMaterial {
  constructor(options) {
    super({
      vertexShader,
      fragmentShader,
      side: DoubleSide,
      wireframe: true,
      transparent: true,
      uniforms: {
        u_time: { value: options?.u_time || 0 },
        u_t1: { value: options?.u_t1 || null },
      },
    });
  }

  set time(t) {
    this.uniforms.u_time.value = t;
  }
}
