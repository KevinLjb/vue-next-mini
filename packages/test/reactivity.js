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
  // 组件初始化完成之后
  beforeCreate() {
    alert('beforeCreate')
  },
  // 组件实例处理完所有与状态相关的选项之后
  created() {
    alert('created')
  },
  // 组件被挂载之前
  beforeMount() {
    alert('beforeMount')
  },
  // 组件被挂载之后
  mounted() {
    alert('mounted')
  },
}

const vnode = h(component)
// 挂载
render(vnode, document.querySelector('#app'))
