/**
 * 为event事件打补丁
 * @param el
 * @param rawName
 * @param prevValue
 * @param nextValue
 */
export function patchEvent(el, rawName, prevValue, nextValue) {
  // vei: vue event invokers
  const invokes = el._vei || (el._vei = {})
  // 先尝试从缓存中获取事件
  const existingInvoker = invokes[rawName]
  // 如果新值存在，且缓存中也有值，则代表需要更新事件
  if (nextValue && existingInvoker) {
    // 更新事件
    existingInvoker.value = nextValue
  } else {
    // onClick => click
    const name = parseName(rawName)
    // 缓存中没有，则代表需要新增事件
    if (nextValue) {
      const invoker = (invokes[rawName] = createInvoker(nextValue))
      el.addEventListener(name, invoker)
    } else if (existingInvoker) {
      // 缓存有，但nextValue没有，则代表需要删除该事件
      el.removeEventListener(name, existingInvoker)
      // 删除缓存
      invokes[rawName] = undefined
    }
  }
}

/**
 * 处理事件名称，用于addEventListener
 * 例如：onClick => click
 */
function parseName(rawName) {
  return rawName.slice(2).toLowerCase()
}

/**
 * 创建一个invoker事件
 * @param initialValue
 * @returns {invoker}
 */
function createInvoker(initialValue) {
  const invoker = e => {
    invoker.value && invoker.value()
  }
  // value为真实的事件行为
  invoker.value = initialValue
  return invoker
}
