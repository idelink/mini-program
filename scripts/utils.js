const path = require('path')

exports.resolve = (...args) => path.resolve(__dirname, '..', ...args)
