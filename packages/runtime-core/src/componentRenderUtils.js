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
  const { vnode, render } = instance
  let result

  try {
    // 有状态的组件
    if (vnode.shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
      // 获取到render函数的返回值
      result = normalizeVNode(render())
    }
  } catch (e) {
    console.error(e)
  }

  return result
}
