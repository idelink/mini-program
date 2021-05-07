import { baseURL, fetch } from './fetch/index'
import { createPage, createComponent } from './core/create'

App({
  fetch,
  baseURL,
  createPage,
  createComponent,
  onLaunch() {
    const updateManager = wx.getUpdateManager()

    updateManager.onUpdateReady(() => {
      wx.showModal({
        title: '更新提示',
        content: '新版本已经准备好，是否重启小程序？',
        success({ confirm }) {
          if (confirm) {
            updateManager.applyUpdate()
          }
        }
      })
    })

    console.log('app launch')
  }
})
