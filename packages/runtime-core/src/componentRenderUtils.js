import { createVNode, Text } from "./vnode.js"
import { ShapeFlags } from "../../shared/src/shapeFlags.js"

/**
 * 标准化VNode
 * @param child
 */
export function normalizeVNode(child) {
  if (typeof child === 'object') {
    return cloneIfMounted(child)
  } else {
    return createVNode(Text, null, String(child))
  }
}

/**
 * clone VNode
 * @param child
 * @returns {*}
 */
export function cloneIfMounted(child) {
  return child
}

export function renderComponentRoot(instance) {
  const { vnode, render, data } = instance
  let result
  try {
    // 有状态的组件
    if (vnode.shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
      // 获取到render函数的返回值,并且在调用时改变this指向
      result = normalizeVNode(render.call(data))
    }
  } catch (e) {
    console.error(e)
  }
  return result
}
