import Vue from "../reactivity/src/index.js"
import { watch } from "../runtime-core/src/apiWatch.js"
import { h } from '../runtime-core/src/h.js'
import { render } from "../runtime-dom/src/index.js"

const { effect, reactive, ref, computed, Text, Comment, Fragment } = Vue

const vnode = h(Fragment, 'hello world')
// 挂载
render(vnode, document.querySelector('#app'))

setTimeout(() => {
  const vnode2 = h(Fragment, '你好，世界')
  // 挂载
  render(vnode2, document.querySelector('#app'))
}, 2000)
