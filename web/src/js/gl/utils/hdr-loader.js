import { UltraHDRLoader } from "three/examples/jsm/loaders/UltraHDRLoader"
import { EquirectangularReflectionMapping, FloatType } from "three"

const loader = new UltraHDRLoader()
loader.setDataType(FloatType)

export default function loadHDR(url) {
  return new Promise(resolve => {
    loader.load(url, texture => {
      texture.mapping = EquirectangularReflectionMapping
      resolve(texture)
    })
  })
}
