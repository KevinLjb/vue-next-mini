import { isObject } from "../../shared/src/index.js"
import { reactive } from '../../reactivity/src/reactive.js'

export const LifecycleHooks = {
  BEFORE_CREATE: 'bc',
  CREATED: 'c',
  BEFORE_MOUNT: 'bm',
  MOUNTED: 'm'
}

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
    render: null, // 组件内的render函数
    isMounted: false,
    bc: null,
    c: null,
    bm: null,
    m: null
  }

  return instance
}

/**
 * 注册hook
 */
export function injectHook(type, hook, target) {
  if (target) {
    target[type] = hook
  }
}

/**
 * 规范化组件实例数据
 */
export function setupComponent(instance) {
  // 为render赋值
  const setupResult = setupStateFulComponent(instance)
  return setupResult
}

export const createHook = lifecycle => {
  return (hook, target) => injectHook(lifecycle, hook, target)
}

export const onBeforeMount = createHook(LifecycleHooks.BEFORE_MOUNT)

export const onMounted = createHook(LifecycleHooks.MOUNTED)

function setupStateFulComponent(instance) {
  finishComponentSetup(instance)
}

function finishComponentSetup(instance) {
  // h函数的第一个参数就是type。h(Component)
  const Component = instance.type
  instance.render = Component.render

  applyOptions(instance)
}

function applyOptions(instance) {
  const {
    data: dataOptions,
    beforeCreate,
    created,
    beforeMount,
    mounted
  } = instance.type

  if (beforeCreate) {
    callHook(beforeCreate, instance.data)
  }

  // 存在data选项
  if (dataOptions) {
    // 获取到data
    const data = dataOptions()
    if (isObject(data)) {
      // 变成响应式对象
      instance.data = reactive(data)
    }
  }

  if (created) {
    callHook(created, instance.data)
  }

  function registerLifecycleHook(register, hook) {
    if (hook) {
      register(hook.bind(instance.data), instance)
    }
  }

  // 将mounted事件注册
  registerLifecycleHook(onBeforeMount, beforeMount)
  registerLifecycleHook(onMounted, mounted)
}

function callHook(hook, proxy) {
  hook.bind(proxy)()
}
