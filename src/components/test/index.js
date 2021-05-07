const { createComponent } = getApp()

createComponent({
  use: ['token', 'wallet'],
  properties: {},
  data: {},
  lifetimes: {
    created() {
      console.log(this.data)
    }
  }
})
