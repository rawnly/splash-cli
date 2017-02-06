#!/usr/bin/env node

require('../libs/variables');
require('../libs/utility');

module.exports = (fl) => {
  if (!fl.dir.length) {
    fl.dir = config.get('pic_dir');
    log(`${colors.gray('Actual directory =>')} ${colors.underline(config.get('pic_dir'))}`)
  } else {

    if (fl.dir.includes('~')) {
      fl.dir == join(home, fl.dir.split('~')[1]);
    }

    let old_dir = config.get('pic_dir')

    config.set('pic_dir', fl.dir)

    log(`${colors.yellow(old_dir)} ==> ${colors.green(config.get('pic_dir'))}`.gray)
  }
}
