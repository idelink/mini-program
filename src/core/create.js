import store from '@/store'
import { autorun, reaction, toJS } from 'mobx'

const using = new Proxy([], {
  get(target, key, receiver) {
    return Reflect.get(target, key, receiver)
  },
  set(target, key, value, receiver) {
    if (target.includes(value)) {
      return true
    }

    reaction(() => store[value], data => {
      // eslint-disable-next-line no-undef
      getCurrentPages().forEach(page => {
        if (Array.isArray(page.use) && page.use.includes(value)) {
          page.setData({ [value]: toJS(data) })
        }
      })
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

  options.lifetimes.created = options.created = function(e) {
    this.store = store
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
    ready && ready.call(this, e)
  }

  Component(options)
}
