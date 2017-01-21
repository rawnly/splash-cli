#!/usr/bin/env node
module.exports = fs = require('fs')
module.exports = path = require('path')
module.exports = os = require('os')

// path.join() shorthand
module.exports = join = path.join

// Various console commands
module.exports = log = console.log
module.exports = warn = console.warn
module.exports = err = console.error

// FS read & write | Async
module.exports = write = fs.writeFile
module.exports = writeSync = fs.writeFileSync

// FS read & write | Sync
module.exports = read = fs.readFile
module.exports = readSync = fs.readFileSync

// System Infos
module.exports = home = os.homedir()
module.exports = user = home.split('/')[home.split('/').length - 1]

module.exports = capitalize = (str) => {
  var cap = str.charAt(0).toUpperCase() + str.slice(1, str.length)
  return cap
}

module.exports = print = (array) => {
  array.forEach((item) => {
    console.log(item)
  })
}
