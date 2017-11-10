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

const Conf = require('conf');

const splash = require('./libs/core');
const download = require('./libs/download');

const ACTIONS = {
	alias: require('./commands/alias'),
	list: require('./commands/list'),
	settings: require('./commands/settings')
};

// UTILS
const {
	pathParser,
	downloadFlags,
	printBlock
} = require('./libs/utils');

const api = {
	base: 'https://api.unsplash.com',
	token: 'daf9025ad4da801e4ef66ab9d7ea7291a0091b16d69f94972d284c71d7188b34',
	oauth: normalize('https://unsplash.com/oauth/authorize?client_id=daf9025ad4da801e4ef66ab9d7ea7291a0091b16d69f94972d284c71d7188b34&redirect_uri=urn:ietf:wg:oauth:2.0:oob&response_type=code&scope=public')
};

// LOAD JSON
const pkg = require('./package.json');
const defaults = require('./defaults.json');

const notifier = updateNotifier({
	pkg,
	updateCheckInterval: 1000
});

const config = new Conf();

// Parse default path
defaults.directory = pathParser(defaults.directory);

const {
	exit
} = process;

async function client(commands, flags) {
	const {
		quiet,
		save
	} = flags;
	const [command, ...others] = commands;
	const COMMANDS_LIST = {
		alias: 'alias',
		settings: 'settings',
		restore: 'restore',
		list: 'list'
	};

	let options = {};

	others.forEach(option => {
		options[option] = option;
	});

	if (frun()) {
		mkdirp.sync(defaults.directory);

		for (let i = 0; i < Object.keys(defaults).length; i++) {
			let setting = Object.keys(defaults)[i];
			config.delete(setting);
			config.set(setting, defaults[setting]);
		}

		if (!config.get('directory')) {
			config.set('directory', defaults.directory);
		}
	}

	if (quiet) {
		console.log = () => {};
	}

	const splashFolder = fs.existsSync(config.get('directory'));
	if (!splashFolder) {
		mkdirp.sync(config.get('directory'));
	}

	if (notifier.update) {
		notifier.notify({
			message: chalk`{dim ${notifier.update.current}} -> {green ${notifier.update.latest}}` +
				`\n Run {cyan ${'npm i -g splash-cli'}} to update`,
			boxenOpts: {
				padding: 1,
				margin: 2,
				align: 'center',
				borderColor: 'green',
				borderStyle: 'single'
			}
		});

		exit();
	}

	if (command) {
		let cmd = COMMANDS_LIST[command] || undefined;

		if (cmd !== undefined) {
			ACTIONS[cmd](options, flags);
			exit();
		}

		printBlock(chalk`{red Invalid command}`);
		exit();
	}

	const url = await downloadFlags(`${api.base}/photos/random?client_id=${api.token}`, flags);
	const response = await splash(url, flags);
	const photo = response.data;
	const {
		statusCode
	} = response.status;

	let setAsWallpaper = true;

	if (save) {
		setAsWallpaper = false;
	}

	if (statusCode === 200) {
		download(flags, photo, setAsWallpaper);
	}
}

module.exports = client;
