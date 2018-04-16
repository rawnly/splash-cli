require('babel-polyfill');

import opn from 'opn';
import Ora from 'ora';
import Conf from 'conf';

import printBlock from '@splash-cli/print-block';

import {
	URL
} from 'url';

import chalk from 'chalk';
import got from 'got';
import normalize from 'normalize-url';

const spinner = new Ora({
	text: 'Connecting to Unsplash',
	color: 'yellow',
	spinner: 'earth'
});

const config = new Conf();

const api = {
	base: 'https://api.unsplash.com',
	token: process.env.SPLASH_TOKEN,
	oauth: normalize(`https://unsplash.com/oauth/authorize?client_id=${process.env.SPLASH_TOKEN}&redirect_uri=urn:ietf:wg:oauth:2.0:oob&response_type=code&scope=public`)
};

const checkArchivments = () => {
	let unlocked = false;
	const list = config.get('archivments');
	const counter = config.get('counter');

	if (list) {
		list.forEach(archivment => {
			if (counter === archivment.downloads) {
				unlocked = archivment;
			}
		});
	}

	return unlocked;
};

// Silence please
const silence = () => {
	spinner.start = () => {};
	spinner.stop = () => {};
	spinner.fail = () => {};
	spinner.succeed = () => {};

	console.log = () => {};
	console.error = () => {};
	console.warn = () => {};
};

// Open a url in the browser
const openURL = (flags, url) => {
	spinner.text = 'Waiting for authorization token...';

	if (!flags.quiet) {
		spinner.start();
	}

	return new Promise((resolve, reject) => {
		const op = opn(url);

		if (op) {
			spinner.succeed();
			resolve(url);
		} else {
			spinner.fail();
			reject(url);
		}
	});
};

// Capitalize a string
const capitalize = (string, separator = ' ') => {
	let words = string.split(separator);
	words = words.map(word => {
		return word.charAt(0).toUpperCase() + word.substr(1, word.length);
	});

	return words.join(separator);
};

// Parse url / id;
const parseID = id => {
	const regex = /[a-zA-Z0-9_-]{11}/g;

	id = id.toString();

	if (regex.test(id)) {
		return id.match(regex)[0];
	}

	return false;
};

const parseCollection = alias => {
	const aliases = config.get('aliases');

	const collection = aliases.filter(item => {
		return item.name === alias;
	}).shift();

	if (collection) {
		return collection;
	}

	return false;
};

const collectionInfo = async id => {
	try {
		let {
			body
		} = await got(`${api.base}/collections/${id}?client_id=${api.token}`);
		body = JSON.parse(body);

		return {
			id: body.id,
			title: body.title,
			description: body.description,
			user: body.user.username,
			featured: body.featured,
			curated: body.curated
		};
	} catch (error) {
		throw new Error(error);
	}
};

const parseCollectionURL = url => {
	let collectionArguments = [];
	let collection = {};
	let COLLECTION_REGEX;

	const isCurated = /\/curated\//g.test(url);

	if (isCurated) {
		COLLECTION_REGEX = /[a-zA-z-]+\/[0-9]+/;
	} else {
		COLLECTION_REGEX = /[0-9]+\/[a-zA-z-]+/;
	}

	if (COLLECTION_REGEX.test(url)) {
		collectionArguments = url.match(COLLECTION_REGEX)[0].split('/');

		if (isCurated) {
			collection.name = collectionArguments[0];
			collection.id = collectionArguments[1];
		} else {
			collection.name = collectionArguments[1];
			collection.id = collectionArguments[0];
		}

		return collection;
	}

	return url;
};

/**
 * @name downloadFlags
 * @description Set download flags
 * @author Federico Vitale
 *
 * @link https://codereview.stackexchange.com/questions/180006/how-can-i-make-my-function-easier-to-read-understand?noredirect=1#comment341954_180006
 *
 * @param {String} url
 * @param {String} param1
 */
const downloadFlags = async (url, {
	id,
	user,
	orientation,
	query,
	collection,
	featured
} = {}) => {
	const ORIENTATIONS = {
		landscape: 'landscape',
		horizontal: 'landscape',
		portrait: 'portrait',
		vertical: 'portrait',
		squarish: 'squarish',
		square: 'squarish'
	};

	if (id) {
		id = parseID(id);
		if (!id) {
			printBlock(chalk`{red {bold Invalid}} {yellow url/id}`);
		}

		return `${api.base}/photos/${id}?client_id=${api.token}`;
	}

	const parsedURL = new URL(url);

	if (orientation) {
		orientation = ORIENTATIONS[orientation] || config.get('orientation') || undefined;
		parsedURL.searchParams.set('orientation', orientation);
	}

	const finalizeUrlWith = (name, value) => {
		parsedURL.searchParams.set(name, value);
		return parsedURL.href;
	};

	if (query) {
		finalizeUrlWith('query', query.toLowerCase());
	}

	if (user) {
		finalizeUrlWith('username', user.toLowerCase());
	}

	if (featured) {
		finalizeUrlWith('featured', true);
	}

	if (collection) {
		collection = parseCollectionURL(collection);
		if (collection.id && collection.name) {
			collection = collection.id;
		}

		const {
			value = /[0-9]{3,7}|$/.exec(collection)[0]
		} = parseCollection(collection) || {};

		if (!value) {
			printBlock(chalk`{red Invalid collection ID}`);
			process.exit();
		}

		const info = await collectionInfo(value);

		let message = chalk`Collection: {cyan ${info.title}} by {yellow @${info.user}}`;

		if (info.featured || info.curated) {
			message = `[${[
				info.curated ? 'Curated - ' : '',
				info.featured ? 'Featured' : ''
			].join('')}] ${message}`;
		}

		printBlock(message);

		return finalizeUrlWith('collections', info.id);
	}

	return parsedURL.href;
};

module.exports = {
	checkArchivments,
	parseID,
	parseCollection,
	parseCollectionURL,
	openURL,
	capitalize,
	collectionInfo,
	downloadFlags,
	silence
};
