import { isFunction } from "../../shared/src/index.js"
import {ReactiveEffect, trackRefValue, triggerRefValue} from "./effect.js"

export class ComputedRefImpl {
  effect = null
  dep = null
  _value = null
  // 脏状态
  _dirty = true
  constructor(getter) {
    this.effect = new ReactiveEffect(getter, () => {
      if (!this._dirty) {
        this._dirty = true
        // 触发依赖
        triggerRefValue(this)
      }
    })
    this.effect.computed = this
  }

  get value() {
    trackRefValue(this)
    // 数据被改过脏了，重新计算
    if (this._dirty) {
      this._dirty = false
      this._value = this.effect.run()
    }
    return this._value
  }
}

export function computed(getterOrOptions) {
  let getter
  const onlyGetter = isFunction(getterOrOptions)
  if (onlyGetter) {
    getter = getterOrOptions
  }
  const cRef = new ComputedRefImpl(getter)

  return cRef
}
