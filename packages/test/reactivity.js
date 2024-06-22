import Vue from "../reactivity/src/index.js"
import { watch } from "../runtime-core/src/apiWatch.js"
import { h } from '../runtime-core/src/h.js'
import { render } from "../runtime-dom/src/index.js"

const { effect, reactive, ref, computed } = Vue
const vnode = h('div', {
  style: {
    color: 'red'
  },
}, 'Hello, World')
// 挂载
render(vnode, document.querySelector('#app'))

setTimeout(() => {
  const vnode2 = h('div', {
    style: {
      fontSize: '32px'
    },
  }, 'Hello, World')
  // 挂载
  render(vnode2, document.querySelector('#app'))
}, 2000);

//
// const a = () => {
//   return new Promise(resolve => {
//     resolve(1)
//   }).then(res => {
//     resolve(22)
//     console.log(res, 'res')
//     return Promise.resolve()
//   }).then(res => {
//     console.log(res, 333)
//   })
// }
//
// const b = a()
// b.then(res => {
//   console.log('b', res)
// })
