import { Scene } from "three";
import { Quad } from "../quad";
// import { Gl } from "./gl";

export default class extends Scene {
  isOn = true;

  constructor(vp) {
    super();
    // this.vp = Gl.vp;

    this.create();
  }

  create() {
    this.quad = new Quad();
    this.add(this.quad);
  }

  render(t) {
    this.quad?.render(t);
  }

  resize(vp) {
    // this.vp = vp;
  }
}
