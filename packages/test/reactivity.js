import Vue from "../reactivity/src/index.js"
import { watch } from "../runtime-core/src/apiWatch.js"

const { effect, reactive, ref, computed } = Vue

const state = reactive({
  name: 'Kevin'
})

watch(state, (newValue, oldValue) => {
  console.log('watch触发', newValue, oldValue)
}, {
  immediate: true
})

setTimeout(() => {
  // state.value.name = 'King'
  state.name = 'King'
}, 1000)
