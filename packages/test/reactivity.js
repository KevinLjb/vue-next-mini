import Vue from "../reactivity/src/index.js"
import { watch } from "../runtime-core/src/apiWatch.js"
import { h } from '../runtime-core/src/h.js'
import { render } from "../runtime-dom/src/index.js"

const { effect, reactive, ref, computed, Text } = Vue

const vnode = h(Text, 'hello world')
// 挂载
render(vnode, document.querySelector('#app'))

// 延迟两秒，生成新的 vnode，进行更新操作
setTimeout(() => {
  const vnode2 = h(Text, '你好，世界')
  render(vnode2, document.querySelector('#app'))
}, 2000);
