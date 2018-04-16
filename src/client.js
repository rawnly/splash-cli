/**
 * Author: Federico Vitale <fedevitale99@gmail.com>
 * Link: https://github.com/Rawnly
 * Copyright 2017 Federico Vitale
 */
require('babel-polyfill');

import fs from 'fs';
import dotenv from 'dotenv-safe';
import frun from 'first-run';
import mkdirp from 'mkdirp';
import chalk from 'chalk';
import normalize from 'normalize-url';
import updateNotifier from 'update-notifier';
import inquirer from 'inquirer';
import Ora from 'ora';
import Conf from 'conf';

import splash from '@splash-cli/core';
import download from './libs/download';

const ACTIONS = {
	alias: require('./commands/alias'),
	list: require('./commands/list'),
	settings: require('./commands/settings')
};

import pathParser from '@splash-cli/path-fixer';
import printBlock from '@splash-cli/print-block';

import defaults from './defaults';

// UTILS
import {
	downloadFlags,
	openURL
} from './libs/utils';

// LOAD .env
dotenv.config();

const api = {
	base: 'https://api.unsplash.com',
	token: process.env.SPLASH_TOKEN,
	oauth: normalize(`https://unsplash.com/oauth/authorize?client_id=${process.env.SPLASH_TOKEN}&redirect_uri=https%3A%2F%2Frawnly.com%2Fsplash-cli%2Findex.php&response_type=code&scope=public+read_collections`)
};

if (!api.token) {
	throw new Error('No API token.');
}

// LOAD JSON
import pkg from '../package.json';

const notifier = updateNotifier({
	pkg,
	updateCheckInterval: 1000 * 60 * 60
});

const config = new Conf();
const spinner = new Ora();

// Parse default path
defaults.directory = pathParser(defaults.directory);

const {
	exit
} = process;

async function client(commands, flags) {
	const {
		quiet,
		save,
		me,
		auth
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

	if (quiet) {
		spinner.start = () => {};
		spinner.stop = () => {};
		spinner.fail = () => {};
		spinner.succeed = () => {};

		console.log = () => {};
		console.error = () => {};
		console.warn = () => {};
	}

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
	} else if (me === true) {
		console.log('Hello World');
		let count = 0;
		spinner.text = `Spinning around: ${count} times`;
		spinner.start();

		let int = setInterval(() => {
			count += 1;
			spinner.text = `Spinning around: ${count} times`;
		}, 499);

		setTimeout(() => {
			spinner.succeed();
			clearInterval(int);
		}, 2500);
	} else if (auth) {
		await openURL({
			quiet: true
		}, api.oauth);

		const {
			oauthToken
		} = await inquirer.prompt([{
			name: 'oauthToken',
			message: 'Paste here the token:',
			validate: input => /[a-z0-9]{64}/g.test(input)
		}]);

		config.set('oauth-token', oauthToken);
	} else {
		const url = await downloadFlags(`${api.base}/photos/random?client_id=${api.token}`, flags);
		const response = await splash(url, flags);
		const photo = response.data;
		const setAsWallpaper = !save;
		const {
			statusCode
		} = response.status;

		// If (save) {
		// 	setAsWallpaper = false;
		// }

		if (statusCode === 200) {
			download(flags, {
				photo
			}, setAsWallpaper);
			return true;
		}

		return false;
	}

	return true;
}

module.exports = client;
