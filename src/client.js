require('babel-polyfill');

import isMonth from '@splash-cli/is-month';
import parseID from '@splash-cli/parse-unsplash-id';
import chalk from 'chalk';
import Conf from 'conf';
import frun from 'first-run';
import fs from 'fs';
import randomFrom from 'lodash/sample';
import mkdirp from 'mkdirp';
import Ora from 'ora';
import { userInfo } from 'os';
import updateNotifier from 'update-notifier';
import wallpaper from 'wallpaper';
import isImage from 'is-image';

import fetch from 'isomorphic-fetch';

import manifest from '../package.json';
import commands from './commands/index';

import { defaultSettings, unsplash } from './extra/config';
import {
	clearSettings,
	download,
	errorHandler,
	parseCollection,
	picOfTheDay,
	printBlock,
	pathFixer
} from './extra/utils';

const config = new Conf({
	defaults: defaultSettings
});

const {
	photos: {
		getRandomPhoto,
		getPhoto,
		listCuratedPhotos,
		downloadPhoto
	}
} = unsplash;

const spinner = new Ora({
	color: 'yellow',
	spinner: isMonth('december') ? 'christmas' : 'earth'
});

export default async function (input, flags) {
	const [command, ...subCommands] = input;
	const options = {};

	// Parse commands
	for (let i = 0; i < subCommands.length; i += 1) {
		options[subCommands[i]] = subCommands[i];
	}


	if (flags.quiet) {
		const emptyFunction = () => null;

		console.log = console.info = emptyFunction;

		if (spinner.fail) {
			spinner.fail = emptyFunction;
		}

		if (spinner.start) {
			spinner.start = emptyFunction;
		}

		if (spinner.succeed) {
			spinner.succeed = emptyFunction;
		}
	}

	if (!config.get('directory') || !config.has('directory')) {
		config.set('directory', pathFixer('~/Pictures/splash_photos'));
	}

	if (fs.existsSync(config.get('directory'))) {
		mkdirp(config.get('directory'), error => {
			if (error) return errorHandler(error);
		});
	}

	updateNotifier({ pkg: manifest, updateCheckInterval: 1000 * 30 }).notify();

	if (frun()) {
		await clearSettings();
		await picOfTheDay();

		printBlock(
			chalk `Welcome to ${manifest.name}@${manifest.version} {bold @${userInfo().username}}`,
			chalk `{dim Application setup {green completed}!}`,
			chalk `{bold Enjoy "{yellow ${manifest.name}}" running {green splash}}`
		);

		process.exit();
	} else if (!config.has('pic-of-the-day') || !config.get('pic-of-the-day').date.delay) {
		await picOfTheDay();
	}


	if (!command) {
		console.clear();
		if (!flags.me && !flags.updateMe && !flags.set) spinner.start('Connecting to Unsplash');

		if (flags.set) {
			const filePath = pathFixer(flags.set);

			if (fs.existsSync(filePath) && isImage(filePath)) {
				let options = {};

				if (flags.scale) options.scale = flags.scale;
				if (flags.screen) options.screen = flags.screen;

				wallpaper.set(filePath, options);

				return printBlock('Wallpaper updated!');
			}

			return errorHandler('File not found.');
		}

		try {
			let photo = false;

			// here you can add your own custom flags
			if (flags.day) {
				const response = await getPhoto(await picOfTheDay());
				photo = await response.json();
			} else if (flags.curated) {
				const response = await listCuratedPhotos();
				const photos = await response.json();

				photo = randomFrom(photos);
			} else if (flags.id && parseID(flags.id)) {
				const response = await getPhoto(parseID(flags.id));
				photo = await response.json();
			} else {
				if (flags.id) {
					spinner.warn = chalk `Invalid ID: "{yellow ${flags.id}}"`;
				}

				const response = await getRandomPhoto({
					query: flags.query,
					username: flags.user,
					featured: Boolean(flags.featured),
					collections: flags.collection ? (flags.collection.includes(',') ? flags.collection.split(',').map(parseCollection) : [parseCollection(flags.collection)]) : undefined,
					count: 1
				});

				photo = await response.json();
			}

			if (photo) {
				spinner.succeed('Connected!');

				if (Array.isArray(photo)) {
					photo = photo[0];
				}

				if (photo.errors) {
					return printBlock(chalk `{bold {red ERROR:}}`, ...photo.errors);
				}

				const res = await downloadPhoto(photo);
				const { url } = await res.json();

				await download(photo, url, flags, true);
			} else {
				spinner.fail('Unable to connect.');
			}
		} catch (error) {
			spinner.fail();
			return errorHandler(error);
		}
	} else {
		console.clear();

		switch (command) {
		case 'settings':
		case 'config':
			commands.settings(subCommands);
			break;
		case 'alias':
		case 'aliases':
			commands.alias(subCommands);
			break;
		case 'user':
			commands.user(subCommands);
			break;
		case 'directory':
		case 'dir':
			commands.dir(subCommands);
			break;
		default:
			printBlock(
				chalk `{bold {red Error}}: "{yellow ${command}}" is not a {dim splash} command.`,
				'',
				chalk `See {dim splash --help}`
			);
			break;
		}
	}
}