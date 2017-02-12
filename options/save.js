#!/usr/bin/env node

require('../libs/variables');
require('../libs/utility');
const splash = require('../libs/core')

module.exports = (fl) => {
  let url = '';

  if ( fl.heigth && fl.width ) {
    url = `${api_url}&&w=${fl.width}&&h=${fl.heigth}`
  } else if ( fl.user ) {
    url = `${api_url}&&username=${fl.user}`
  } else if ( fl.featured ) {
    url = `${api_url}&&featured=${fl.featured}`
  } else if ( fl.collection ) {
    url = `${api_url}&&collection=${fl.collection}`
  } else {
    url = `${api_url}`
  }

  splash(url, (data, photo) => {
    let directory = (fl.save.length) ? join(fl.save, data.name + '.jpg') : join(config.get('pic_dir'), data.name + '.jpg');
    down_load(directory, data.url, photo, fl);
  })

  log();
  log(`${colors.yellow('Splash:')} Photo saved at ${fl.save}`)
  log()
}
