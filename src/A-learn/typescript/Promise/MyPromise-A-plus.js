;(function (root, factory) {
  if (typeof module === 'object' && typeof module.exports === 'object') {
    console.log('是commonjs模块规范，nodejs环境')
    module.exports = factory()
  } else if (typeof define === 'function' && define.amd) {
    // 如果环境中有define函数，并且define函数具备amd属性，则可以判断当前环境满足AMD规范
    console.log('是AMD模块规范，如require.js')
    define(factory)
  } else {
    console.log('没有模块环境，直接挂载在全局对象上')
    root.MyPromise = factory()
  }
})(this, function () {
  const PENDING = 'PENDING'
  const FULFILLED = 'FULFILLED'
  const REJECTED = 'REJECTED'

  /* 微任务中将运行的代码 */
  const runMicroTask = (task) => {
    if (typeof process !== 'undefined' && typeof process.nextTick === 'function') {
      process.nextTick(task)
    } else if (typeof window === 'object' && typeof MutationObserver === 'function') {
      const observer = new MutationObserver(task)
      const textNode = document.createTextNode('1')
      observer.observe(textNode, {
        characterData: true,
      })
      textNode.textContent = '2'
    } else if (typeof queueMicrotask === 'function') {
      queueMicrotask(task)
    } else {
      setTimeout(task, 0)
    }
  }

  /**
   * 检测 Promise 对象
   */
  const isMyPromise = (x) => {
    return typeof x === 'object' && x !== null && x instanceof MyPromise
  }

  /**
   * MDN https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Promise
   * Promise/A+ spec https://promisesaplus.com.cn/
   * ES6 的 Promsie 和 Promise A+ 规范不一样，一个是官方标准，一个是社区规范它们都是 thenable 对象
   */
  class MyPromise {
    constructor(executor) {
      // 初始状态为 PENDING
      this.status = PENDING
      //初始值为 undefined
      this.value = undefined
      // 存放 then 注册的回调函数
      this.queueTasks = []

      const resolve = (value) => {
        this.#runQueueTask(FULFILLED, value)
      }

      const reject = (reason) => {
        this.#runQueueTask(REJECTED, reason)
      }

      try {
        executor(resolve, reject)
      } catch (error) {
        reject(error)
      }
    }

    /**
     * 用私有函数实现
     * 状态敲定，清空任务队列
     */
    #runQueueTask(status, value) {
      if (this.status === PENDING) {
        this.status = status
        this.value = value
        while (this.queueTasks.length) {
          const { resolveTask, rejectTask } = this.queueTasks.shift()
          if (this.status === FULFILLED) {
            resolveTask()
          }
          if (this.status === REJECTED) {
            rejectTask()
          }
        }
      }
    }

    /**
     * 用私有函数实现
     * 2.3 Promise 解决过程
     */
    #promiseResolutionProcedure(promise, x, resolve, reject) {
      // 2.3.1 如果promise和x引用同一个对象，则以TypeError为原因拒绝promise。
      if (promise === x) {
        const e = new TypeError('Chaining cycle detected for promise <Promise>')
        // throw e
        return reject(e)
      }

      let called = undefined
      // console.log('promiseResolutionProcedure -> ', promise, x, called)
      // 2.3.2 如果x是一个promise，采用其状态 -> 此处与 2.3.3 合并
      // 2.3.3 否则，如果x是一个对象或函数：
      if (isMyPromise(x) || (typeof x === 'object' && x !== null) || typeof x === 'function') {
        try {
          const then = x.then
          // 2.3.3.3 如果then是一个函数，则以x作为this，第一个参数为resolvePromise，第二个参数为rejectPromise调用它
          if (typeof then === 'function') {
            then.call(
              x,
              (y) => {
                if (called) return
                called = true
                // 递归解析的过程（因为可能 promise 中还有 promise）直到是普通值为止
                this.#promiseResolutionProcedure(promise, y, resolve, reject)
              },
              (r) => {
                if (called) return
                called = true
                reject(r)
              },
            )
          } else {
            resolve(x)
          }
        } catch (e) {
          if (called) return
          called = true
          // throw e
          reject(e)
        }
      } else {
        // 2.3.4 如果x不是对象或函数，则用x来实现promise
        resolve(x)
      }
    }

    /**
     * then方法可以在同一个promise上多次调用。
     * 2.2.1 onFulfilled和onRejected都是可选参数：
     *    2.2.1.1如果onFulfilled不是一个函数，它必须被忽略。
     *    2.2.1.2如果onRejected不是一个函数，它必须被忽略。
     * 2.2.4 onFulfilled或onRejected不能在执行上下文堆栈中只包含平台代码之前调用。
     * 2.2.5 onFulfilled和onRejected必须作为函数被调用（即没有this值）。
     */
    then(onFulfilled, onRejected) {
      /**
       * 2.2.7 then方法必须返回一个promise
       */
      const promise2 = new MyPromise((resolve, reject) => {
        const resolveTask = () => {
          runMicroTask(() => {
            if (typeof onFulfilled === 'function') {
              try {
                /**
                 * 2.2.7.1 如果onFulfilled或onRejected返回一个值x，则运行Promise Resolution Procedure [[Resolve]](promise2, x)。
                 */
                const x = onFulfilled(this.value)
                this.#promiseResolutionProcedure(promise2, x, resolve, reject)
              } catch (e) {
                /**
                 * 2.2.7.2 如果onFulfilled或onRejected抛出异常e，则promise2必须以e作为原因被拒绝。
                 */
                // throw e
                reject(e)
              }
            } else {
              /**
               * 2.2.7.3 如果onFulfilled不是一个函数且promise1被实现，则promise2必须以与promise1相同的值被实现。
               */
              resolve(this.value)
            }
          })
        }

        const rejectTask = () => {
          runMicroTask(() => {
            if (typeof onRejected === 'function') {
              try {
                /**
                 * 2.2.7.1 如果onFulfilled或onRejected返回一个值x，则运行Promise Resolution Procedure [[Resolve]](promise2, x)。
                 */
                const x = onRejected(this.value)
                this.#promiseResolutionProcedure(promise2, x, resolve, reject)
              } catch (e) {
                /**
                 * 2.2.7.2 如果onFulfilled或onRejected抛出异常e，则promise2必须以e作为原因被拒绝。
                 */
                // throw e
                reject(e)
              }
            } else {
              /**
               * 2.2.7.4 如果onRejected不是一个函数且promise1被拒绝，则promise2必须以与promise1相同的原因被拒绝。
               */
              reject(this.value)
            }
          })
        }

        if (this.status === FULFILLED) {
          resolveTask()
        }

        if (this.status === REJECTED) {
          rejectTask()
        }

        if (this.status === PENDING) {
          this.queueTasks.push({
            resolveTask,
            rejectTask,
          })
        }
      })

      return promise2
    }

    catch(onRejected) {
      return this.then(undefined, onRejected)
    }

    /**
     * 立即返回一个新的 Promise。
     * 无论当前 promise 的状态如何，此新的 promise 在返回时始终处于待定（pending）状态。
     * 如果 onFinally 抛出错误或返回被拒绝的 promise，则新的 promise 将使用该值进行拒绝。
     * 否则，新的 promise 将以与当前 promise 相同的状态敲定（settled）。
     * 如果 onFinally 不是函数，则调用 then() 时使用 onFinally 同时作为两个参数
     */
    finally(onFinally) {
      // this.then 执行的时候 如果 onFinally 执行报错会被捕获，所以无需处理
      // if (typeof onFinally !== 'function') {
      //   return this.then(onFinally, onFinally)
      // }

      return this.then(
        (value) => {
          return MyPromise.resolve(onFinally()).then(() => value)
        },
        (reason) => {
          return MyPromise.resolve(onFinally()).then(() => {
            throw reason
          })
        },
      )
    }
  }

  /**
   * 实现 ES 规范的 Promise.resolve
   */
  MyPromise.resolve = function (value) {
    if (isMyPromise(value)) {
      return value
    }
    if (typeof value === 'object' && value !== null) {
      const then = value.then
      if (then === 'function') {
        return new MyPromise((resolve, reject) => {
          then.call(value, resolve, reject)
        })
      }
    }
    return new MyPromise((resolve) => resolve(value))
  }

  /**
   * 实现 ES 规范的 Promise.reject
   */
  MyPromise.reject = function (reason) {
    return new MyPromise((resolve, reject) => reject(reason))
  }

  /**
   * 测试是否符合 Promise/A+ 规范
   * Promise/A+ spec https://promisesaplus.com.cn/
   * promises-aplus-tests https://github.com/promises-aplus/promises-tests
   */
  MyPromise.deferred = function () {
    const defer = {}
    defer.promise = new MyPromise((resolve, reject) => {
      defer.resolve = resolve
      defer.reject = reject
    })
    return defer
  }

  return MyPromise
})