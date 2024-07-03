import Vue from "../reactivity/src/index.js"
import { watch } from "../runtime-core/src/apiWatch.js"
import { h } from '../runtime-core/src/h.js'
import { render } from "../runtime-dom/src/index.js"

const { effect, reactive, ref, computed, Text, Comment, Fragment } = Vue

const component = {
  setup() {
    const obj = reactive({
      name: '张三'
    })

    setTimeout(() => {
      obj.name = '李四'
    }, 2000);

    return () => h('div', obj.name)
  }
}

const vnode = h(component)
// 挂载
render(vnode, document.querySelector('#app'))
