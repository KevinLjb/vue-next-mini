import { Fragment, Text, Comment, isSameVNodeType } from "./vnode.js"
import { ShapeFlags } from "../../shared/src/shapeFlags.js"
import { EMPTY_OBJ, isString } from "../../shared/src/index.js"
import { normalizeVNode } from "./componentRenderUtils.js"

export function createRenderer(options) {
  return baseCreateRenderer(options)
}

function baseCreateRenderer(options) {
  const {
    insert: hostInsert,
    patchProp: hostPatchProp,
    createElement: hostCreateElement,
    setElementText: hostSetElementText,
    remove: hostRemove,
    createText: hostCreateText,
    setText: hostSetText,
    createComment: hostCreateComment
  } = options

  // 处理fragment
  const processFragment = (oldVNode, newVNode, container, anchor) => {
    if (oldVNode == null) {
      mountChildren(newVNode.children, container, anchor)
    } else {
      patchChildren(oldVNode, newVNode, container, anchor)
    }
  }

  // 处理注释
  const processComment = (oldVNode, newVNode, container, anchor) => {
    if (oldVNode == null) {
      newVNode.el = hostCreateComment(newVNode.children)
      hostInsert(newVNode.el, container, anchor)
    } else {
      newVNode.el = oldVNode.el
    }
  }

  // 处理文本
  const processText = (oldVNode, newVNode, container, anchor) => {
    // 不存在旧节点,则为挂载操作
    if (oldVNode == null) {
      newVNode.el = hostCreateText(newVNode.children)
      hostInsert(newVNode.el, container, anchor)
    } else {
      // 存在旧节点，则为更新文本
      const el = newVNode.el = oldVNode.el
      if (newVNode.children !== oldVNode.children) {
        hostSetText(el, newVNode.children)
      }
    }
  }

  // 处理普通element
  const processElement = (oldVNode, newVNode, container, anchor) => {
    if (oldVNode == null) {
      // 挂载操作
      mountElement(newVNode, container, anchor)
    } else {
      // 更新操作
      patchElement(oldVNode, newVNode)
    }
  }

  // 对比更新节点
  const patchElement = (oldVNode, newVNode) => {
    const el = newVNode.el = oldVNode.el
    const oldProps = oldVNode.props || EMPTY_OBJ
    const newProps = newVNode.props || EMPTY_OBJ

    // 更新子节点
    patchChildren(oldVNode, newVNode, el, null)

    // 更新props
    patchProps(el, newVNode, oldProps, newProps)
  }

  // 对比更新children
  const patchChildren = (oldVNode, newVNode, container, anchor) => {
    // 旧节点的children
    const c1 = oldVNode && oldVNode.children
    // 旧节点shapeFlag
    const prevShapeFlag = oldVNode ? oldVNode.shapeFlag : 0
    // 新节点的children
    const c2 = newVNode.children
    // 新节点一定存在
    const { shapeFlag } = newVNode

    // 新节点的children是text
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      // 旧节点的children是数组
      if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        // 卸载旧子节点
      }
      if (c2 !== c1) {
        // 挂载新子节点的文本
        hostSetElementText(container, c2)
      }
    } else {
      // 旧节点的children是数组
      if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        // 新节点的children也是数组
        if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
          // diff
        } else {
          // 新子节点不是array，则直接卸载旧子节点
        }
      } else {
        // 旧节点的children是text
        if (prevShapeFlag & ShapeFlags.TEXT_CHILDREN) {
          hostSetElementText(container, '')
        }
        // 新节点的children是array
        if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
          // 单独挂载子节点操作
        }
      }
    }
  }

  // 对比更新props
  const patchProps = (el, vnode, oldProps, newProps) => {
    // 新旧props不同时才进行处理
    if (oldProps !== newProps) {
      for (const key in newProps) {
        const next = newProps[key]
        const prev = oldProps[key]
        if (next !== prev) {
          hostPatchProp(el, key, prev, next)
        }
      }
      // 存在旧的props时
      if (oldProps != EMPTY_OBJ) {
        for (const key in oldProps) {
          if (!(key in newProps)) {
            // 如果旧的props中有在新props中没有的属性
            // 则代表新的vnode删除了该属性
            hostPatchProp(el, key, oldProps[key], null)
          }
        }
      }
    }
  }

  // 挂载子节点
  const mountChildren = (children, container, anchor) => {
    // 如果是字符串，则转为字符数组
    if (isString(children)) {
      children = children.split('')
    }
    for (let index = 0; index < children.length; index++) {
      const child = children[index] = normalizeVNode(children[index])
      patch(null, child, container, anchor)
    }
  }

  // 挂载元素
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

    // 判断是否不是相同类型节点
    if (oldVNode && !isSameVNodeType(oldVNode, newVNode)) {
      // 如果元素类型不同，则直接删除旧元素
      unmount(oldVNode)
      oldVNode = null
    }

    const { type, shapeFlag } = newVNode
    switch(type) {
      case Text:
        processText(oldVNode, newVNode, container, anchor)
        break
      case Comment:
        processComment(oldVNode, newVNode, container, anchor)
        break
      case Fragment:
        processFragment(oldVNode, newVNode, container, anchor)
        break
      default:
        if (shapeFlag & ShapeFlags.ELEMENT) {
          // Element
          processElement(oldVNode, newVNode, container, anchor)
        } else if (shapeFlag & ShapeFlags.COMPONENT) {
          // 组件
        }
    }
  }

  // 渲染函数
  const render = (vnode, container) => {
    if (vnode === null) {
      // 旧节点存在，则代表这里应该要删除旧节点
      if (container._vnode) {
        // 删除旧节点
        unmount(container._vnode)
      }
    } else {
      patch(container._vnode || null, vnode, container)
    }
    container._vnode = vnode
  }

  const unmount = vnode => {
    hostRemove(vnode.el)
  }

  return {
    render
  }
}

