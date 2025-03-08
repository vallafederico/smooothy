import { Scroll } from "../scroll"
import { Resize } from "./subscribable"

export const clientRect = element => {
  const bounds = element.getBoundingClientRect()
  const scroll = Scroll.y || 0

  return {
    top: bounds.top + scroll,
    bottom: bounds.bottom + scroll,
    width: bounds.width,
    height: bounds.height,
    left: bounds.left,
    right: bounds.right,
    wh: Resize.window.innerHeight,
    ww: Resize.window.innerWidth,
    offset: bounds.top + scroll,
    centery: bounds.top + scroll + bounds.height / 2,
    centerx: bounds.left + bounds.width / 2,
  }
}

export const clientRectGl = (element, ratio = 1) => {
  const bounds = clientRect(element)

  for (const [key, value] of Object.entries(bounds)) bounds[key] = value * ratio

  return bounds
}
