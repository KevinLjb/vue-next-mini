import Vue from "../reactivity/src/index.js"
import { watch } from "../runtime-core/src/apiWatch.js"
import { h } from '../runtime-core/src/h.js'
import { render } from "../runtime-dom/src/index.js"

const { effect, reactive, ref, computed, Text, Comment, Fragment } = Vue

const component = {
  data() {
    return {
      msg: 'hello component'
    }
  },
  render() {
    return h('div', this.msg)
  }
}

const vnode = h(component)
// 挂载
render(vnode, document.querySelector('#app'))
