import { Scroll } from "./scroll"

import { Dom } from "./dom"
import { Gl } from "./gl/gl"
// import { Mouse } from "./mouse"

export class App {
  static scroll = Scroll
  static dom = new Dom()
  static gl = Gl

  static {
    document.body.classList.add("started")
  }
}

// /////////////////

// ;(() => {
//   console.log(
//     "%c%s",
//     "font-size:10px; color:#fff; background:#000; padding: 10px 10px; margin: 20px 0px;",
//     "CC HTTPS://FEDERIC.OOO 👀"
//   )
// })()
