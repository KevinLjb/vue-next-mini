import { createVNode, Text } from "./vnode.js"

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
