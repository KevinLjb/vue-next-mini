import { track, trigger } from "./effect.js"

const get = createGetter()

function createGetter() {
  return function get(target, key, receiver) {
    const result = Reflect.get(target, key, receiver)
    // 收集依赖
    track(target, key)
    return result
  }
}

const set = createSetter()

function createSetter() {
  return function set(target, key, value, receiver) {
    const result = Reflect.set(target, key, value, receiver)
    // 触发依赖
    trigger(target, key, value)
    return result
  }
}

export const mutableHandlers = {
  get,
  set
}
