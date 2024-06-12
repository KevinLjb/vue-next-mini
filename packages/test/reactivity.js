import Vue from "../reactivity/src/index.js"

const { effect, reactive, ref } = Vue

const state = ref({
  name: 'Kevin'
})

const obj = ref('Kevin')

effect(() => {
  // document.getElementById('app').innerText = state.value.name
  document.getElementById('app').innerText = obj.value
})

setTimeout(() => {
  // state.value.name = 'King'
  obj.value = 'King2'
}, 1000)
