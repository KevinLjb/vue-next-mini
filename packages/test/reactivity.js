import Vue from "../reactivity/src/index.js"
import { watch } from "../runtime-core/src/apiWatch.js"
import { h } from '../runtime-core/src/h.js'
import { render } from "../runtime-dom/src/index.js"

const { effect, reactive, ref, computed } = Vue

const vnode = h('div', {
  class: 'test'
}, 'hello render')


render(vnode, document.querySelector('#app'))

// 延迟两秒，生成新的 vnode，进行更新操作
setTimeout(() => {
  const vnode2 = h('h1', {
    class: 'active'
  }, 'update')
  render(null, document.querySelector('#app'))
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
