# 小程序开发框架

## 特点

1. 使用原生语法开发小程序(不依赖于第三方如 mpvue, wepy 等)
2. 使用 Mobx 作为状态管理, Mobx 文档地址: <https://cn.mobx.js.org/>
3. 使用 less 作为 CSS 预处理语言并通过 gulp 打包成 wxss 文件
4. 使用 npm 模块
5. 引入 eslint, 保证代码的一致性和避免错误
6. 使用 Promise 封装了 wx api(如 wxapi('login').then(({ code }) => code))
7. 使用 Promise 封装了 wx.request, 可方便使用 get, post, put, delete 方法(类似 axios)

## 目录结构

```code
.
├── package.json
├── README.md
├── scripts
│   ├── createPage.js
│   ├── gulp.config.js
│   ├── utils.js
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

```bash
# 安装依赖
yarn install

# 打包项目文件
yarn run start

注意: 选择dist目录为小程序所在路径
```

## 2. Mobx 状态管理

直接上代码吧

1. 定义 store(参考 src/store/index.js)

```js
import { observable, computed, action } from "mobx";

class Store {
  @observable token = "";

  @observable userInfo = null;

  @computed get isLogin() {
    return !!(this.userInfo && this.userInfo.id);
  }

  @action.bound update(data) {
    for (let key in data) {
      this[key] = data[key];
    }
  }

  @action.bound $set(key, attr, value) {
    const data = this[key];
    if (data) {
      data[attr] = value;
      if (Array.isArray(data)) {
        this[key] = [...data];
      } else {
        this[key] = { ...data };
      }
    }
  }
}

export default new Store();
```

1. 在页面和组件中使用 store

```code
  i. 在使用之前,需要通过createPage和createComponent创建页面/组件
  ii. create实现了绑定store到页面和组件中以及初始化默认数据, 并实时更新页面/组件中使用到的store中的数据
  iii. 在创建页面和组件时,使用关键字`use`来加载使用到的store中的数据
  iv. 在页面和组件中,通过this.store.update方法来更新store中的数据,且该数据会实时更新数据到页面中
```

在 store 中定义以下数据:

```js
import { observable, computed, action } from "mobx";
import Wallet from "./wallet";

class Store {
  @observable token = "";

  @observable userInfo = null;

  @observable wallet = new Wallet();

  @computed get isLogin() {
    return !!(this.userInfo && this.userInfo.id);
  }

  @action.bound update(data) {
    for (const key in data) {
      this[key] = data[key];
    }
  }

  @action.bound $set(key, attr, value) {
    const data = this[key];
    if (data) {
      data[attr] = value;
      if (Array.isArray(data)) {
        this[key] = [...data];
      } else {
        this[key] = { ...data };
      }
    }
  }
}

export default new Store();
```

其中 wallet 为模块, `update`和`$set`为更新 store 中数据的方法，在页面/组件中通过`this.store.update`和`this.store.$set`调用。

在 wxml 中，定义两个更新按钮以便更新 store 中的数据：

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

在 js 中文件中，通过`createPage`方法创建页面(`createComponent`方法来创建组件)，以及通过关键字`use`来使用 store 中的数据：

```js
const { createPage } = getApp();

createPage({
  use: ["isLogin", "userInfo", "token", "wallet"],
  onLoad() {
    console.log("page onload");
    console.log(this.data);
  },
  handleChangeToken() {
    this.store.update({
      userInfo: { id: 1, username: "vegan.qian" },
      token: Math.random().toString(36).substr(2),
    });

    console.log(this.data);
  },
  handleChangeBalance() {
    this.store.$set("wallet", "balance", Math.ceil(Math.random() * 1000));

    console.log(this.data);
  },
});
```

再次注意：

1. 如果要使用 store, 必须使用 createPage 方法创建页面, 和 Page 的参数不变
2. 使用`use`来获取 store 里面的数据
3. 使用`store.update`或`store.$set`方法来更新 store 中的数据

## 3. gulp

```bash
* 需先运行命令`yarn run install`&`yarn start`
  1. 项目使用gulp来打包less文件, 并生成对应的wxss文件。
  2. 除了styles目录下的所有less文件,其余在pages和components目录下的所有文件都会被打包。
  3. 打包规则(配置见build/gulp.config.js)
    i: 对于不同的less, js, wxml, json文件, 都由相应的task来处理
```

## 4. 构建 npm

项目中使用 npm 模块, 在运行 start 命令后, 将自动安装 dependencies 中的依赖并保存到`dist`目录中, 然后只需要在微信开发者工具中点击`构建npm`即可

注意: npm 模块只会安装 dependencies 中的依赖, 会自动忽略‵devDependencies‵

## 5. request

在 src/fetch/index.js 中, 封装了 wx.request 方法, 并且已经添加到了 app.js 中。
使用方法(fetch 中 get, post, put, delete 参数格式都是一致的, 如 get 方法)：

```js
const { fetch } = getApp();
fetch
  .get((url: String), (formData: Object), (config: Object))
  .then((result) => {
    xxx;
  })
  .catch((e) => {
    xxx;
  });
```

config 中默认参数:

1. `_quiet`: 是否在请求返回错误时不显示错误通知, 默认 false 即默认通知
2. `_mask`: loading 动画是否显示遮罩，默认为 false 即不显示遮罩

## 6. 快速创建页面和组件

因为项目中使用了 less 作为 CSS 预处理语言，通过小程序开发者工具创建页面和组件时极为不便，所以封装了命令以快速创建页面和组件。
在命令行中运行`yarn run page`得到如下对话框：

```code
? 创建类型:
  1) 页面
  2) 组件
  Answer: ...
```

然后根据提示输入对应的值即可，并且新增的页面将会自动添加到 app.json 的 pages 中。
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
