import { isReactive } from "../../reactivity/src/reactive.js"
import { queuePreFlushCb } from "./scheduler.js"
import { ReactiveEffect } from "../../reactivity/src/effect.js"
import {hasChanged, isObject} from "../../shared/src/index.js"

export function watch(source, cb, options) {
  return doWatch(source, cb, options)
}

function doWatch(source, cb, { immediate, deep } = {}) {
  // getter
  let getter
  if (isReactive(source)) {
    getter = () => source
    deep = true
  } else {
    getter = () => {}
  }
  if (cb && deep) {
    const baseGetter = getter
    getter = () => traverse(baseGetter())
  }
  let oldValue = {}
  const job = () => {
    if (cb) {
      // 获得新值
      const newValue = effect.run()
      if (deep || hasChanged(newValue, oldValue)) {
        // 触发回调
        cb(newValue, oldValue)
        oldValue = newValue
      }
    }
  }
  let scheduler = () => queuePreFlushCb(job)

  const effect = new ReactiveEffect(getter, scheduler)

  if (cb) {
    if (immediate) {
      job()
    } else {
      oldValue = effect.run()
    }
  } else {
    effect.run()
  }

  return () => {
    effect.stop()
  }

}

// 这个方法其实就是递归触发对象中所有属性的getter，形成依赖收集，这样就可以在改变时触发watch了
function traverse(value) {
  if (!isObject(value)) {
    return value
  }

  for (const key in value) {
    // 触发getter，依赖收集
    traverse(value[key])
  }

  return value
}
