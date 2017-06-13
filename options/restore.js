// Modules

const chalk = require('chalk');
const Conf = require('conf');
const frun = require('first-run');
const pathParser = require('../libs/pathparser');

// Variables
const log = console.log;
const config = new Conf();

module.exports = () => {
	config.set('pic_dir', pathParser('~/Pictures/splash_photos'));
	frun.clear();

	log();
	log(`${chalk.yellow('Splash:')} ${chalk.gray('Settings restored to default.')}`);
	log();
};
