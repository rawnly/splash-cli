#!/usr/bin/env node

require('../libs/variables');
require('../libs/utility');

module.exports = (fl) => {
  splash(api_url, (data, photo) => {
    let directory = (fl.save.length) ? join(fl.save, data.name + '.jpg') : join(config.get('pic_dir'), data.name + '.jpg');
    down_load(directory, data.url, photo, fl);
  })
}
