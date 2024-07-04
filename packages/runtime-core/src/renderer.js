import { Fragment, Text, Comment, isSameVNodeType } from "./vnode.js"
import { ShapeFlags } from "../../shared/src/shapeFlags.js"
import { EMPTY_OBJ, isString } from "../../shared/src/index.js"
import { normalizeVNode, renderComponentRoot } from "./componentRenderUtils.js"
import { createComponentInstance, setupComponent } from "./component.js"
import { ReactiveEffect } from "../../reactivity/src/effect.js"
import { queuePreFlushCb } from "./scheduler.js"

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
          patchKeyedChildren(c1, c2, container, anchor)
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

  /**
   * diff
   */
  const patchKeyedChildren = (oldChildren, newChildren, container, parentAnchor) => {
    // 索引
    let i = 0
    // 新子节点的长度
    const newChildrenLength = newChildren.length
    // 旧子节点的最大索引
    let oldChildrenEnd = oldChildren.length - 1
    // 新子节点的最大索引
    let newChildrenEnd = newChildrenLength - 1
    // 1.自前向后的diff
    while (i <= oldChildrenEnd && i <= newChildrenEnd) {
      const oldVNode = oldChildren[i]
      const newVNode = normalizeVNode(newChildren[i])
      // 判断两个vnode是否是同一个vnode
      if (isSameVNodeType(oldVNode, newVNode)) {
        // 是同一个vnode，直接使用patch比对即可
        patch(oldVNode, newVNode, container, null)
      } else {
        break
      }
      i++
    }

    // 2.自后向前的diff
    while (i <= oldChildrenEnd && i <= newChildrenEnd) {
      const oldVNode = oldChildren[oldChildrenEnd]
      const newVNode = newChildren[newChildrenEnd]
      if (isSameVNodeType(oldVNode, newVNode)) {
        patch(oldVNode, newVNode, container, null)
      } else {
        break
      }
      oldChildrenEnd--
      newChildrenEnd--
    }

    // 3.新节点多于旧节点的diff
    if (i > oldChildrenEnd) {
      if (i <= newChildrenEnd) {
        // 获取到下一个节点索引
        const nextPos = newChildrenEnd + 1
        // 判断下一个索引是否大于新节点的最大索引，如果没超过，则取出当前位置的el做为锚点
        // 新节点的元素将插入到该元素之前
        const anchor = nextPos < newChildrenLength ? newChildren[nextPos].el : parentAnchor
        while (i <= newChildrenEnd) {
          patch(null, normalizeVNode(newChildren[i]), container, anchor)
          i++
        }
      }
    } else if (i > newChildrenEnd) {
      // 4.旧节点多于新节点的diff
      while (i <= oldChildrenEnd) {
        unmount(oldChildren[i])
        i++
      }
    } else {
      // 5.乱序的diff比对
      const oldStartIndex = i
      const newStartIndex = i
      const keyToNewIndexMap = new Map()
      for (i = newStartIndex; i <= newChildrenEnd; i++) {
        const nextChild = normalizeVNode(newChildren[i])
        if (nextChild.key != null) {
          keyToNewIndexMap.set(nextChild.key, i)
        }
      }

      let j
      let patched = 0
      const toBePatched = newChildrenEnd - newStartIndex + 1
      let moved = false
      let maxNewIndexSoFar = 0
      const newIndexToOldIndexMap = new Array(toBePatched)
      for (i = 0; i < toBePatched; i++) newIndexToOldIndexMap[i] = 0
      for (i = oldStartIndex; i <= oldChildrenEnd; i++) {
        const prevChild = oldChildren[i]
        if (patched >= toBePatched) {
          unmount(prevChild)
          continue
        }
        let newIndex
        if (prevChild.key != null) {
          newIndex = keyToNewIndexMap.get(prevChild.key)
        }

        if (newIndex === undefined) {
          unmount(prevChild)
        }
        else {
          newIndexToOldIndexMap[newIndex - newStartIndex] = i + 1
          if (newIndex >= maxNewIndexSoFar) {
            maxNewIndexSoFar = newIndex
          } else {
            moved = true
          }
          patch(prevChild, newChildren[newIndex], container, null)
          patched++
        }
      }

      const increasingNewIndexSequence = moved
        ? getSequence(newIndexToOldIndexMap)
        : []
      j = increasingNewIndexSequence.length - 1
      for (i = toBePatched - 1; i >= 0; i--) {
        const nextIndex = newStartIndex + i
        const nextChild = newChildren[nextIndex]
        const anchor =
          nextIndex + 1 < newChildrenLength
            ? newChildren[nextIndex + 1].el
            : parentAnchor
        if (newIndexToOldIndexMap[i] === 0) {
          patch(null, nextChild, container, anchor)
        } else if (moved) {
          if (j < 0 || i !== increasingNewIndexSequence[j]) {
            move(nextChild, container, anchor)
          } else {
            j--
          }
        }
      }
    }
  }

  /**
   * 移动节点到指定位置
   */
  const move = (vnode, container, anchor) => {
    const { el } = vnode
    hostInsert(el, container, anchor)
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
      mountChildren(vnode.children, el, anchor)
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
          processComponent(oldVNode, newVNode, container, anchor)
        }
    }
  }

  const processComponent = (oldVNode, newVNode, container, anchor) => {
    if (oldVNode == null) {
      // 挂载
      mountComponent(newVNode, container, anchor)
    }
  }

  const mountComponent = (initialVNode, container, anchor) => {
    // 生产组件实例
    initialVNode.component = createComponentInstance(initialVNode)
    const instance = initialVNode.component
    // 标准化组件实例数据
    setupComponent(instance)

    // 设置组件渲染
    setupRenderEffect(instance, initialVNode, container, anchor)
  }

  const setupRenderEffect = (instance, initialVNode, container, anchor) => {
    // 组件挂载和更新方法
    const componentUpdateFn = () => {
      // 当前处于mounted之前，初次加载
      if (!instance.isMounted) {
        // 拿到mount相关钩子
        const { bm, m } = instance
        // beforeMount
        if (bm) {
          bm()
        }
        // 从render中获取到要渲染的内容
        const subTree = instance.subTree = renderComponentRoot(instance)
        // patch，最终渲染到页面上
        patch(null, subTree, container, anchor)
        // mounted
        if (m) {
          m()
        }
        initialVNode.el = subTree.el
        // 标记首次渲染完成
        instance.isMounted = true
      } else {
        let { next, vnode } = instance
        if (!next) {
          next = vnode
        }
        // 获取下一次的vnode,重新执行render
        const nextTree = renderComponentRoot(instance)
        const prevTree = instance.subTree
        instance.subTree = nextTree
        // 通过patch进行更新视图
        patch(prevTree, nextTree, container, anchor)
        // 更新el
        next.el = nextTree.el
      }
    }

    const effect = instance.effect = new ReactiveEffect(componentUpdateFn, () => {
      return queuePreFlushCb(update)
    })

    const update = instance.update = () => effect.run()

    // 本质上触发的是componentUpdateFn
    update()
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

/**
 * 获取最长递增子序列下标
 * 维基百科：https://en.wikipedia.org/wiki/Longest_increasing_subsequence
 * 百度百科：https://baike.baidu.com/item/%E6%9C%80%E9%95%BF%E9%80%92%E5%A2%9E%E5%AD%90%E5%BA%8F%E5%88%97/22828111
 */
function getSequence(arr) {
  // 获取一个数组浅拷贝。注意 p 的元素改变并不会影响 arr
  // p 是一个最终的回溯数组，它会在最终的 result 回溯中被使用
  // 它会在每次 result 发生变化时，记录 result 更新前最后一个索引的值
  const p = arr.slice()
  // 定义返回值（最长递增子序列下标），因为下标从 0 开始，所以它的初始值为 0
  const result = [0]
  let i, j, u, v, c
  // 当前数组的长度
  const len = arr.length
  // 对数组中所有的元素进行 for 循环处理，i = 下标
  for (i = 0; i < len; i++) {
    // 根据下标获取当前对应元素
    const arrI = arr[i]
    //
    if (arrI !== 0) {
      // 获取 result 中的最后一个元素，即：当前 result 中保存的最大值的下标
      j = result[result.length - 1]
      // arr[j] = 当前 result 中所保存的最大值
      // arrI = 当前值
      // 如果 arr[j] < arrI 。那么就证明，当前存在更大的序列，那么该下标就需要被放入到 result 的最后位置
      if (arr[j] < arrI) {
        p[i] = j
        // 把当前的下标 i 放入到 result 的最后位置
        result.push(i)
        continue
      }
      // 不满足 arr[j] < arrI 的条件，就证明目前 result 中的最后位置保存着更大的数值的下标。
      // 但是这个下标并不一定是一个递增的序列，比如： [1, 3] 和 [1, 2]
      // 所以我们还需要确定当前的序列是递增的。
      // 计算方式就是通过：二分查找来进行的

      // 初始下标
      u = 0
      // 最终下标
      v = result.length - 1
      // 只有初始下标 < 最终下标时才需要计算
      while (u < v) {
        // (u + v) 转化为 32 位 2 进制，右移 1 位 === 取中间位置（向下取整）例如：8 >> 1 = 4;  9 >> 1 = 4; 5 >> 1 = 2
        // https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/Right_shift
        // c 表示中间位。即：初始下标 + 最终下标 / 2 （向下取整）
        c = (u + v) >> 1
        // 从 result 中根据 c（中间位），取出中间位的下标。
        // 然后利用中间位的下标，从 arr 中取出对应的值。
        // 即：arr[result[c]] = result 中间位的值
        // 如果：result 中间位的值 < arrI，则 u（初始下标）= 中间位 + 1。即：从中间向右移动一位，作为初始下标。 （下次直接从中间开始，往后计算即可）
        if (arr[result[c]] < arrI) {
          u = c + 1
        } else {
          // 否则，则 v（最终下标） = 中间位。即：下次直接从 0 开始，计算到中间位置 即可。
          v = c
        }
      }
      // 最终，经过 while 的二分运算可以计算出：目标下标位 u
      // 利用 u 从 result 中获取下标，然后拿到 arr 中对应的值：arr[result[u]]
      // 如果：arr[result[u]] > arrI 的，则证明当前  result 中存在的下标 《不是》 递增序列，则需要进行替换
      if (arrI < arr[result[u]]) {
        if (u > 0) {
          p[i] = result[u - 1]
        }
        // 进行替换，替换为递增序列
        result[u] = i
      }
    }
  }
  // 重新定义 u。此时：u = result 的长度
  u = result.length
  // 重新定义 v。此时 v = result 的最后一个元素
  v = result[u - 1]
  // 自后向前处理 result，利用 p 中所保存的索引值，进行最后的一次回溯
  while (u-- > 0) {
    result[u] = v
    v = p[v]
  }
  return result
}


