
export const isObject = obj => {
  return obj !== null && typeof obj === 'object'
}

// 判断两个值是否相同
export const hasChanged = (newValue, oldValue) => {
  return !Object.is(newValue, oldValue)
}

export const isFunction = val => {
  return typeof val === 'function'
}

export const isString = val => typeof val === 'string'

export const isArray = Array.isArray

export const extend = Object.assign
