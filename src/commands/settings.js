require('babel-polyfill');
require('regenerator-runtime');

import fetch from 'isomorphic-fetch';

import pathFixer from '@splash-cli/path-fixer';
import printBlock from '@splash-cli/print-block';
import chalk from 'chalk';
import Conf from 'conf';

import { prompt as ask } from 'inquirer';
import { defaultSettings } from '../extra/config';
import { clearSettings, errorHandler, highlightJSON } from '../extra/utils';



const config = new Conf({
	defaults: defaultSettings
});

export default async function settings([action, target]) {
	const questions = [];
  
	if (action) action = action.toString().toLowerCase();
	if (target) target = target.toString().toLowerCase();

	const _directory = generateQuestion('_directory', 'Default download path:', {
		default: config.get('directory'),
		filter: input => pathFixer(input)
	});

	const _askForLike = generateQuestion('_askForLike', 'Prompt to like the downloaded photo after download?', {
		type: 'confirm',
		default: config.get('askForLike')
	});

	const _askForCollection = generateQuestion('_askForCollection', 'Prompt to add the downloaded photo to a collection?', {
		type: 'confirm',
		default: config.get('askForCollection')
	});

	const _userFolder = generateQuestion(
		'_userFolder',
		'Do you want store photos by username?',
		{
			default: config.get('userFolder'),
			type: 'confirm'
		}
	);

	switch (action) {
	case 'get':
		if (target && target.toLowerCase() == 'picoftheday') {
			target = 'pic-of-the-day';
		}

		const settings = target ? config.get(target) : config.get();

		if (settings && !target) {
			settings.picOfTheDay = settings['pic-of-the-day'];
			settings.settingsPath = config.path;

			delete settings['keys'];
			delete settings['user'];
			delete settings['pic-of-the-day'];
		}
      
		if (!settings) {
			return printBlock(chalk`{yellow Settings key: ${target} not available.}`);
		}

		printBlock(chalk`{bold {bgYellow {black SETTINGS}}}\n`, highlightJSON(settings));
		break;
	case 'clear':
	case 'reset':
	case 'restore':
		ask([
			generateQuestion(
				'confirm',
				chalk`Are you sure? This action is {underline NOT reversable}!`,
				{
					type: 'confirm',
					default: false
				}
			)
		])
			.then(async ({ confirm }) => {
				if (confirm) {
					await clearSettings();
					printBlock(chalk`{yellow Settings Restored!}`);
				} else {
					printBlock(chalk`{red {bold Operation aborted!}}`);
				}
			})
			.catch(error => {
				errorHandler(error);
			});
		break;

	case 'set':
	default:
		switch (target) {
		case 'directory':
		case 'dir':
			questions.push(_directory);
			break;
		case 'user':
		case 'user-folder':
		case 'userFolder':
		case 'groups':
			questions.push(_userFolder);
		case 'like':
		case 'askforlike':
			questions.push(_askForLike);
		case 'collection':
		case 'askforcollection':
			questions.push(_askForCollection);
		case 'prompt':
		case 'prompts':
			questions.push(_askForCollection, _askForLike);
		default:
			questions.push(_userFolder, _directory, _askForCollection, _askForLike);
			break;
		}

		const { _userFolder: folder, _directory: dir, _askForCollection: collection, _askForLike: like } = await ask(questions);

		if (folder !== undefined) {
			config.set('userFolder', folder);
			return printBlock(
				chalk`{bold Settings saved!}`,
				'Run:',
				'',
				chalk`{dim $ splash} {green settings {bold get}}`,
				'',
				'To view them.'
			);
		} 
      
		if (dir !== undefined) {
			config.set('directory', dir);
			return printBlock(
				chalk`{bold Settings saved!}`,
				'Run:',
				'',
				chalk`{dim $ splash} {green settings {bold get}}`,
				'',
				'To view them.'
			);
		}

		if (collection !== undefined) {
			config.set('askForCollection', collection);
			return printBlock(
				chalk `{bold Settings saved!}`,
				'Run:',
				'',
				chalk `{dim $ splash} {green settings {bold get}}`,
				'',
				'To view them.'
			);
		}

		if (like !== undefined) {
			config.set('askForLike', collection);
			return printBlock(
				chalk `{bold Settings saved!}`,
				'Run:',
				'',
				chalk `{dim $ splash} {green settings {bold get}}`,
				'',
				'To view them.'
			);
		}

		return printBlock(
			chalk`{bold {red OOPS!}}`,
			chalk`It seems that there were a {red problem} with your {cyan settings}...`,
			'',
			'{green Please try again} or {yellow report the issue} {dim (--report)}'
		);
		break;
	}
}

function generateQuestion(name, message, options = {}) {
	const fieldRequired = input => {
		if (input.length) return true;
		return 'Error: that field is required!';
	};

	options.validate = options.validate || fieldRequired;
	return Object.assign(
		{
			name,
			message,
			prefix: chalk.green('#')
		},
		options
	);
}
