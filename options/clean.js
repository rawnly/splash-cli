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
const config 				  = new conf();
const spinner = new ora({
	text: 'Connecting to Unsplash',
	color: 'yellow',
	spinner: 'earth'
});

module.exports = () => {
  mkdirp(config.get('pic_dir'), (err) => {
    if (err) {log(err);}
  });

  del( config.get('pic_dir') );
}


// Delete elements
function del(directory) {
	log();
	fs.readdir(directory, function (err, files) {
    let imgs = [];
    files.forEach((item) => {
      if (item.includes('.jpg')) {
        imgs.push(item);
      }
    });
		if ( imgs[0] ) {
      var bar = new ProgressBar('Deleted: '+':current'.green+' of '+':total'.green+`files from ${config.get('pic_dir').toString().blue}`, {
        total: imgs.length
      });
      log('');

			files.forEach(file => {
				if ( file.includes('.jpg') ) {
					fs.unlink( join(directory, `${file}`), () => {
            bar.tick(1);
					});
				}
			});

		} else {
      log('');
      console.log('\n✦'.yellow.bold + 'The directory is empty!');
      log('');
		}

	});
};
