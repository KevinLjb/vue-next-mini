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
  },
  // 组件被挂载之后
  mounted() {
    console.log('this', this)
    setTimeout(() => {
      this.msg = 'hello world'
    }, 2000)
  },
}

const vnode = h(component)
// 挂载
render(vnode, document.querySelector('#app'))
