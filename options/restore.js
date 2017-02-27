'use strict';

require('chili-js');
require('../libs/utility');
require('../libs/variables');

const figlet          = require('figlet');
const ProgressBar     = require('progress');
const normalize       = require('normalize-url');
const urlRegex        = require('url-regex');
const dns 						= require('dns');
const colors          = require('colors');
const chalk         	= require('chalk');
const meow            = require('meow');
const isOnline        = require('is-online');
const wallpaper 			= require('wallpaper');
const ora       			= require('ora');
const got 			 			= require('got');
const https 		 			= require('https');
const mkdirp    			= require('mkdirp');
const updateNotifier  = require('update-notifier');
const clear 					= require('clear');
const conf 					  = require('conf');
const firstRun 			  = require('first-run');
const execa 					= require('execa');
const pkg       	 	  = require('../package.json');
const config 				  = new conf();
const notifier 			  = updateNotifier({
	pkg,
	updateCheckInterval: 1000
});
const spinner = new ora({
	text: 'Connecting to Unsplash',
	color: 'yellow',
	spinner: 'earth'
});



module.exports = () => {
  config.set('pic_dir', join(home, 'Pictures', 'splash_photos'));
  firstRun.clear();

  log()
  log(`${colors.yellow('Splash:')} Settings restored to default.`.gray)
  log()
}
