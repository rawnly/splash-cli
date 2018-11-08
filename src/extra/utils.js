require('babel-polyfill');
require('regenerator-runtime');

import path from 'path';
import os from 'os';
import { URL } from 'url';

import { prompt } from 'inquirer';
import isMonth from '@splash-cli/is-month';
import showCopy from '@splash-cli/show-copy';
import chalk from 'chalk';
import figures from 'figures';
import got from 'got';
import isImage from 'is-image';
import { JSDOM } from 'jsdom';
import mkdirp from 'mkdirp';
import Ora from 'ora';
import RemoteFile from 'simple-download';
import terminalLink from 'terminal-link';
import wallpaper from 'wallpaper';
import normalize from 'normalize-url';

import { config, defaultSettings, keys } from './config';

import User from '../commands/libs/User';
import Alias from '../commands/libs/Alias';


/**
 * @description Generate auth URL
 * @param  {...String} scopes 
 */
export function generateAuthenticationURL(...scopes) {
	const url = new URL('https://unsplash.com/oauth/authorize');
	const validScopes = [
		'public',
		'read_user',
		'write_user',
		'read_photos',
		'write_photos',
		'write_likes',
		'write_followers',
		'read_collections',
		'write_collections'
	];

	scopes = scopes.filter(item => validScopes.indexOf(item) >= 0).join('+');

	url.searchParams.set('client_id', keys.client_id);
	url.searchParams.set('redirect_uri', keys.redirect_uri);
	url.searchParams.set('response_type', 'code');
	
	return url.href + '&scopes=' + scopes;
}

/**
 * @description Authenticate the user.
 * @param {Object} params 
 */
export async function authenticate({ client_id, client_secret, code, redirect_uri } = {}) {
	const url = new URL('https://unsplash.com');
	url.pathname = '/oauth/token';

	const payload = {
		client_id: client_id,
		client_secret: client_secret,
		redirect_uri,
		grant_type: 'authorization_code',
		code: code
	};

	return await got(normalize(url.href), {
		method: 'POST',
		body: JSON.stringify(payload, null, 2),
		headers: {
			'Content-Type': 'application/json'
		}
	});
}

/**
 * @description Make an authenticated request (with bearer)
 * @param {String} endpoint 
 * @param {Object} options 
 */
export async function authenticatedRequest(endpoint, options = {}) {
	warnIfNotLogged();

	const { token } = config.get('user');
	const httpOptions = Object.assign({}, options, {
		headers: Object.assign({}, options.headers, {
			'Authorization': `Bearer ${token}`
		})
	});

	const { body } = await got(`https://api.unsplash.com/${endpoint}`, httpOptions);

	return tryParse(body);
}



/**
 * Check if everything works fine with the user settings.
 */
export function checkUserAuth() {
	const { token, profile: user } = config.get('user');

	if (!token) return false;

	if (!user) {
		authenticatedRequest('me')
			.then(({ body }) => JSON.parse(body))
			.then(usr => config.set('user', Object.assign({ profile: usr }, config.get('user'))))
			.catch(errorHandler);
	}

	return true;
}

/**
 * Warn the user if is not logged.
 */
export function warnIfNotLogged() {
	if (!config.has('user') || !config.get('user').token) {
		return printBlock(chalk `Please log in.`);
	}

	return true;
}



/**
 * @description Try to parse json
 * @param {String} string 
 */
export function tryParse(string) {
	try {
		return JSON.parse(string);
	} catch (error) {
		return string;
	}
}

/**
 * @description Restore default settings
 */
export async function clearSettings() {
	const settingsList = Object.keys(defaultSettings);

	for (let i = 0; i < settingsList.length; i++) {
		const setting = settingsList[i];

		if (config.has(setting)) {
			config.delete(setting);
			config.set(setting, defaultSettings[setting]);
		}
	}

	return config.get() === defaultSettings;
}

/**
 * @description Parse a collection alias
 * @param {String} alias 
 */
export const parseCollection = alias => {
	const exists = Alias.has(alias);
	
	if ( exists ) return Alias.get(alias).id;

	return alias;
};

/**
 * @description Beautify any type of error
 * @param {Error} error 
 */
export function errorHandler(error) {
	const spinner = new Ora();
	spinner.stop();
	printBlock(
		'',
		chalk `{bold {red OOps! We got an error!}}`,
		'',
		chalk `Please report it: {underline {green ${terminalLink('on GitHub', 'https://github.com/splash-cli/splash-cli/issues')}}}`,
		'',
		chalk `{yellow {bold Splash Error}:}`,
		'',
	);

	logger.error(error);
}

/**
 * @description Check if the given string is a path
 * @param {String} p - A Path 
 */
export function isPath(p) {
	return /([a-z]\:|)(\w+|\~+|\.|)\\\w+|(\w+|\~+|)\/\w+/i.test(p);
}

/**
 * @description Download a photo
 * 
 * @param {Object} photo 
 * @param {String} url 
 * @param {Object} flags 
 * @param {Bool} setAsWP 
 */
