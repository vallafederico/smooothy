declare module "smooothy" {
  export default class Core {
    constructor(element: HTMLElement | null)
    onSlideChange: (current: number, previous: number) => void
    onUpdate: (params: { parallaxValues: number[] }) => void
    items: HTMLElement[]
  }
}
