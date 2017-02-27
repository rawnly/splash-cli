// Modules
const colors = require('colors');
const Conf = require('conf');
const firstRun = require('first-run');
const os = require('os');
const path = require('path');

// Variables
const join = path.join();
const log = console.log;
const config = new Conf();

// Init
module.exports = () => {
  config.set('pic_dir', join(os.homedir(), 'Pictures', 'splash_photos'));
  firstRun.clear();

  log();
  log(`${colors.yellow('Splash:')} Settings restored to default.`.gray);
  log();
};
