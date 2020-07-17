const util = require('util')
const rimraf = require('rimraf')
const gulp = require('gulp')
const less = require('gulp-less')
const webpack = require('webpack')
const postcss = require('gulp-postcss')
const cssnano = require('gulp-cssnano')
const rename = require('gulp-rename')
const autoprefixer = require('autoprefixer')
const { resolve } = require('./utils')

const config = {
  src: {
    js: resolve('src/**/*.js'),
    less: [
      resolve('src/**/*.less'),
      `!${resolve('src/styles/*.less')}`
    ],
    wxml: resolve('src/**/*.wxml'),
    wxss: resolve('src/**/*.wxss'),
    json: resolve('src/**/*.json'),
    static: resolve('src/static/**/*.*')
  },
  watch: {
    less: resolve('src/**/*.less')
  },
  dist: {
    default: resolve('dist'),
    static: resolve('dist/static')
  }
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

const taskWebpack = () => {
  const { getEntries, webpackConfig } = require('./webpack.config.js')

  return new Promise((resolve) => {
    webpackConfig.entry = getEntries()
    webpack(webpackConfig, e => {
      if (e) {
        throw new Error(e)
      }
      resolve()
    })
  })
}

const taskWxml = () => {
  return gulp.src(config.src.wxml)
    .pipe(gulp.dest(config.dist.default))
}

const taskWxss = () => {
  return gulp.src(config.src.wxss)
    .pipe(gulp.dest(config.dist.default))
}

const taskJson = () => {
  return gulp.src(config.src.json)
    .pipe(gulp.dest(config.dist.default))
}

const taskStatic = () => {
  return gulp.src(config.src.static)
    .pipe(gulp.dest(config.dist.static))
}

const taskClean = () => {
  const rm = util.promisify(rimraf)

  return rm(config.dist.default).then(e => {
    if (e) {
      throw e
    }
  })
}

const taskWatch = () => {
  const watch = {
    ...config.src,
    ...config.watch
  }

  gulp.watch(watch.less, gulp.series(taskLess))
  gulp.watch(watch.js, gulp.series(taskWebpack))
  gulp.watch(watch.wxml, gulp.series(taskWxml))
  gulp.watch(watch.wxss, gulp.series(taskWxss))
  gulp.watch(watch.json, gulp.series(taskJson))
  gulp.watch(watch.static, gulp.series(taskStatic))
}

exports.default = gulp.series(taskClean, gulp.parallel(taskWxml, taskWxss, taskJson, taskWebpack, taskLess, taskStatic, taskWatch))
