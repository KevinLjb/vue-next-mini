import { patchClass } from "./modules/class.js"
import { isOn } from "../../shared/src/index.js"

export const patchProp = (el, key, prevValue, nextValue) => {
  if (key === 'class') {
    patchClass(el, nextValue)
  } else if (key === 'style') {

  } else if (isOn(key)) {

  } else {

  }
}
