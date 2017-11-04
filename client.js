/**
 * Author: Federico Vitale <fedevitale99@gmail.com>
 * Link: https://github.com/Rawnly
 * Copyright 2017 Federico Vitale
 */

const fs = require('fs');

const frun = require('first-run');
const mkdirp = require('mkdirp');
const chalk = require('chalk');
const normalize = require('normalize-url');
const updateNotifier = require('update-notifier');
const clear = require('clear');

// Const Ora = require('ora');
const Conf = require('conf');
const Meow = require('meow');

const splash = require('./libs/core');
const download = require('./libs/download');

const pkg = require('./package.json');

let commands = {};

commands.alias = require('./commands/alias');
commands.list = require('./commands/list');
commands.settings = require('./commands/settings');

// UTILS
const {pathParser, downloadFlags} = require('./libs/utils');

const api = {
	base: 'https://api.unsplash.com',
	token: 'daf9025ad4da801e4ef66ab9d7ea7291a0091b16d69f94972d284c71d7188b34',
	oauth: normalize('https://unsplash.com/oauth/authorize?client_id=daf9025ad4da801e4ef66ab9d7ea7291a0091b16d69f94972d284c71d7188b34&redirect_uri=urn:ietf:wg:oauth:2.0:oob&response_type=code&scope=public')
};

// Const spinner = new Ora();
const notifier = updateNotifier({pkg, updateCheckInterval: 1000});

// LOAD DEFAULT CONFIGS
const defaults = require('./defaults.json');

// Parse default path
defaults.directory = pathParser(defaults.directory);

const config = new Conf();


// Main function
async function client(command, flags) {
	// On first run set default settings.
	if (frun() && !flags.restore) {
		mkdirp.sync(defaults.directory);

		Object.keys(defaults).forEach(setting => {
			config.delete(setting);
			config.set(setting, defaults[setting]);
		});
	}

	// If directory is not setted use the default one
	if (!config.get('directory')) {
		config.set('directory', defaults.directory);
	}

	if ( flags.quiet ) {
		console.log = function() {};
	}

	// Check if the directory exists, if not create it.
	const splashFolder = fs.existsSync(config.get('directory'));
	if (!splashFolder) {
		mkdirp.sync(config.get('directory'));
	}

	if (notifier.update && !flags.force) {
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
	} else if (command.length >= 1) {
		switch (command[0]) {
			// Create a new alias
			case 'alias':
				commands.alias(command[1], command[2]);
				break;
			case 'restore':
				// Restore default settings
				commands.settings(command, true);
				break;
			case 'settings':
				// Setup auth and quality settings
				commands.settings(command);
				break;
			default:
				clear();
				console.log();
				console.log(chalk`{red Invalid command}`);
				console.log();
				break;
		}
	} else {
		// Core of splash, download a random photo

		// default API URL
		let url = `${api.base}/photos/random?client_id=${api.token}`;

		// If id is specified download photo by "id"
		url = await downloadFlags(url, flags);

		// Response from URL
		const response = await splash(url, flags);

		// Get the photo
		const photo = response.data;

		// Request status information
		const {statusCode} = response.status;

		let setAsWallpaper;

		// If --save do not set it as wallpaper
		if (flags.save) {
			setAsWallpaper = false;
		} else {
			setAsWallpaper = true;
		}

		// IF OK then download
		if (statusCode === 200) {
			download(flags, photo, setAsWallpaper);
		}
	}
}

module.exports = client;