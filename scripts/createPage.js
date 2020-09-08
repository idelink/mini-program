const fs = require('fs')
const path = require('path')
const inquirer = require('inquirer')

const resolve = (...args) => path.resolve(__dirname, '../src', ...args)
const exist = filename => fs.existsSync(filename)
const isDirectory = filename => fs.statSync(filename).isDirectory()

const app = require(resolve('app.json'))

const questions = [
  {
    type: 'rawlist',
    name: 'module',
    message: '创建类型: ',
    default: 'page',
    choices: [
      {
        name: '页面',
        value: 'page'
      },
      {
        name: '组件',
        value: 'component'
      }
    ]
  },
  {
    type: 'input',
    name: 'folder',
    message: '文件夹名称: ',
    validate(input) {
      const done = this.async()
      const folder = input.trim()

      return folder ? done(null, true) : done('请输入文件夹名称')
    }
  },
  {
    type: 'input',
    name: 'filename',
    default: 'index',
    message: ({ module }) => `${module == 'page' ? '页面' : '组件'}名称: `,
    validate(input, { module, folder }) {
      const done = this.async()
      const folderPath = path.join(module == 'components' ? 'components' : 'pages', '/', folder.trim())
      const distDir = resolve(folderPath)
      const fileDir = resolve(folderPath, `${input.trim()}.js`)

      console.log(folderPath)

      if (exist(distDir) && isDirectory(distDir) && exist(fileDir)) {
        return done(`${folder}已经存在`)
      }

      done(null, true)
    }
  }
]

const getTempalte = (isCreatePage) => {
  const newLine = '\n'
  const space = '  '
  const newSpace = newLine + space

  return {
    json: `{${
      newSpace
    }"usingComponents": {},${
      newSpace
    }"backgroundColor": "#FFF"${
      newLine
    }}`,
    wxml: `<view class="">template</view>${newLine}`,
    less: `@import "../../styles/var";${newLine}`,
    js: isCreatePage ? `
      const { createPage } = getApp()${
        newLine + newLine
      }createPage({${
        newSpace
      }use: [],${
        newSpace
      }onLoad() {${
        newSpace + space
      }console.log('page onload')${
        newSpace
      }}${
        newLine
      }})` : `
      Component({${
        newSpace
      }properties: {},${
        newSpace
      }data: {}${
        newLine
      }})${newLine}
    `
  }
}

inquirer.prompt(questions).then(({ module, folder, filename = 'index' }) => {
  const folders = folder.trim().split('/').filter(Boolean)
  const isCreatePage = module == 'page'
  const baseDir = resolve(isCreatePage ? 'pages' : 'components')
  const distDir = resolve(baseDir, folder.trim())
  const template = getTempalte(isCreatePage)

  console.log('\n正在创建...')

  // create folders
  folders.reduce((result, folder) => {
    result.push(folder)
    const dist = path.resolve(baseDir, result.join('/'))

    if (!fs.existsSync(dist)) {
      fs.mkdirSync(dist)
    }

    return result
  }, [])

  Object.keys(template).forEach(ext => {
    const data = template[ext]
    const entry = `pages/${folder.trim()}/${filename.trim()}`

    fs.writeFileSync(path.resolve(`${distDir}/${filename.trim()}.${ext}`), data.trim())

    // update app.json
    if (isCreatePage && !app.pages.includes(entry)) {
      app.pages.push(entry)
      fs.writeFileSync(resolve('app.json'), JSON.stringify(app))
    }
  })
})
