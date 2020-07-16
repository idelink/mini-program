const util = require('util')
const rimraf = require('rimraf')
const gulp = require('gulp')
const less = require('gulp-less')
const webpack = require('webpack')
const postcss = require('gulp-postcss')
const cssnano = require('gulp-cssnano')
const rename = require('gulp-rename')
const autoprefixer = require('autoprefixer')


const taskLess = () => {
  return gulp.src(['../src/**/*.less', '!../src/styles/*.less'])
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
  .pipe(gulp.dest('../dist'))
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
  return gulp.src('../src/**/*.wxml')
  .pipe(gulp.dest('../dist'))
}

const taskWxss = () => {
  return gulp.src('../src/**/*.wxss')
  .pipe(gulp.dest('../dist'))
}

const taskJson = () => {
  return gulp.src('../src/**/*.json')
  .pipe(gulp.dest('../dist'))
}

const taskStatic = () => {
  return gulp.src('../src/static/**/*')
  .pipe(gulp.dest('../dist/static'))
}

const taskClean = () => {
  const rm = util.promisify(rimraf)
  
  return rm('../dist').then(e => {
    if (e) {
      throw e
    }
  })
}

const taskWatch = () => {
  gulp.watch('../src/**/*.less', gulp.series(taskLess))
  gulp.watch('../src/**/*.js', gulp.series(taskWebpack))
  gulp.watch('../src/**/*.wxml', gulp.series(taskWxml))
  gulp.watch('../src/**/*.wxss', gulp.series(taskWxss))
  gulp.watch('../src/**/*.json', gulp.series(taskJson))
  gulp.watch('../src/static/**', gulp.series(taskStatic))
}

exports.default = gulp.series(taskClean, gulp.parallel(taskWxml, taskWxss, taskJson, taskWebpack, taskLess, taskStatic, taskWatch))
