import { InstancedBufferAttribute } from "three";

// * utils
export function calcAttributes(num) {
  const a_rot = new Float32Array(num * 1);
  const a_pos = new Float32Array(num * 3);

  for (let i = 0; i < num; i++) {
    a_rot.set([Math.random() - 0.5], i * 1);
    a_pos.set(
      [Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5],
      i * 3
    );
  }

  return {
    a_rotation: {
      name: "a_rotation",
      data: new InstancedBufferAttribute(a_rot, 1),
    },
    a_position: {
      name: "a_position",
      data: new InstancedBufferAttribute(a_pos, 3),
    },
  };
}
