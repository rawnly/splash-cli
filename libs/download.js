// Modules
const https = require('https');
const fs = require('fs');
const ProgressBar = require('progress');
const wallpaper = require('wallpaper');
const Ora = require('ora');
const Conf = require('conf');

const config = new Conf();
const chalk = require('chalk');

const checkArchivment = require('./archivments');

const spinner = new Ora({text: 'Connecting to Unsplash', color: 'yellow', spinner: 'earth'});
const log = console.log;

function checkArchivment_(list, counter) {
	let unlocked = false;

	if (list) {
		list.forEach(archivment => {
			if (counter === archivment.downloads) {
				unlocked = archivment;
			}
		});
	}

	return unlocked;
};


function infos(matrice, fl) {
	const creator = {
		fullname: matrice.user.name,
		username: `@${matrice.user.username}`
	};

	if (fl.info) {
		log('');
		log(`ID: ${chalk.yellow(matrice.id)}`);
		log('');

		if (matrice.exif !== undefined) {
			if (matrice.exif.make) {
				log(chalk.yellow.bold('Make: ') + matrice.exif.make);
			} else {
				log(`${chalk.yellow.bold('Make: ')}--`);
			}
			if (matrice.exif.model) {
				log(chalk.yellow.bold('Model: ') + matrice.exif.model);
			} else {
				log(`${chalk.yellow.bold('Model: ')}--`);
			}
			if (matrice.exif.exposure_time) {
				log(chalk.yellow.bold('Shutter Speed: ') + matrice.exif.exposure_time);
			} else {
				log(`${chalk.yellow.bold('Shutter Speed: ')}--`);
			}
			if (matrice.exif.aperture) {
				log(`${chalk.yellow.bold('Aperture:')} f/${matrice.exif.aperture}`);
			} else {
				log(`${chalk.yellow.bold('Aperture:')} f/--`);
			}
			if (matrice.exif.focal_length) {
				log(`${chalk.yellow.bold('Focal Length: ') + matrice.exif.focal_length}mm`);
			} else {
				log(`${chalk.yellow.bold('Focal Length: ')}--`);
			}
			if (matrice.exif.iso) {
				log(chalk.yellow.bold('ISO: ') + matrice.exif.iso);
			} else {
				log(`${chalk.yellow.bold('ISO: ')}--`);
			}
		}
		log('');
		log(`Shooted by: ${chalk.cyan.bold(creator.fullname)} (${chalk.yellow(creator.username)})`);
		log(`Profile URL: ${matrice.user.links.html}`);
	} else {
		log('');
		log(`Shooted by: ${chalk.cyan.bold(creator.fullname)} (${chalk.yellow(creator.username)})`);
	}
}

// Filename | url, photo, fl
function download(args = {custom: false}, fl, set = true) {
	spinner.text = 'Making something awsome';

  // Archivments
	config.set('counter', config.get('counter') + 1);

	const archivment = checkArchivment_(config.get('archivments'), config.get('counter'));

	if (!fl.progress) {
		spinner.start();
	}

	const file = fs.createWriteStream(args.filename);
	let url = '';

	if (args.custom === true) {
		url = args.photo.urls.custom;
	} else {
		url = args.photo.urls.full;
	}

	https.get(url, response => {
		if (fl.progress) {
			const len = parseInt(response.headers['content-length'], 10);
			const bar = new ProgressBar(`${chalk.yellow('↓ ') + chalk.red(':percent')} [:bar] :elapsed s`, {
				complete: '=',
				incomplete: ' ',
				width: 20,
				total: len,
				clear: true
			});

			response.on('data', chunk => {
				bar.tick(chunk.length, {
					passphrase: 'Making something awsome'
				});
			});
		}

		response.pipe(file).on('finish', () => {
			const img = args.filename;

      // Set wallpaper
			if (set) {
				wallpaper.set(img);
			}

      // Stop the spinner and log the output
			spinner.succeed();

			infos(args.photo, fl);

      // Spacer
			console.log('');

			if (archivment) {
				console.log(`[!!!] New archivment unlocked: "${chalk.yellow(archivment.name)}"`);
				console.log('');
			}
		});
	});
}

module.exports = download;
