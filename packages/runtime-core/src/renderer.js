import { Fragment, Text, Comment } from "./vnode.js"
import { ShapeFlags } from "../../shared/src/shapeFlags.js"

export function createRenderer(options) {
  return baseCreateRenderer(options)
}

function baseCreateRenderer(options) {
  const {
    insert,
    patchProp,
    createElement,
    setElementText
  } = options

  const patch = (oldVNode, newVNode, container, anchor) => {
    if (oldVNode === newVNode) {
      return
    }
    const { type, shapeFlag } = newVNode
    switch(type) {
      case Text:
        break
      case Comment:
        break
      case Fragment:
        break
      default:
        if (shapeFlag & ShapeFlags.ELEMENT) {
          // Element
        } else if (shapeFlag & ShapeFlags.COMPONENT) {
          // 组件
        }
    }
  }

  // 渲染函数
  const render = (vnode, container) => {
    if (vnode === null) {
      // TODO,卸载
    } else {
      patch(container._vnode || null, vnode, container)
    }
    container._vnode = vnode
  }
}
