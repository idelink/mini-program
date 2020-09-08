const fs = require('fs')
const path = require('path')
const { resolve } = require('./utils')

const getEntries = () => {
  const entries = {}
  const readEntry = root => {
    fs.readdirSync(resolve(root))
      .filter(filename => filename.endsWith('.js') || fs.statSync(resolve(root, filename)).isDirectory())
      .forEach(filename => {
        const dir = filename.split('.')
        const ext = dir.pop()
        if (ext == 'js') {
          const name = path.join(root, dir.join('.')).replace(`src${path.sep}`, '')
          entries[name] = resolve(root, filename)
        } else if (fs.statSync(resolve(root, filename)).isDirectory()) {
          readEntry(path.join(root, filename))
        }
      }
      )
  }

  readEntry('src')

  return entries
}

exports.getEntries = getEntries

const webpackConfig = {
  mode: 'production',
  entry: getEntries(),
  output: {
    path: resolve('dist'),
    publicPath: '/',
    filename: '[name].js'
  },
  resolve: {
    extensions: ['.js', '.json', '.less'],
    alias: {
      '@': resolve('src')
    }
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env'],
              plugins: [
                [
                  '@babel/plugin-proposal-decorators',
                  {
                    legacy: true
                  }
                ],
                [
                  '@babel/plugin-proposal-class-properties',
                  {
                    loose: true
                  }
                ],
                '@babel/plugin-transform-runtime'
              ]
            }
          }
        ]
      }
    ]
  },
  devtool: false
}

exports.webpackConfig = webpackConfig
