// Ext Modules
const path = require('path');
const os = require('os');
const Conf = require('conf');
const chalk = require('chalk');

const config = new Conf();
const join = path.join;
const home = os.homedir();

module.exports = fl => {
  if (!fl.set || fl.set.length === false) {
    console.log(`

${chalk.gray('Actual directory =>')} ${chalk.underline(config.get('pic_dir'))}

      `);
  } else {
    let dir = fl.set;

    if (fl.set.includes('~')) {
      dir = join(home, fl.set.split('~')[1]);
    }

    const oldDir = config.get('pic_dir');

    config.set('pic_dir', dir);

    console.log(`

${chalk.yellow(oldDir)} ==> ${chalk.green(config.get('pic_dir'))}

      `);
  }
};
