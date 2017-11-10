const https = require('https');
const fs = require('fs');
const path = require('path');

const ProgressBar = require('progress');
const wallpaper = require('wallpaper');
const chalk = require('chalk');

const Ora = require('ora');
const Conf = require('conf');

const {
	parseExif,
	showCopy
} = require('./utils');

const config = new Conf();
const spinner = new Ora({
	text: 'Making something awesome',
	color: 'yellow',
	spinner: 'earth'
});

const join = path.join;

// Flags, options, set as wallpaper
function download({quiet, infos} = {}, {custom = false, photo, filename} = {}, setAsWallpaper = true) {
	// Increase downloads counter.
	config.set('counter', config.get('counter') + 1);

	// If no progress run the spinner
	if (!quiet) {
		spinner.start();
	}

	const size = config.get('pic-size');
	const extension = size === 'raw' ? 'tiff' : 'jpg';
	const img = filename ? filename : join(config.get('directory'), `${photo.id}.${extension}`);
	const url = custom ? photo.urls.custom : (photo.urls[size] ? photo.urls[size] : photo.urls.full);
	const file = fs.createWriteStream(img);

	try {
		https.get(url, response => {
			response.pipe(file).on('finish', () => {
				if (setAsWallpaper) {
					wallpaper.set(img);
				}

				if (!quiet) {
					spinner.succeed();
				}

				// Get photos infos
				if (infos) {
					const exif = parseExif(photo);

					console.log();
					exif.forEach(item => {
						console.log(chalk`{bold {yellow ${item.name.toUpperCase()}}}: ${item.value}`);
					});
					console.log();
				}

				// Display 'shot by ...'
				showCopy(photo);

				// Trailing space
				console.log();
			});
		});
	} catch (err) {
		throw new Error(err);
	}
}

module.exports = download;
