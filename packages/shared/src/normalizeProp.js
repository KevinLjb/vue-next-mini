import { isArray, isObject, isString } from "./index.js"

/**
 * 格式化class类
 * @param value
 */
export function normalizeClass(value) {
  let res = ''
  if (isString(value)) {
    res = value
  } else if (isArray(value)) {
    for (let index = 0; index < value.length; index++) {
      let normalized = normalizeClass(value[index])
      if (normalized) {
        res += normalized + ' '
      }
    }
  } else if (isObject(value)) {
    for (const className in value) {
      if (value[className]) {
        res += className + ' '
      }
    }
  }
  return res.trim()
}
