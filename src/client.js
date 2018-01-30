/**
 * Author: Federico Vitale <fedevitale99@gmail.com>
 * Link: https://github.com/Rawnly
 * Copyright 2017 Federico Vitale
 */
require('babel-polyfill');

import fs from 'fs';

import frun from 'first-run';
import mkdirp from 'mkdirp';
import chalk from 'chalk';
import normalize from 'normalize-url';
import updateNotifier from 'update-notifier';

import Conf from 'conf';

import splash from './libs/core';
import download from './libs/download';

const ACTIONS = {
	alias: require('./commands/alias'),
	list: require('./commands/list'),
	settings: require('./commands/settings')
};

// UTILS
import {
	pathParser,
	downloadFlags,
	printBlock
} from './libs/utils';

const api = {
	base: 'https://api.unsplash.com',
	token: 'daf9025ad4da801e4ef66ab9d7ea7291a0091b16d69f94972d284c71d7188b34',
	oauth: normalize('https://unsplash.com/oauth/authorize?client_id=daf9025ad4da801e4ef66ab9d7ea7291a0091b16d69f94972d284c71d7188b34&redirect_uri=urn:ietf:wg:oauth:2.0:oob&response_type=code&scope=public')
};

// LOAD JSON
import pkg from '../package.json';
import defaults from './defaults.json';

const notifier = updateNotifier({
	pkg,
	updateCheckInterval: 1000 * 60 * 60
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
		list: 'list',
		'get-settings': 'get-settings'
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

	if (!config.get('directory')) {
		config.set('directory', defaults.directory);
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

		if (ACTIONS[cmd]) {
			ACTIONS[cmd](options, flags);
		} else if (cmd === 'restore') {
			frun.clear();
			printBlock('Settings restored.');
		} else if (cmd === 'get-settings') {
			console.log();
			Object.keys(config.get()).forEach(setting => {
				const value = config.get(setting);
				if (value !== 'undefined' && setting !== 'pic_dir' && setting !== 'user-auth') {
					console.log(chalk`{yellow ${setting}}: ${JSON.stringify(value, null, 2)}`);
				}
			});
			console.log();
		} else {
			printBlock(chalk`{red Invalid command}`);
			exit();
		}
	} else {
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
			download(flags, {photo}, setAsWallpaper);
			return true;
		}

		return false;
	}

	return true;
}

module.exports = client;
