import loadModel from "./model-loader"
import loadTexture from "./texture-loader"
import loadHDR from "./hdr-loader"
import { assets as file } from "../assets/index"

export async function loadAssets(opt = null) {
  // console.time("assets::"); // !1 remove timer from here
  const assets = opt || file

  const promises = []
  const names = []

  for (const key in assets) {
    const asset = assets[key]

    const extension = asset.split(".").pop()

    if (key.includes("hdr")) {
      promises.push(loadHDR(asset))
    } else if (extension === "glb" || extension === "gltf") {
      promises.push(loadModel(asset))
    } else if (
      extension === "jpg" ||
      extension === "png" ||
      extension === "webp" ||
      extension === "jpeg"
    ) {
      promises.push(loadTexture(asset))
    }

    names.push(key)
  }

  const loaded = await Promise.all(promises)

  const result = names.reduce((acc, key, index) => {
    acc[key] = loaded[index]
    return acc
  }, {})

  return result
}
