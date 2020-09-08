const { createPage } = getApp()

createPage({
  use: ['userInfo', 'token'],
  onLoad() {
    console.log(this.data)
    console.log('page onload')
  }
})
