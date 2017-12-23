require('babel-polyfill');

const Conf = require('conf');
const inquirer = require('inquirer');
const chalk = require('chalk');
const clear = require('clear');
const frun = require('first-run');

const config = new Conf();
const quit = process.exit;

const {pathParser, printBlock} = require('../libs/utils');

module.exports = async ({size, directory, auth} = {}, {restore} = {}) => {
	clear();

	if (restore) {
		frun.clear();
		printBlock(chalk`{green Settings restored.}`);
		quit();
	}

	const questions = [];
	const choices = ['raw', 'full', 'regular', 'thumb'];

	const authQuestion = {
		name: '_auth',
		message: 'Access Token',
		default: config.get('auth-key'),
		validate: token => {
			const regex = /[a-z0-9]/g;
			return regex.test(token) ? true : 'Invalid token';
		}
	};

	const sizeQuestion = {
		name: '_size',
		message: 'Image size',
		type: 'list',
		default: choices.indexOf(config.get('pic-size')),
		choices
	};

	const directoryQuestion = {
		name: '_directory',
		message: 'Default download path: ',
		default: config.get('directory'),
		filter: pathParser,
		validate: input => {
			input = input.trim();
			return input !== '';
		}
	};

	if (size || auth || directory) {
		if (size) {
			questions.push(sizeQuestion);
		}

		if (auth) {
			questions.push(authQuestion);
		}

		if (directory) {
			questions.push(directoryQuestion);
		}
	} else {
		questions.push(sizeQuestion, directoryQuestion);
	}

	// Get answers
	const {_size, _auth, _directory} = await inquirer.prompt(questions);

	// Strong confirmation. keep user focus and prevent an accidental confirmation.
	const {confirm} = await inquirer.prompt([{
		name: 'confirm',
		message: chalk`Confirm ({yellow {bold yes}}/{yellow {bold no}}):`,
		validate: input => {
			if (input === 'yes' || input === 'no') {
				return true;
			}

			if (input === 'ye' || input === 'y') {
				return chalk`Please type "{yellow {bold yes}}"`;
			}

			if (input === 'n' || input === 'o') {
				return chalk`Please type "{yellow {bold no}}"`;
			}

			return chalk`Please type "{yellow {bold yes}}" or "{yellow {bold no}}"`;
		}
	}]);

	if (confirm === 'yes') {
		if (_size) {
			config.set('pic-size', _size);
		}

		if (_auth) {
			config.set('auth-key', _auth);
		}

		if (_directory) {
			config.set('directory', _directory);
		}

		printBlock(chalk`{green Settings created!}`);
	} else {
		printBlock(chalk`{red Operation aborted}`);
	}
};
