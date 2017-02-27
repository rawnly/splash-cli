'use strict';

require('chili-js');
require('../libs/utility');

const token = 'daf9025ad4da801e4ef66ab9d7ea7291a0091b16d69f94972d284c71d7188b34';
const api_url = 'https://api.unsplash.com/photos/random?client_id=' + token;

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
const splash 				  = require('../libs/core');
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
  var parse = (string) => {
    return normalize(string).match( urlRegex ) ? normalize(string).split('?photo=')[1] : string;
  }

  var id = parse(fl.id) ? parse(fl.id) : fl.id;
  var api_url_id = 'https://api.unsplash.com/photos/' + id + '?client_id=' + token;

  mkdirp(config.get('pic_dir'), (err) => {
    if (err) {log(err);}
  });

  log(id)


  fs.exists( join(config.get('pic_dir'), `${id}.jpg`), (exists) => {
    if (!exists) {
      splash(api_url_id, (data, photo) => {
        download( join(config.get('pic_dir'), data.name + '.jpg'), data.url, data.name, photo, fl);
      });

    } else {
      log(`You have this photo (${id}.jpg) locally!`);
      wallpaper.set( join(config.get('pic_dir'), `${id}.jpg`) );
    }
  });

}

function download(filename, url, photo, m, fl) {
	spinner.text = 'Making something awsome';
  if ( !fl.progress ) {
    spinner.start();
  }


	let file = fs.createWriteStream(filename);

	https.get(url, function(response) {

    if ( fl.progress ) {
      var len = parseInt(response.headers['content-length'], 10);
      var bar = new ProgressBar('↓ '.yellow + ':percent'.red + ' [:bar] :elapsed' + 's', {
        complete: '=',
        incomplete: ' ',
        width: 20,
        total: len,
        clear: true
      });

      response.on('data', function (chunk) {
        bar.tick(chunk.length, {
          'passphrase': 'Making something awsome'
        });
      });
    }


		response.pipe(file).on('finish', () => {
      // Set the wallpaper
			wallpaper.set(`${config.get('pic_dir')}/${photo}.jpg`);

      // Stop the spinner
      spinner.succeed();


      // Log photo infos
			infos(m, fl);

			// Blank spacer
			log('');
		});
	});
};

function infos(matrice, fl) {
	let creator = {
		fullname: matrice.user.name,
		username: `@${matrice.user.username}`
	};

	if ( fl.info ) {
		log('');
		log(`ID: ${matrice.id.yellow}`);
		log('');

		if ( matrice.exif !== undefined ) {
			if (matrice.exif.make) {
				log('Make: '.yellow.bold + matrice.exif.make);
			} else {
				log('Make: '.yellow.bold + '--');
			}
			if (matrice.exif.model) {
				log('Model: '.yellow.bold + matrice.exif.model);
			} else {
				log('Model: '.yellow.bold + '--');
			}
			if (matrice.exif.exposure_time) {
				log('Shutter Speed: '.yellow.bold + matrice.exif.exposure_time);
			} else {
				log('Shutter Speed: '.yellow.bold + '--');
			}
			if (matrice.exif.aperture) {
				log('Aperture:'.yellow.bold + ' f/' + matrice.exif.aperture);
			} else {
				log('Aperture: '.yellow.bold + ' f/' + '--');
			}
			if (matrice.exif.focal_length) {
				log('Focal Length: '.yellow.bold + matrice.exif.focal_length + 'mm');
			} else {
				log('Focal Length: '.yellow.bold + '--');
			}
			if (matrice.exif.iso) {
				log('ISO: '.yellow.bold + matrice.exif.iso);
			} else {
				log('ISO: '.yellow.bold + '--');
			}
		}
		log('');
		log('Shooted by: ' + creator.fullname.cyan.bold + ' (' + creator.username.yellow + ')' );
		log('Profile URL: ' + matrice.user.links.html);
	} else {
		log('');
		log('Shooted by: ' + creator.fullname.cyan.bold + ' (' + creator.username.yellow + ')' );
	}
};
