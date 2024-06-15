import { isObject, isArray } from "../../shared/src/index.js"
import { createVNode, isVNode } from "./vnode.js"

export function h(type, propsOrChildren, children) {
  const l = arguments.length
  if (l === 2) {
    // 如果 第二个参数是对象，但不是数组。则第二个参数只有两种可能性：1. VNode 2.普通的 props
    if (isObject(propsOrChildren) && !isArray(propsOrChildren)) {
      // 如果是 VNode，则 第二个参数代表了 children
      if (isVNode(propsOrChildren)) {
        return createVNode(type, null, [propsOrChildren])
      }
      // 如果不是 VNode， 则第二个参数代表了 props
      return createVNode(type, propsOrChildren)
    } else {
      // 如果第二个参数不是单纯的 object，则 第二个参数代表了 props
      return createVNode(type, null, propsOrChildren)
    }
  } else {
    // 如果参数在三个以上，则从第二个参数开始，把后续所有参数都作为 children
    if (l > 3) {
      children = Array.prototype.slice.call(arguments, 2)
      // 如果传递的参数只有三个，则 children 是单纯的 children
    } else if (l === 3 && isVNode(children)) {
      children = [children]
    }
    return createVNode(type, propsOrChildren, children)
  }
}
