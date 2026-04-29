import Core, { damp } from "../../../../package/index.ts"
import gsap from "../../js/gsap.ts"

export class Slider extends Core {
  constructor(wrapper, config = {}) {
    super(wrapper, {
      ...config,
      vertical: true,
    })

    this.rows = this.items

    this.hCore = new Core(wrapper, {
      ...config,
      vertical: false,
    })

    const firstRow = this.rows[0]
    if (firstRow) {
      this.hCore.items = [...firstRow.children]
      this.hCore.resize()
    }

    gsap.ticker.add(this.update.bind(this))
    gsap.ticker.add(this.updateHorizontal.bind(this))
  }

  updateHorizontal() {
    if (!this.hCore) return
    this.hCore.update()

    const masterItems = this.hCore.items
    for (let r = 1; r < this.rows.length; r++) {
      const rowSlides = this.rows[r].children
      for (let c = 0; c < masterItems.length; c++) {
        const slide = rowSlides[c]
        if (slide) slide.style.transform = masterItems[c].style.transform
      }
    }
  }

  destroy() {
    super.destroy()
    if (this.hCore) this.hCore.destroy()
  }
}

export { damp }
export default Core
