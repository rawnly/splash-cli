// Modules
const os = require('os');
const path = require('path');
const chalk = require('chalk');
const Conf = require('conf');
const firstRun = require('first-run');

// Variables
const join = path.join();
const log = console.log;
const config = new Conf();

// Init
module.exports = () => {
  config.set('pic_dir', join(os.homedir(), 'Pictures', 'splash_photos'));
  firstRun.clear();

  log();
  log(`${chalk.yellow('Splash:')} ${chalk.gray('Settings restored to default.')}`);
  log();
};
