require('./variables');
require('./core');

var pic_dir = config.get('pic_dir');

module.exports = infos = (matrice, fl) => {

	let creator = {
		fullname: matrice.user.name,
		username: `@${matrice.user.username}`
	}

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

module.exports = down_load = (filename, url, m, fl) => {
	spinner.spinner = {
		frames: [
			'🚀'
		]
	};
	spinner.text = ' Making something awsome';
	spinner.start();

	let file = fs.createWriteStream(filename);

	https.get(url, function(response) {
		response.pipe(file).on('finish', () => {
			spinner.succeed();

			if (fl.set) {
				wallpaper.set(filename);
			}

			infos(m, fl);

			log('');
		});
	});
};


module.exports = download = (filename, url, photo, m, fl) => {
	spinner.text = 'Making something awsome';
	spinner.start();

	let file = fs.createWriteStream(filename);

	https.get(url, function(response) {
		response.pipe(file).on('finish', () => {

      // Set the wallpaper
			wallpaper.set(`${pic_dir}/${photo}.jpg`);

      // Stop the spinner
			spinner.succeed();

      // Log photo infos
			infos(m, fl);

			// Blank spacer
			log('');
		});
	});
};

// Delete elements
module.exports = del = (directory) => {

	fs.readdir(directory, function (err, files) {
		spinner.spinner = {
			frames: [
				'✗',
				'✘',
				'✖︎'
			]
		};
		spinner.text = 'Deleting something awsome...';
		spinner.start();

		if ( files ) {
			files.forEach(file => {
				if ( file.includes('.jpg') ) {
					fs.unlink( join(directory, `${file}`), () => {
						log(`✖︎ Removing ${file.toString().yellow} from ${directory.toString().inverse}`);
					});
				}
			});
			spinner.succeed();
			log('')

		} else {
			spinner.text = 'The directory is empty!'.bold;
			spinner.stopAndPersist('\n✦'.yellow.bold);
			log('')
		}

	});
};

// Check internet connection
module.exports = checkInternet = (callback) => {
	dns.lookup('unsplash.com',function(err) {
		if (err && err.code == 'ENOTFOUND') {
			callback(false);
			notifier.notify();
		} else {
			callback(true);
		}
	});
};
