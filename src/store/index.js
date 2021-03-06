import { observable, computed, action } from 'mobx'
import Wallet from './wallet'

class Store {
  @observable token = ''

  @observable userInfo = null

  @observable wallet = new Wallet()

  @computed get isLogin() {
    return !!(this.userInfo && this.userInfo.id)
  }

  @action.bound update(data) {
    for (const key in data) {
      this[key] = data[key]
    }
  }

  @action.bound $set(key, attr, value) {
    const data = this[key]
    if (data) {
      data[attr] = value
      if (Array.isArray(data)) {
        this[key] = [...data]
      } else {
        this[key] = { ...data }
      }
    }
  }
}

export default new Store()
