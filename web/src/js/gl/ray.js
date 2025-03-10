import { Raycaster, Vector2 } from "three";
import { Gl } from "@gl/gl";

export class Ray {
  casting = false;
  raycaster = new Raycaster();
  pointer = new Vector2();

  constructor(target, { casting } = {}) {
    this.target = target;
    this.casting = casting;

    console.log(Gl.camera, this);
  }

  set isCasting(value) {
    this.casting = value;
  }

  cast(reset = false) {
    if (!this.casting) return;
    this.pointer.x = Gl.mouse.ex;
    this.pointer.y = Gl.mouse.ey;

    this.raycaster.setFromCamera(this.pointer, Gl.camera);

    const intersects = this.raycaster.intersectObjects(this.target, false);
    // console.log(intersects);

    if (intersects.length > 0) {
      // console.log(intersects[0].point);

      if (reset) {
        this.casting = false;
      }

      return intersects[0].point;
    }
  }
}
