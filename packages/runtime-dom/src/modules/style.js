import { isString } from "../../../shared/src/index.js"

/**
 * 为style打补丁
 * @param el 元素
 * @param prev 旧值
 * @param next 新值
 */
export function patchStyle(el, prev, next) {
  // 获得style对象
  const style = el.style
  // 判断新的样式是否为字符串
  const isCssString = isString(next)
  if (next && !isCssString) {
    // 遍历新样式
    for (const key in next) {
      setStyle(style, key, next[key])
    }
  }
  if (prev && !isString(prev)) {
    for (const key in prev) {
      // 新值中不存在原旧值属性，则代表该样式应该被删除
      if (next[key] == null) {
        setStyle(style, key, '')
      }
    }
  }
}

function setStyle(style, name, value) {
  style[name] = value
}
