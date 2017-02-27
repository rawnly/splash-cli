'use strict';

require('chili-js');
require('../libs/variables');
require('../libs/utility');

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
const firstRun 			  = require('first-run');
const execa 					= require('execa');
const pkg       	 	  = require('../package.json');
const conf					  = require('conf');
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


module.exports = (fl) => {
  fs.readdir( config.get('pic_dir'), (err, files) => {
    if (err) { log(err); } else {
      if ( files[0] ) {

        files.sort();

        let list = [];

        files.forEach((item) => {
          if ( item.charAt(0) !== '.' && item !== 'thumbs' ) {
            item = item.slice(0, item.length - 4);
            list.push(item);
          }
        });

        clear();

        if ( !list.length > 0 ) {
          log()
          log('Splash:'.yellow + ' No photos found'.gray)
          log()
          process.exit()
        }

        log('');
        log(list.length.toString().yellow.bold + ' Photos');
        log('');

        list.sort();

        list = jstringify(list);
        list = jparse(list);

        if ( !fl.export ) {
          log(list);
          log('');
        }

        if ( fl.export && list.length > 0 ) {
          fs.writeFile('./list.json', jstringify(list), (err) => {
            if ( err ) { return err; } else {
              log('---')
              log( 'File written at: ' + './list.json'.blue );
              log('')
            }
          });
        }

      } else {
        log('---')
        log(colors.yellow('Splash:') + ' The directory is empty'.gray);
        log('')
      }
    }
  })
}
