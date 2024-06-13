// 对应promise的pending状态
let isFlushPending = false

const resolvePromise = Promise.resolve()
// 当前执行的任务
let currentFlushPromise

// 待执行的任务队列
const pendingPreFlushCbs = []

// 队列预处理函数
export function queuePreFlushCb(cb) {
  queueCb(cb, pendingPreFlushCbs)
}

function queueCb(cb, pendingQueue) {
  // 将函数放入队列中
  pendingQueue.push(cb)
  queueFlush()
}

// 依次处理队列中的函数
function queueFlush() {
  if (!isFlushPending) {
    // 开始处理
    isFlushPending = true
    currentFlushPromise = resolvePromise.then(flushJobs)
  }
}

function flushJobs() {
  isFlushPending = false
  flushPreFlushCbs()
}

// 我觉得其实就是异步执行,放到微任务里执行
export function flushPreFlushCbs() {
  if (pendingPreFlushCbs.length) {
    let activePreFlushCbs = [...new Set(pendingPreFlushCbs)]
    pendingPreFlushCbs.length = 0
    for (let i = 0; i < activePreFlushCbs.length; i++) {
      // 挨个执行
      activePreFlushCbs[i]()
    }
  }
}
