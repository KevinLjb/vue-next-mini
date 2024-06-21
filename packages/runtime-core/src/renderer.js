import { Fragment, Text, Comment } from "./vnode.js"
import { ShapeFlags } from "../../shared/src/shapeFlags.js"

export function createRenderer(options) {
  return baseCreateRenderer(options)
}

function baseCreateRenderer(options) {
  const {
    insert: hostInsert,
    patchProp: hostPatchProp,
    createElement: hostCreateElement,
    setElementText: hostSetElementText
  } = options

  const processElement = (oldVNode, newVNode, container, anchor) => {
    if (oldVNode == null) {
      mountElement(newVNode, container, anchor)
    } else {

    }
  }

  const mountElement = (vnode, container, anchor) => {
    const { type, props, shapeFlag } = vnode
    // 创建element
    const el = vnode.el = hostCreateElement(type)
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      // 设置文本子节点
      hostSetElementText(el, vnode.children)
    } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {

    }
    // 处理props
    if (props) {
      for (const key in props) {
        // 第一次赋值,所有oldValue为null,相当于直接赋值
        hostPatchProp(el, key, null, props[key])
      }
    }
    // 插入el到指定位置
    hostInsert(el, container, anchor)
  }

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

