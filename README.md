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
│   ├── pages
│   │   └── index
│   │       ├── index.js
│   │       ├── index.json
│   │       ├── index.less
│   │       └── index.wxml
│   ├── project.config.json
│   ├── sitemap.json
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
yarn start

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
  iii. 在创建页面和组件时,使用关键字use来加载使用到的store中的数据
  iv. 在页面和组件中,通过this.store.update方法来更新store中的数据,且该数据会实时通过到页面中
```

``` js
const { createPage } = getApp()
createPage({
  data: {
    test: ''
  },
  use: ['isLogin', 'userInfo'],
  onLoad() {
    console.log(this.data)
  },
  handleChangeToken() {
    this.store.update({
      token: Math.random().toString(36).substr(2),
      userInfo: {
        id: 1,
        username: 'user name'
      }
    })
    console.log(this.data)
  }
})
```

```wxml
<view class="page home">
  <button bind:tap="handleChangeToken">改变token</button>
  <view><text>{{ token }}</text></view>
</view>
```

注意：

  1. 如果要使用store, 必须使用createPage方法创建页面, 和Page的参数不变
  2. 使用use来获取store里面的数据
  3. 使用store.update或store.$set方法来更新store中的数据

## 3. gulp和webpack

```bash
* 需先运行命令`yarn start`
  1. 项目使用gulp来打包less文件, 并生成对应的wxss文件。
  2. 除了styles目录下的所有less文件,其余在pages和components目录下的所有文件都会被打包。
  3. 打包规则(配置见build/gulp.config.js, build/webpack.config.js)
    i: 对于不同的less, js, wxml, json文件, 都由相应的task来处理
    ii: 每次新增组件或页面时, 需重新运行打包命令
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
