// Ext Modules
const colors = require('colors');
const path = require('path');
const os = require('os');
const Conf = require('conf');

const config = new Conf();
const log = console.log;
const join = path.join;
const home = os.homedir();


module.exports = (fl) => {
  let dir = fl.dir;

  if (!dir.length) {
    dir = config.get('pic_dir');
    log(`${colors.gray('Actual directory =>')} ${colors.underline(config.get('pic_dir'))}`);
  } else {
    if (fl.dir.includes('~')) {
      dir = join(home, fl.dir.split('~')[1]);
    }

    const oldDir = config.get('pic_dir');

    config.set('pic_dir', fl.dir);

    log(`${colors.yellow(oldDir)} ==> ${colors.green(config.get('pic_dir'))}`.gray);
  }
};
