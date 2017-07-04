#!/usr/bin/env node
const path = require('path');

const join = path.join;

// MODULES
const chalk = require('chalk');
const Conf = require('conf');
const figlet = require('figlet');
const frun = require('first-run');
const Meow = require('meow');
const mkdirp = require('mkdirp');
const normalize = require('normalize-url');
const updateNotifier = require('update-notifier');

// Utilities
const splash = require('./libs/core');
const download = require('./libs/download');
const pathParse = require('./libs/pathparser');

// OPTIONS
const cleanCMD = require('./options/clean');
const dirCMD = require('./options/dir');
const idCMD = require('./options/id');
const listCMD = require('./options/list');
const restoreCMD = require('./options/restore');
const saveCMD = require('./options/save');
const sizeCMD = require('./options/size');
const updateCMD = require('./options/update');

// PACKAGE JSON
const pkg = require('./package.json');

// VARIOUS VARIABLES
const token = 'daf9025ad4da801e4ef66ab9d7ea7291a0091b16d69f94972d284c71d7188b34';
const apiURL = normalize(`https://api.unsplash.com/photos/random?client_id=${token}`);

// OBJECTS
const config = new Conf();

// SHORTCUTS
const notifier = updateNotifier({pkg, updateCheckInterval: 1000});

const cli = new Meow(`
    Usage: ${chalk.yellow('splash')} ${chalk.gray('[sub-command] [flags]')}

    ${chalk.yellow('-h --help')}                          ${chalk.gray('Display this message')}
    ${chalk.yellow('-v --version')}                       ${chalk.gray('Display splash version')}

    ${chalk.blue('Picker parameters')}

      ${chalk.yellow('-u --user')} ${chalk.gray('<username>')}             ${chalk.gray('# Pick random image from selected user')}
      ${chalk.yellow('-f --featured')}                    ${chalk.gray('# Pick random image from featured photos')}
      ${chalk.yellow('--size')} ${chalk.gray('[es: 1920x1080]')}           ${chalk.gray('# Resize the image')}

      ${chalk.yellow('-i --info')}                        ${chalk.gray('# Get EXIF infos and Photographer infos')}

      ${chalk.yellow('--collection')} ${chalk.gray('<collection_ID>')}     ${chalk.gray('# Filter by collection')}
      ${chalk.yellow('--id')} ${chalk.gray('<id | photo_url>')}            ${chalk.gray('# Get image by photo ID or URL')}


    ${chalk.blue('Commands')}

      ${chalk.yellow.bold('list')} ${chalk.gray('[extra flags]')}          ${chalk.gray('# List of downloaded photos.')}
        ${chalk.yellow('--export')}                       ${chalk.gray('# Export the photo list.')}

      ${chalk.yellow.bold('save')} ${chalk.gray('[extra flags]')}          ${chalk.gray('# Save photo without setting it as wallpaper.')}
        ${chalk.yellow('-s --set')}                       ${chalk.gray('# Set the saved photo as wallpaper.')}
        ${chalk.yellow('-d --dest')} ${chalk.gray('[path]')}               ${chalk.gray('# Set the path for saved photos (Default: ~/Pictures/splash_photos)')}

      ${chalk.yellow.bold('dir')}                         ${chalk.gray('# Get the main download directory.')}
        ${chalk.yellow('-s --set')} ${chalk.gray('[path]')}                ${chalk.gray('# Set the main download directory.')}

      ${chalk.yellow.bold('update')}                      ${chalk.gray('# Update to the latest version.')}
      ${chalk.yellow.bold('clean')}                       ${chalk.gray('# Delete all downloaded photos.')}
      ${chalk.yellow.bold('restore')}                     ${chalk.gray('# Restore settings to default.')}

      ${chalk.yellow('-p --progress')}                    ${chalk.gray('# Show progressbar during downloads (Default: false)')}
  `, {
	alias: {
		h: 'help',
		v: 'version',
		i: 'info',
		u: 'user',
		d: 'dest',
		s: 'set',
		p: 'progress'
	}
});

function sp(command, flags) {
	if (notifier.update) {
		if (flags.update) {
			updateCMD();
		} else {
			notifier.notify({
				message: `${chalk.dim(notifier.update.current)} -> ${chalk.green(notifier.update.latest)}` +
        `\n Run ${chalk.cyan('splash update')} to update`,
				boxenOpts: {
					padding: 1,
					margin: 2,
					align: 'center',
					borderColor: 'green',
					borderStyle: 'single'
				}
			});
		}
	} else if (command) {
		if (frun()) {
			config.set('counter', 0);
			config.set('archivments', [
				{
					name: 'First Download',
					downloads: 1
				}, {
					name: 'I love photos',
					downloads: 10
				}, {
					name: 'HyperDownloader',
					downloads: 100
				}
			]);

			figlet('Splash!', (err, data) => {
				if (err) {
					console.log('Something went wrong...');
					console.dir(err);
					return;
				}
				console.log(data);
				console.log();

				mkdirp(pathParse('~/Pictures/splash_photos'), () => {
					config.set('pic_dir', pathParse('~/Pictures/splash_photos'));
					console.log(`All photos will stored in: ${config.get('pic_dir')}`);
					console.log();
					console.log();
				});
			});
		}

    if (!config.get('archivments')) {
      config.set('archivments', [
				{
					name: 'First Download',
					downloads: 1
				}, {
					name: 'I love photos',
					downloads: 10
				}, {
					name: 'Hyper Downloader',
					downloads: 100
				}
			]);
    }

		switch (command) {
			case 'update':
				updateCMD();
				break;
			case 'dir':
				dirCMD(flags);
				break;
			case 'save':
				saveCMD(flags);
				break;
			case 'list':
				listCMD(flags);
				break;
			case 'restore':
				restoreCMD();
				break;
			case 'clean':
				cleanCMD();
				break;
			case 'archivments': {
				console.log();
				const archivments = config.get('archivments');

				archivments.forEach(archivment => {
					console.log(`${chalk.green(archivment.name)} unlock at ${chalk.yellow(archivment.downloads + '↓')}`);
				});

				console.log();
				console.log(`Total Downloads: ${chalk.red(config.get('counter'))}`);

				console.log();
				break;}
			default: {
				console.log();
				console.log(`Unknown command "${chalk.cyan(command)}".`);
				console.log();
				console.log(cli.help);
				break;
			}

		}
	} else if (flags.id) {
		idCMD(flags);
	} else if (flags.size) {
		sizeCMD(flags);
	} else {
		let url = '';

		if (flags.user) {
			url = `${apiURL}&username=${flags.user}`;
		} else if (flags.featured) {
			url = `${apiURL}&featured=${flags.featured}`;
		} else if (flags.collection) {
			url = `${apiURL}&collection=${flags.collection}`;
		} else {
			url = `${apiURL}`;
		}

		splash(url, photo => {
			download({
				filename: join(config.get('pic_dir'), `${photo.id}.jpg`),
				photo
			}, flags, () => {
				console.log('x');
			});
		});
	}
}

sp(cli.input[0], cli.flags);
