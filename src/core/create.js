import store from '../store/index'
import { autorun, reaction, toJS } from 'mobx'

const instances = {}
const using = new Proxy([], {
  get(target, key, receiver) {
    return Reflect.get(target, key, receiver)
  },
  set(target, key, value, receiver) {
    if (target.includes(value)) {
      return true
    }

    reaction(() => store[value], data => {
      const result = toJS(data)
      // update page state
      getCurrentPages().forEach(page => {
        if (page.watch) {
          for (const key in page.watch) {
            if (key == value) {
              const fn = page.watch[key]

              fn.call(page, result, page.data[key])
              break
            }
          }
        }
        if (Array.isArray(page.use) && page.use.includes(value)) {
          page.setData({ [value]: result })
        }
      })

      // update component state
      for (const key in instances) {
        instances[key].forEach(ins => {
          if (Array.isArray(ins.use) && ins.use.includes(value)) {
            ins.setData({ [value]: result })
          }
        })
      }
    }, { delay: 100 })

    return Reflect.set(target, key, value, receiver)
  }
})

export const createPage = (options = {}) => {
  const onLoad = options.onLoad
  options.onLoad = function(e) {
    const disposer = autorun(() => {
      options.use && options.use.forEach(key => {
        using.push(key)
        this.setData({
          [key]: toJS(store[key])
        })
      })
    })

    disposer()

    onLoad && onLoad.call(this, e)
  }

  Page({ ...options, store })
}

export const createComponent = (options = {}) => {
  options.lifetimes = options.lifetimes || {}
  const ready = options.lifetimes.ready || options.ready
  const created = options.lifetimes.created || options.created
  const detached = options.lifetimes.detached || options.detached

  options.lifetimes.created = options.created = function(e) {
    this.store = store
    this.use = options.use
    created && created.call(this, e)
  }

  options.lifetimes.ready = options.ready = function(e) {
    const disposer = autorun(() => {
      options.use && options.use.forEach(key => {
        using.push(key)
        this.setData({
          [key]: toJS(store[key])
        })
      })
    })

    disposer()

    if (!instances[this.is]) {
      instances[this.is] = []
    }

    instances[this.is].push(this)

    ready && ready.call(this, e)
  }

  options.lifetimes.detached = options.detached = function(e) {
    if (instances[this.is]) {
      instances[this.is] = instances[this.is].filter(ins => ins !== this)
    }

    detached && detached.call(this, e)
  }

  Component(options)
}
