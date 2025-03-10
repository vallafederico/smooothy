import gsap from "./gsap"
import { Scroll } from "./scroll"

import { Dom } from "./dom"
import { Gl } from "./gl/gl"

export class App {
  static scroll = Scroll
  static dom = new Dom()
  static gl = Gl
  static {}
}
