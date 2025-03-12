import { Scroll } from "./scroll"

import { Dom } from "./dom"
import { Gl } from "./gl/gl"
import { Mouse } from "./mouse"

export class App {
  static scroll = Scroll
  static dom = new Dom()
  static gl = Gl
  static {}
}

// /////////////////
