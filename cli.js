#! /usr/bin/env node

/**
 * Author: Federico Vitale <fedevitale99@gmail.com>
 * Link: https://github.com/Rawnly
 * Copyright 2017 Federico Vitale
 */

const path = require('path');
const fs = require('fs');

const inquirer = require('inquirer');
const got = require('got');
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

// UTILS
const {parseID, pathParser, collectionInfo, parseCollection, splashError, openURL} = require('./libs/misc');

const api = {
	base: 'https://api.unsplash.com',
	token: 'daf9025ad4da801e4ef66ab9d7ea7291a0091b16d69f94972d284c71d7188b34',
	oauth: normalize('https://unsplash.com/oauth/authorize?client_id=daf9025ad4da801e4ef66ab9d7ea7291a0091b16d69f94972d284c71d7188b34&redirect_uri=urn:ietf:wg:oauth:2.0:oob&response_type=code&scope=public')
};

const spinner = new Ora();
const join = path.join;
const notifier = updateNotifier({pkg, updateCheckInterval: 1000});

// LOAD DEFAULT CONFIGS
const defaults = require('./defaults.json');
defaults.pic_dir = pathParser(defaults.pic_dir);

const config = new Conf();
const cli = new Meow({
	flags: {
		collection: {
			type: 'string',
			alias: 'col'
		},
		user: {
			type: 'string'
		},
		size: {
			type: 'string',
			alias: 'q',
			default: 'full'
		},
		settings: {
			type: 'boolean'
		},
		id: {
			type: 'string'
		},
		query: {
			type: 'string'
		},
		orientation: {
			type: 'string'
		}
	},
	aliases: {
		h: 'help',
		v: 'version'
	}
});

async function client(command, flags) {
	// On first run.
	if (frun() && !flags.restore) {
		mkdirp.sync(defaults.pic_dir);
		
		// automatically add it
		Object.keys(defaults).forEach(setting => {
			config.delete( setting )			
			config.set( setting, defaults[setting] )
		});

		figlet('splash', (err, data) => {
			if (err) {
				splashError(err);
			} else {
				console.log(data);				
			}
		});
	}

	if (!config.get('pic_dir')) {
		config.set('pic_dir', defaults.pic_dir);
	}
	
	const splashFolder = fs.existsSync(config.get('pic_dir'));
	if (!splashFolder) {
		mkdirp.sync(config.get('pic_dir'));
	}

	if (command.length >= 1) {
		switch (command[0]) {
			case 'alias':
				let aliases = config.get('aliases');
				const newAlias = {
					name: command[1],
					value: command[2]
				};
				
				let exists = aliases.filter(alias => {
					return (alias.name === newAlias.name) || (alias.value === newAlias.value);
				});

				if ( exists.length ) {
					exists = exists.first();
					clear();
					console.log();
					console.log('That alias exists!', chalk`[{yellow ${exists.name}} = {yellow ${exists.value}}]`);
					console.log();
					break;
				}

				aliases.push(newAlias);

				config.set('aliases', aliases);

				clear();
				console.log();
				console.log('Alias saved.', chalk`[{yellow ${newAlias.name}} = {yellow ${newAlias.value}}]`);
				console.log();
				break;
			case 'save':
				clear();
				console.log('Save cmd');
				break;
			case 'restore':
				commands.settings(true);
				break;
			case 'settings':
				commands.settings();
				break;
			default:
				clear();
				console.log('Invalid command');
				break;
		}
	} else if (flags.settings) {
		console.log( config.get() );
	} else {
		let url = `${api.base}/photos/random?client_id=${api.token}`;

		if (flags.id) {
			const id = parseID(flags.id);

			if (!id) {
				clear();
				console.log(chalk`{red {bold Invalid}} {yellow url/id}`);
			}

			url = `${api.base}/photos/${id}?client_id=${api.token}`;
		} else {
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
						orientation = config.get('orientation') || undefined
						break;
				}
	
				url += setUriParam('orientation', orientation);
			}
	
			if (flags.query) {
				const query = encodeURIComponent(flags.query.toLowerCase());
				url += setUriParam('query', query);
			} else if (flags.featured) {
				url += setUriParam('featured', true);
			} else if (flags.user) {
				const username = flags.user.toLowerCase();
				url += setUriParam('username', username);
			} else if (flags.collection) {
				let collection;				
				const regex = /[0-9]{3,7}/g;
				const isAlias = parseCollection(flags.collection);
				const isCollection = regex.test(flags.collection) || (!isNaN(Number(flags.collection)) && Number(flags.collection) >= 251);

				if ( isAlias ) {
					collection = await collectionInfo(isAlias.value);
				} else {
					if ( isCollection ) {
						collection = await collectionInfo( flags.collection.toString().match(regex)[0] );		
					} else {
						clear();
						console.log();
						console.log(chalk`{red Invalid collection ID}`);
						console.log();
						process.exit();
					}
				}

				clear()
				console.log();

				let message = chalk`Collection: {cyan ${collection.title}} by {yellow @${collection.user}}`;
				
				if (collection.featured && collection.curated) {
					message = '[Featured - Curated] ' + message;					
				} else if (collection.featured) {
					message = '[Featured] ' + message;
				} else if (collection.curated) {
					message = '[Curated]'
				} 

				console.log(message);		
				
				console.log();
				url += setUriParam('collections', collection);
			}
		}



		const response = await splash(url);
		const photo = response.data;
		const {statusCode} = response.status;

		if (statusCode === 200) {
			download(flags, photo);
		}
	}
}

client(cli.input, cli.flags);


function setUriParam(key, value) {
	return `&${key}=${value.toString()}`;
}