App({
  onLaunch() {
    console.log('app launch')
    class Animal {
      constructor(name) {
        this.name = name
      }

      eat() {
        console.log(this.name, 'eating')
      }
    }

    console.log(new Animal('fejkru'))
  }
})