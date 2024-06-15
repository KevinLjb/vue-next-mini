import { isString, isFunction, isArray } from "../../shared/src/index.js"
import { ShapeFlags } from "../../shared/src/shapeFlags.js"

/**
 * 创建一个VNode对象
 * @param type
 * @param props
 * @param children
 */
export function createVNode(type, props, children) {
  // 通过 bit 位处理 shapeFlag 类型
  const shapeFlag = isString(type) ? ShapeFlags.ELEMENT : 0
  return createBaseVNode(type, props, children, shapeFlag)
}

// 创建vnode
export function createBaseVNode(type, props, children, shapeFlag) {
  const vnode = {
    // 标记是一个vnode对象
    __v_isVNode: true,
    type,
    props,
    shapeFlag
  }
  // 处理children
  normalizeChildren(vnode, children)
  return vnode
}

export function normalizeChildren(vnode, children) {
  let type = 0
  const { shapeFlag } = vnode
  if (children == null) {
    children = null
  } else if (isArray(children)) {
    type = ShapeFlags.ARRAY_CHILDREN
  } else if (typeof children === 'object') {
    // TODO: object
  } else if (isFunction(children)) {
    // TODO: function
  } else {
    // children 为 string
    children = String(children)
    // 为 type 指定 Flags
    type = ShapeFlags.TEXT_CHILDREN
  }
  // 修改vnode的children为处理过的children
  vnode.children = children
  // 按位或赋值
  vnode.shapeFlag |= type
}

export const isVNode = value => {
  return value ? value.__v_isVNode === true : false
}
