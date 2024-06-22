import { patchClass } from "./modules/class.js"
import { isOn } from "../../shared/src/index.js"
import { patchDOMProp } from "./modules/props.js"
import { patchAttr } from "./modules/attrs.js"
import { patchStyle } from "./modules/style.js"

export const patchProp = (el, key, prevValue, nextValue) => {
  if (key === 'class') {
    patchClass(el, nextValue)
  } else if (key === 'style') {
    patchStyle(el, prevValue, nextValue)
  } else if (isOn(key)) {

  } else if (shouldSetAsProp(el, key)) {
    patchDOMProp(el, key, nextValue)
  } else {
    patchAttr(el, key, nextValue)
  }
}

function shouldSetAsProp(el, key) {
  // 表单属性是只读的
  if (key === 'form') {
    return false
  }
  // <input list>必须通过setAttribute设置
  if (key === 'list' && el.tagName === 'INPUT') {
    return false
  }
  // textarea的type必须通过setAttribute
  if (key === 'type' && el.tagName === 'TEXTAREA') {
    return false
  }
  // 只要key是el的属性
  return key in el
}
