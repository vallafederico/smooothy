// import { Vector2 } from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";

import { Shader } from "./base";
import { Gl } from "../gl";

export class Post extends EffectComposer {
  isOn = true;

  constructor() {
    super(Gl.renderer);
    this.renderPass = new RenderPass(Gl.scene, Gl.camera);
    this.addPass(this.renderPass);
    this.createPasses();
  }

  createPasses() {
    this.addPass(new Shader());
  }

  renderPasses(t) {}

  // *
  renderPost() {
    if (this.isOn) {
      this.renderPasses(Gl.time);
      this.render();
    } else {
      Gl.renderer.render(Gl.scene, Gl.camera);
    }
  }
}