export async function download(photo, url, flags, setAsWP = true) {
	let dir = config.get('directory');

	if (config.get('userFolder') === true) {
		dir = path.join(config.get('directory'), `@${photo.user.username}`);
	}

	mkdirp.sync(dir);

	const sentences = [
		'Making something awesome',
		'Something is happening...',
		'Magic stuff',
		'Doing something... else',
		'You know, backend stuff..'
	];

	const spinner = new Ora({
		text: sentences[Math.floor(Math.random() * (sentences.length - 1))],
		color: 'yellow',
		spinner: isMonth('december') ? 'christmas' : 'earth'
	});

	if (flags.quiet) {
		console.log = console.info = () => {};
		spinner.start = spinner.fail = () => {};
	}

	spinner.start();

	let filename = path.join(dir, `${photo.id}.jpg`);

	if (flags.save && isPath(flags.save)) {
		const savePath = pathFixer(flags.save);

		filename = path.join(savePath, `${photo.id}.jpg`);

		if (isImage(flags.save)) {
			filename = savePath;
		}
	}

	const remotePhoto = new RemoteFile(url, filename);

	remotePhoto.download().then(async fileInfo => {
		config.set('counter', config.get('counter') + 1);

		if (!flags.quiet) spinner.succeed();
		if (setAsWP && !flags.save) {
			if (flags.screen || flags.scale) {
				if (process.platform !== 'darwin') {
					console.log();
					logger.warn(chalk `{dim > Sorry, this function ({underline ${flags.screen ? '"screen"' : '"scale"'}}) is available {bold only on MacOS}}`);
					console.log();
				}
			}

			let screen;
			if (flags.screen) {
				if (!/[0-9|main|all]+/g.test(flags.screen)) {
					screen = false;
				} else {
					screen = flags.screen;
				}
			}

			let scale;
			if (flags.scale) {
				if (!/[auto|fill|fit|stretch|center]/g.test(flags.scale)) {
					scale = false;
				} else {
					scale = flags.scale;
				}
			}


			if (scale) {
				await wallpaper.set(filename, { scale });
			} else if (screen) {
				await wallpaper.set(filename, { screen });
			} else if (scale && screen) {
				await wallpaper.set(filename, { screen, scale });
			} else {
				await wallpaper.set(filename);
			}

		} else {
			console.log();
			printBlock(chalk `Picture stored at: {underline ${path.join(fileInfo.dir, fileInfo.base)}}`);
			console.log();
		}

		console.log();

		showCopy(photo, flags.info);

		console.log();

		if (!config.has('user')) {
			logger.info(chalk `{dim Login to like this photo.}`);
			console.log();
			return;
		} else if (photo.liked_by_user) {
			logger.info(chalk `{dim Photo liked by user.}`);
			console.log();
			return;
		}

		if (flags.save) return;

		const promptLike = config.get('askForLike');
		const promptCollection = config.get('askForCollection');

		const { liked } = await prompt([{
			name: 'liked',
			message: 'Do you like this photo?',
			type: 'confirm',
			default: true,
			when: () => promptLike && photo.liked_by_user == false && !flags.quiet
		}, {
			name: 'addToCollection',
			message: 'Do you want add this photo to a collection?',
			default: false,
			when: () => promptCollection && !flags.quiet
		}]);

		if (liked === true) {
			const id = photo._id || photo.id;

			try {
				await User.likePhoto(id);

				console.log();
				console.log('Photo liked.');
			} catch (error) {
				errorHandler(error);
			}
		}
	});
}

/**
 * Log utilty
 */
export const logger = {
	info: console.log.bind(console, chalk.cyan(figures.info)),
	warn: console.log.bind(console, chalk.yellow(figures.warning)),
	error: console.log.bind(console, chalk.red(figures.cross)),
};

/**
 * @description Highlight json
 * @param {Object} data 
 */
export function highlightJSON(data) {
	let jsonString = JSON.stringify(data, null, 2);

	jsonString = jsonString.replace(/[\{|\}|\,|\:|\[|\]]+/g, chalk `{dim $&}`);
	jsonString = jsonString.replace(/\".*?\"/g, chalk `{yellow $&}`);
	jsonString = jsonString.replace(/(\s+)(\d+)/g, chalk `$1{cyan $2}`);
	jsonString = jsonString.replace(/null|undefined/gi, chalk `{dim $&}`);
	jsonString = jsonString.replace(/true|false/gi, chalk `{magenta $&}`);

	return jsonString;
}

/**
 * @name printBlock
 * @description Clear the output before log
 */
export function printBlock() {
	for (var _len = arguments.length, lines = Array(_len), _key = 0; _key < _len; _key++) {
		lines[_key] = arguments[_key];
	}

	console.clear();
	console.log();

	if (lines.length > 1) {
		for (var i = 0; i < lines.length; i++) {
			var line = lines[i];
			console.log(line);
		}
	} else {
		console.log(lines[0]);
	}

	console.log();
}


/**
 * @description Replaces '~' with home folder
 * @param {String} path 
 */
export function pathFixer(path) {
	var tester = /^~.*?/g;

	if (tester.test(path)) {
		path = path.replace(tester, (0, os.homedir)());
	}

	return path;
}

/**
 * 
 * @name addTimeTo
 * @description Add an amount of milliseconds to a date
 * 
 * @param {Date} date
 * @param {Number} time 
 */
export const addTimeTo = (date, time) => new Date(date.getTime() + time);

/**
 * @name now
 * @description Get the current date
 */
export const now = () => new Date();