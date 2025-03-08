import { Scroll } from "../scroll"
import { Resize } from "./subscribable"
import { Gl } from "../gl/gl"

export const clientRect = element => {
  const bounds = element.getBoundingClientRect()

  return {
    top: bounds.top + Scroll.y,
    bottom: bounds.bottom + Scroll.y,
    width: bounds.width,
    height: bounds.height,
    left: bounds.left,
    right: bounds.right,
    wh: Resize.window.innerHeight,
    ww: Resize.window.innerWidth,
    offset: bounds.top + Scroll.y,
    centery:
      Resize.window.innerHeight / 2 - bounds.height / 2 - bounds.top - Scroll.y,
    centerx: -Resize.window.innerWidth / 2 + bounds.left + bounds.width / 2,
  }
}

export const clientRectGl = (element, ratio = Gl.pixel || 1) => {
  const bounds = clientRect(element)
  for (const [key, value] of Object.entries(bounds)) bounds[key] = value * ratio
  return bounds
}
