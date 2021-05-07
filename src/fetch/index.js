import store from '../store/index'

const baseURL = 'https://www.gogoing.site/api'
// const baseURL = 'http://localhost:3010/api'

function Fetch() {
}

Fetch.prototype.request = options => {
  const { token } = store
  const { _quiet, _mask } = options
  if (token) {
    options.header = Object.assign(options.header || {}, {
      Authorization: `Bearer ${token}`
    })
  }

  return new Promise((resolve, reject) => {
    wx.showLoading({
      title: '加载中',
      mask: _mask
    })
    wx.request(Object.assign(options, {
      url: baseURL + options.url,
      success: ({ statusCode, data }) => {
        if (/^20\d$/.test(statusCode)) {
          resolve(data)
        } else {
          const { message } = data
          if (!_quiet && message) {
            wx.showToast({
              icon: 'none',
              mask: _mask,
              title: message
            })
          }
          if (statusCode == 401) {
            store.update({ token: null })
            wx.navigateTo({
              url: '/pages/user/index'
            })
          }
          reject(data)
        }
      },
      fail: e => reject(e),
      complete: () => wx.hideLoading()
    }))
  })
}

['GET', 'POST', 'PUT', 'DELETE'].forEach(method => {
  Fetch.prototype[method.toLocaleLowerCase()] = function(url, data = {}, config = {}) {
    const options = Object.assign({
      _quiet: false,
      _mask: false,
      nocache: Date.now()
    }, config)

    return this.request({
      url,
      method,
      data,
      ...options
    })
  }
})

const fetch = new Fetch()

export {
  fetch,
  baseURL
}
