const { createPage } = getApp()

createPage({
  use: ['isLogin', 'userInfo', 'token'],
  onLoad() {
    console.log('page onload')
    console.log(this.data)
  }
})
