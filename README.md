# 小程序开发框架

## 特点

  1. 使用原生语法开发小程序(不依赖于第三方如mpvue, wepy等)
  2. 使用Mobx作为状态管理, Mobx文档地址: <https://cn.mobx.js.org/>
  3. 使用less作为CSS预处理语言并通过gulp打包成wxss文件
  4. 使用webpack打包JS文件
  5. 引入eslint, 保证代码的一致性和避免错误
  6. 使用Promise封装了wx api(如wxapi('login').then(({ code }) => code))
  7. 使用Promise封装了wx.request, 可方便使用get, post, put, delete方法(类似axios)

## 目录结构

```code
.
├── package.json
├── README.md
├── scripts
│   ├── createPage.js
│   ├── gulp.config.js
│   ├── utils.js
│   └── webpack.config.js
├── src
│   ├── app.js
│   ├── app.json
│   ├── app.less
│   ├── core
│   │   └── create.js
│   ├── fetch
│   │   └── index.js
│   ├── pages
│   │   └── index
│   ├── project.config.json
│   ├── sitemap.json
│   ├── store
│   │   └── index.js
│   ├── styles
│   │   └── var.less
│   └── utils
│       └── wxapi.js
└── yarn.lock
```

## 1. 安装和构建

``` bash
# 安装依赖
yarn install

# 打包项目文件
yarn run start

注意: 选择dist目录为小程序所在路径
```

## 2. Mobx状态管理

直接上代码吧

1. 定义store(参考src/store/index.js)

```js
import { observable, computed, action } from 'mobx'

class Store {
  @observable token = ''
  
  @observable userInfo = null

  @computed get isLogin() {
    return !!(this.userInfo && this.userInfo.id)
  }

  @action.bound update(data) {
    for (let key in data) {
      this[key] = data[key]
    }
  }

  @action.bound $set(key, attr, value) {
    const data = this[key]
    if (data) {
      data[attr] = value
      if(Array.isArray(data)) {
        this[key] = [ ...data ]
      } else {
        this[key] = { ...data }
      }
    }
  }
}

export default new Store()
```

1. 在页面和组件中使用store

```code
  i. 在使用之前,需要通过createPage和createComponent创建页面/组件
  ii. create实现了绑定store到页面和组件中以及初始化默认数据, 并实时更新页面/组件中使用到的store中的数据
  iii. 在创建页面和组件时,使用关键字`use`来加载使用到的store中的数据
  iv. 在页面和组件中,通过this.store.update方法来更新store中的数据,且该数据会实时更新数据到页面中
```

在store中定义以下数据:

```js
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
```

其中wallet为模块, `update`和`$set`为更新store中数据的方法，在页面/组件中通过`this.store.update`和`this.store.$set`调用。

在wxml中，定义两个更新按钮以便更新store中的数据：

```html
<view class="">
  <button bind:tap="handleChangeToken">更新token</button>
  <view><text>token: {{ token }}</text></view>
  <button bind:tap="handleChangeBalance">更新balance</button>
  <view><text>balance: {{ wallet.balance }}</text></view>
  <!-- to user -->
  <navigator url="/pages/user/index">to user</navigator>
</view>
```

在js中，通过`createPage`方法创建页面，以及通过关键字`use`来使用store中的数据：

``` js
const { createPage } = getApp()

createPage({
  use: ['isLogin', 'userInfo', 'token', 'wallet'],
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

```

再次注意：

  1. 如果要使用store, 必须使用createPage方法创建页面, 和Page的参数不变
  2. 使用`use`来获取store里面的数据
  3. 使用store.update或store.$set方法来更新store中的数据

## 3. gulp和webpack

```bash
* 需先运行命令`yarn start`
  1. 项目使用gulp来打包less文件, 并生成对应的wxss文件。
  2. 除了styles目录下的所有less文件,其余在pages和components目录下的所有文件都会被打包。
  3. 打包规则(配置见build/gulp.config.js, build/webpack.config.js)
    i: 对于不同的less, js, wxml, json文件, 都由相应的task来处理
    ii: 项目中引入vant组件库, 所在目录为`/components/vant/`
```

## 4. request

在src/fetch/index.js中, 封装了wx.request方法, 并且已经添加到了app.js中。
使用方法(fetch中get, post, put, delete参数格式都是一致的, 如get方法)：

```js
const { fetch } = getApp()
fetch.get(url: String, formData: Object, config: Object)
  .then(result => {
    xxx
  })
  .catch(e => {
    xxx
  })
```

config中默认参数:

  1. `_quiet`: 是否在请求返回错误时不显示错误通知, 默认false即默认通知
  2. `_mask`: loading动画是否显示遮罩，默认为false即不显示遮罩

## 快速创建页面和组件

因为项目中使用了less作为CSS预处理语言，通过小程序开发者工具创建页面和组件时极为不便，所以封装了命令以快速创建页面和组件。
在命令行中运行`yarn run page`得到如下对话框：

```code
? 创建类型:  
  1) 页面
  2) 组件
  Answer: ...
```

然后根据提示输入对应的值即可，并且新增的页面将会自动添加到app.json的pages中。
完整的创建流程如下：

```code
[vegan.qian@pc mini-program]$ yarn run page
yarn run v1.22.4
$ node scripts/createPage.js
? 创建类型:  page
? 文件夹名称:  user
? 页面名称:  (index) pages/user
? 页面名称:  index

正在创建...
Done in 4.96s.
```
