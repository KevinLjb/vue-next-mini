import { createDep } from "./dep.js"

const targetMap = new WeakMap()

export function effect(fn) {
  const _effect = new ReactiveEffect(fn)
  _effect.run()
}

export let activeEffect = null

export class ReactiveEffect {
  constructor(fn) {
    this.fn = fn
  }

  run() {
    activeEffect = this
    return this.fn()
  }


}

/**
 * 收集依赖
 * @param target 目标对象
 * @param key 对象上的属性
 */
export function track(target, key) {
  if (!activeEffect) return
  let depsMap = targetMap.get(target)
  if (!depsMap) {
    depsMap = new Map()
    targetMap.set(target, depsMap)
  }
  let dep = depsMap.get(key)
  if (!dep) {
    dep = createDep()
    depsMap.set(key, dep)
  }
  trackEffects(dep)
}

// 依赖跟踪effect
export function trackEffects(dep) {
  dep.add(activeEffect)
}

/**
 * 触发依赖
 * @param target 目标对象
 * @param key 属性
 * @param newValue 属性值
 */
export function trigger(target, key, newValue) {
  const depsMap = targetMap.get(target)
  if (!depsMap) return
  const dep = depsMap.get(key)
  if (!dep) return
  triggerEffects(dep)
}

export function triggerEffects(dep) {
  const effects = Array.isArray(dep) ? dep : [...dep]
  // 依次触发依赖
  for (const effect of effects) {
    triggerEffect(effect)
  }
}

export function triggerEffect(effect) {
  effect.run()
}


// 收集ref依赖
export function trackRefValue(ref) {
  if (activeEffect) {
    if (!ref.dep) {
      ref.dep = createDep()
    }
    trackEffects(ref.dep)
  }
}

// 触发ref依赖
export function triggerRefValue(ref) {
  // 判断是否有依赖
  if (ref.dep) {
    triggerEffects(ref.dep)
  }
}
