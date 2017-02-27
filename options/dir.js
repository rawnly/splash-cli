// Ext Modules
const path = require('path');
const os = require('os');
const Conf = require('conf');
const chalk = require('chalk');

const config = new Conf();
const log = console.log;
const join = path.join;
const home = os.homedir();

module.exports = fl => {
  let dir = fl.dir;

  if (dir.length === false) {
    dir = config.get('pic_dir');
    log(`${chalk.gray('Actual directory =>')} ${chalk.underline(config.get('pic_dir'))}`);
  } else {
    if (fl.dir.includes('~')) {
      dir = join(home, fl.dir.split('~')[1]);
    }

    const oldDir = config.get('pic_dir');

    config.set('pic_dir', fl.dir);

    log(`${chalk.yellow(oldDir)} ==> ${chalk.green(config.get('pic_dir'))}`);
  }
};
