import { toReactive } from "./reactive.js"
import { trackRefValue, triggerRefValue } from "./effect.js"
import { hasChanged } from "../../shared/src/index.js"

export function ref(value) {
  return createRef(value, false)
}

function createRef(rawValue, shallow) {
  if (isRef(rawValue)) {
    return rawValue
  }
  return new RefImpl(rawValue, shallow)
}

// 判断是否是一个ref
function isRef(r) {
  // !!是将结果强制转换为boolean
  return !!(r && r.__v_isRef === true)
}

class RefImpl {
  dep = null
  constructor(value, __v_isShallow) {
    // 原始数据
    this._rawValue = value
    this._value = __v_isShallow ? value : toReactive(value)
  }

  get value() {
    trackRefValue(this)
    return this._value
  }

  set value(newValue) {
    if (hasChanged(newValue, this._rawValue)) {
      this._rawValue = newValue
      this._value = toReactive(newValue)
      triggerRefValue(this)
    }
  }
}



