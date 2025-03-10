export { Track } from "./track"
export { Observe } from "./observe"
export { Module } from "./module"
export { createModules } from "./create"

export function computeParams(element: HTMLElement, a: any) {
  const delay = element.dataset.delay
  if (delay) a.delay += parseFloat(delay)
}
