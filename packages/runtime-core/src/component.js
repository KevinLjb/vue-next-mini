let uid = 0
export function createComponentInstance(vnode) {
  const type = vnode.type

  const instance = {
    uid: uid++,
    vnode,
    type,
    subTree: null, // render返回值
    effect: null, // ReactiveEffect
    update: null, // update函数，触发effect.run
    render: null // 组件内的render函数
  }

  return instance
}

/**
 * 规范化组件实例数据
 */
export function setupComponent(instance) {
  // 为render赋值
  const setupResult = setupStateFulComponent(instance)
  return setupResult
}

function setupStateFulComponent(instance) {
  finishComponentSetup(instance)
}

function finishComponentSetup(instance) {
  // h函数的第一个参数就是type。h(Component)
  const Component = instance.type
  instance.render = Component.render
}
