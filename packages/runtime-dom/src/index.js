import { createRenderer } from "../../runtime-core/src/renderer.js"
import { extend } from "../../shared/src/index.js"
import { nodeOps } from "./nodeOps.js"
import { patchProp } from "./patchProp.js"

const rendererOptions = extend({ patchProp }, nodeOps)

let renderer

function ensureRenderer() {
  return renderer || (renderer = createRenderer(rendererOptions))
}

export const render = (...args) => {
  ensureRenderer().render(...args)
}
