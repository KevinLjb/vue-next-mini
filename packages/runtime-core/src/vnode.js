import {isString, isFunction, isArray, isObject} from "../../shared/src/index.js"
import { ShapeFlags } from "../../shared/src/shapeFlags.js"
import { normalizeClass } from "../../shared/src/normalizeProp.js"

export const Fragment = Symbol('Fragment')
export const Text = Symbol('Text')
export const Comment = Symbol('Comment')

/**
 * 创建一个VNode对象
 * @param type
 * @param props
 * @param children
 */
export function createVNode(type, props, children) {
  // 通过 bit 位处理 shapeFlag 类型
  // 这里判断并记录下dom类型
  const shapeFlag = isString(type) ?
    // 是字符串，则为element
    ShapeFlags.ELEMENT
    // 是对象，则是一个有状态的组件,h(component)
    : isObject(type) ? ShapeFlags.STATEFUL_COMPONENT : 0
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
  if (props) {
    let { class: klass } = props
    // 处理class
    if (klass && !isString(klass)) {
      props.class = normalizeClass(klass)
    }
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
  // 这里是将dom和其children的类型，合并到一起记录下来
  // 这样一个变量，可以同时记录下dom和children的类型
  vnode.shapeFlag |= type
}

export const isVNode = value => {
  return value ? value.__v_isVNode === true : false
}

/**
 * 根据key || type判断是否为相同类型节点
 */
export function isSameVNodeType(n1, n2) {
  return n1.type === n2.type && n1.key === n2.key
}
