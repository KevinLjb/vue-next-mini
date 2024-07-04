import Vue from "../reactivity/src/index.js"
import { watch } from "../runtime-core/src/apiWatch.js"
import { h } from '../runtime-core/src/h.js'
import { render } from "../runtime-dom/src/index.js"

const { effect, reactive, ref, computed, Text, Comment, Fragment } = Vue

const vnode = h('ul', [
  h('li', {
    key: 1
  }, 'a'),
  h('li', {
    key: 2
  }, 'b'),
  h('li', {
    key: 3
  }, 'c'),
])
// 挂载
render(vnode, document.querySelector('#app'))

// 延迟两秒，生成新的 vnode，进行更新操作
setTimeout(() => {
  const vnode2 = h('ul', [
    h('li', {
      key: 1
    }, 'a'),
    h('li', {
      key: 2
    }, 'b'),
    h('li', {
      key: 3
    }, 'd')
  ])
  render(vnode2, document.querySelector('#app'))
}, 2000);
