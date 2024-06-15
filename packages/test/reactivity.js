import Vue from "../reactivity/src/index.js"
import { watch } from "../runtime-core/src/apiWatch.js"
import { h } from '../runtime-core/src/h.js'

const { effect, reactive, ref, computed } = Vue

const vnode = h('div', {
  class: 'test'
}, [
  h('p', 'p1'),
  h('p', 'p2'),
  h('p', 'p3')
])

console.log(vnode)
