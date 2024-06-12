import { mutableHandlers } from './baseHandlers.js'
import { isObject } from '../../shared/src/index.js'

// 存储代理对象的集合
const reactiveMap = new WeakMap()

// 创建代理对象
export function reactive(target) {
  return createReactiveObject(target, mutableHandlers, reactiveMap)
}

/**
 * 创建代理对象
 * @param target 目标对象
 * @param baseHandlers 代理处理逻辑
 * @param proxyMap 代理对象map
 * @returns {*}
 */
function createReactiveObject(target, baseHandlers, proxyMap) {
  const existingProxy = proxyMap.get(target)
  if (existingProxy) {
    return existingProxy
  }
  const proxy = new Proxy(target, baseHandlers)
  proxyMap.set(target, proxy)
  return proxy
}

export function toReactive(value) {
  return isObject(value) ? reactive(value) : value
}
