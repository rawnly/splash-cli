#!/usr/bin/env node
module.exports = fs = require('fs')
module.exports = path = require('path')
module.exports = os = require('os')

// path.join() shorthand
module.exports = join = path.join
module.exports = parse = path.parse
module.exports = normalize = path.normalize
module.exports = relative_path = path.relative
module.exports = separator = path.sep

// JSON
module.exports = jparse = JSON.parse
module.exports = jstringify = JSON.stringify

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

// Capitalize
module.exports = String.prototype.capitalize = function(divider = ' ', joiner = divider) {
  var cap_str = [];

  this.toLowerCase().split(divider).forEach( item => {
    item = item.charAt(0).toUpperCase() + item.slice(1, item.length)
    cap_str.push(item)
  })

  return cap_str.join(joiner)
}

module.exports = String.prototype.relativeTo = function(path) {
  return relative_path(this.toString(), path)
}
