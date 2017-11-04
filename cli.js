#! /usr/bin/env node

/**
 * Author: Federico Vitale <fedevitale99@gmail.com>
 * Link: https://github.com/Rawnly
 * Copyright 2017 Federico Vitale
 */

const path = require('path');
const fs = require('fs');

const figlet = require('figlet');
const frun = require('first-run');
const mkdirp = require('mkdirp');
const chalk = require('chalk');
const normalize = require('normalize-url');
const updateNotifier = require('update-notifier');
const clear = require('clear');

const Ora = require('ora');
const Conf = require('conf');
const Meow = require('meow');

const splash = require('./libs/core');
const download = require('./libs/download');

const pkg = require('./package.json');

let commands = {};
commands.settings = require('./commands/settings');
commands.list = require('./commands/list');


// UTILS
const {setUriParam, parseID, pathParser, collectionInfo, parseCollection, splashError} = require('./libs/utils');

const api = {
	base: 'https://api.unsplash.com',
	token: 'daf9025ad4da801e4ef66ab9d7ea7291a0091b16d69f94972d284c71d7188b34',
	oauth: normalize('https://unsplash.com/oauth/authorize?client_id=daf9025ad4da801e4ef66ab9d7ea7291a0091b16d69f94972d284c71d7188b34&redirect_uri=urn:ietf:wg:oauth:2.0:oob&response_type=code&scope=public')
};

const spinner = new Ora();
const notifier = updateNotifier({pkg, updateCheckInterval: 1000});

// LOAD DEFAULT CONFIGS
const defaults = require('./defaults.json');

// parse default path
defaults.directory = pathParser(defaults.directory);

const config = new Conf();
const cli = new Meow({
	flags: {
		collection: {
			type: 'string',
			alias: 'col'
		},
		size: {
			type: 'string',
			alias: 'q',
			default: 'full'
		},
		user: { type: 'string' },
		settings: { type: 'boolean' },
		id: { type: 'string' },
		query: { type: 'string' },
		orientation: { type: 'string' },
		save: { type: 'boolean' }
	},
	aliases: {
		h: 'help',
		v: 'version'
	}
});

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

	// if directory is not setted use the default one
	if (!config.get('directory')) {
		config.set('directory', defaults.directory);
	}

	// check if the directory exists, if not create it.
	const splashFolder = fs.existsSync(config.get('directory'));
	if (!splashFolder) {
		mkdirp.sync(config.get('directory'));
	}

	// parsing subcommands
	if (command.length >= 1) {
		switch (command[0]) {
			// create a new alias
			case 'alias':

				// get current aliases
				let aliases = config.get('aliases');

				// setup new alias
				const newAlias = {
					name: command[1],
					value: command[2]
				};

				// check if the alias exists with the same name / value (id)
				let exists = aliases.filter(alias => {
					return (alias.name === newAlias.name) || (alias.value === newAlias.value);
				});

				// if exists warn the user
				if (exists.length > 0) {
					exists = exists.first();
					clear();
					console.log();
					console.log('That alias exists!', chalk`[{yellow ${exists.name}} = {yellow ${exists.value}}]`);
					console.log();
					break;
				}

				// if not push it to the array
				aliases.push(newAlias);

				// set it in the config
				config.set('aliases', aliases);

				// send a response
				clear();
				console.log();
				console.log('Alias saved.', chalk`[{yellow ${newAlias.name}} = {yellow ${newAlias.value}}]`);
				console.log();
				break;
			case 'restore':
				// restore default settings
				commands.settings(command, true);
				break;
			case 'settings':
				// setup auth and quality settings
				commands.settings(command);
				break;
			default:
				clear();
				console.log();
				console.log('Invalid command');
				console.log();
				break;
		}
	} else if (flags.settings && process.env.NODE_ENV === 'development') {
		// show up current settigns [ only dev]
		console.log(config.get());
	} else {
		// core of splash, download a random photo

		// default API URL
		let url = `${api.base}/photos/random?client_id=${api.token}`;

		// if id is specified download photo by "id"
		if (flags.id) {
			// parse photo "id" form "photo url" and validate it.
			const id = parseID(flags.id);

			if (!id) {
				clear();
				console.log(chalk`{red {bold Invalid}} {yellow url/id}`);
			}

			// Change API URL
			url = `${api.base}/photos/${id}?client_id=${api.token}`;
		} else {
			// Search filters

			// Photo ORIENTATION
			if (flags.orientation) {
				let orientation;
				switch (flags.orientation) {
					case 'landscape':
					case 'horizontal':
						orientation = 'landscape';
						break;

					case 'portrait':
					case 'vertical':
						orientation = 'portrait';
						break;

					case 'squarish':
					case 'square':
						orientation = 'squarish';
						break;
					default:
						orientation = config.get('orientation') || undefined;
						break;
				}

				url += setUriParam('orientation', orientation);
			}

			if (flags.query) {
				// SEARCH PHOTO BY KEYWORD
				const query = encodeURIComponent(flags.query.toLowerCase());
				url += setUriParam('query', query);
			} else if (flags.featured) {
				// GET RANDOM FEATURED PHOTO
				url += setUriParam('featured', true);
			} else if (flags.user) {
				// GET RANDOM PHOTO FROM GIVEN USERNAME
				const username = flags.user.toLowerCase();
				url += setUriParam('username', username);
			} else if (flags.collection) {
				// GET RANDOM PHOTO FROM GIVEN COLLECTION				
				let collection;
				const regex = /[0-9]{3,7}/g;

				// check if the input given is a valid ALIAS
				const isAlias = parseCollection(flags.collection);

				// check if the input given is a valid collection id
				const isCollection = regex.test(flags.collection) || (!isNaN(Number(flags.collection)) && Number(flags.collection) >= 251);

				if (isAlias) {
					// grab infos 
					collection = await collectionInfo(isAlias.value);
				} else if (isCollection) {
					// grab infos 
					collection = await collectionInfo(flags.collection.toString().match(regex)[0]);
				} else {
					// some response if data is no valid.
					clear();
					console.log();
					console.log(chalk`{red Invalid collection ID}`);
					console.log();
					process.exit();
				}

				clear();
				console.log();

				// Output the collection infos.
				let message = chalk`Collection: {cyan ${collection.title}} by {yellow @${collection.user}}`;

				if (collection.featured && collection.curated) {
					message = '[Featured - Curated] ' + message;
				} else if (collection.featured) {
					message = '[Featured] ' + message;
				} else if (collection.curated) {
					message = '[Curated]';
				}

				console.log(message);
				console.log();

				// Update the URL
				url += setUriParam('collections', collection);
			}
		}

		// response from URL
		const response = await splash(url);

		// Get the photo
		const photo = response.data;

		// Request status information
		const {statusCode} = response.status;

		// if --save do not set it as wallpaper
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

// call the function
client(cli.input, cli.flags);