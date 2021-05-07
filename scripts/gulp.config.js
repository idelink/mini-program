const fs = require('fs')
const util = require('util')
const rimraf = require('rimraf')
const gulp = require('gulp')
const less = require('gulp-less')
const postcss = require('gulp-postcss')
const cssnano = require('gulp-cssnano')
const rename = require('gulp-rename')
const watch = require('gulp-watch')
const autoprefixer = require('autoprefixer')
const child_process = require('child_process')
const exec = util.promisify(child_process.exec)
const { resolve } = require('./utils')
const packageJSON = require('../package.json')

const config = {
  src: {
    less: [
      resolve('src/**/*.less'),
      `!${resolve('src/styles/*.less')}`
    ],
    static: [
      resolve('src/**/*.*'),
      `!${resolve('src/**/*.less')}`
    ]
  },
  watch: {
    less: resolve('src/**/*.less')
  },
  dist: {
    default: resolve('dist')
  }
}

const taskNpm = () => {
  const _resolve = resolve
  return new Promise((resolve, reject) => {
    const keys = ['name', 'version', 'license', 'author', 'description', 'dependencies']
    const result = keys.reduce((result, key) => {
      result[key] = packageJSON[key]

      return result
    }, {})

    fs.writeFile(_resolve(config.dist.default, 'package.json'), JSON.stringify(result, null, '\t'), e => {
      if (e) {
        reject(e)
      } else {
        resolve()
        exec('yarn install', {
          cwd: _resolve(config.dist.default)
        })
      }
    })
  })
}

const taskLess = () => {
  return gulp.src(config.src.less)
    .pipe(less())
    .on('error', ({ message }) => {
      throw new Error(message)
    })
    .pipe(postcss([autoprefixer(['iOS >= 8', 'Android >= 4.1'])]))
    .pipe(cssnano({
      zindex: false,
      autoprefixer: false,
      discardComments: { removeAll: true },
      svg: false
    }))
    .pipe(rename((path) => {
      path.extname = '.wxss'
      return path
    }))
    .pipe(gulp.dest(config.dist.default))
}

const taskStatic = () => {
  return gulp.src(config.src.static)
    .pipe(gulp.dest(config.dist.default))
}

const taskWatch = () => {
  watch(config.watch.less, gulp.series(taskLess))
  watch(config.src.static, gulp.series(taskStatic))
}

const taskClean = () => {
  if (!fs.existsSync(config.dist.default)) {
    return Promise.resolve()
  }

  const exludes = ['miniprogram_npm']
  const rm = util.promisify(rimraf)
  const promises = fs.readdirSync(config.dist.default)
    .filter(filename => !exludes.includes(filename))
    .map(filename => rm(resolve(config.dist.default, filename)))

  return Promise.all(promises)
}

exports.default = gulp.series(
  taskClean,
  gulp.parallel(taskLess, taskStatic),
  taskNpm,
  taskWatch
)
