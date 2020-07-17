const wxapi = (name, params) => {
  let methods = wx[name]
  if (name.includes('.')) {
    methods = name.split('.').reduce((a, b) => a[b], wx)
  }
  if (methods) {
    return new Promise((resolve, reject) => {
      methods({
        ...params,
        success: data => resolve(data),
        fail: e => reject(e)
      })
    })
  } else {
    return Promise.reject(new Error(`wx.${name}方法不存在`))
  }
}

export default wxapi
