const { createPage } = getApp()

createPage({
  use: ['isLogin', 'userInfo', 'token', 'wallet'],
  watch: {
    token(val, oldVal) {
      console.log('token has changed: ', val, oldVal)
    }
  },
  onLoad() {
    console.log('page onload')
    console.log(this.data)
  },
  handleChangeToken() {
    this.store.update({
      userInfo: { id: 1, username: 'vegan.qian' },
      token: Math.random().toString(36).substr(2)
    })

    console.log(this.data)
  },
  handleChangeBalance() {
    this.store.$set('wallet', 'balance', Math.ceil(Math.random() * 1000))

    console.log(this.data)
  }
})
