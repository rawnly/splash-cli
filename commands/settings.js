const Conf = require('conf');
const inquirer = require('inquirer');
const chalk = require('chalk');
const clear = require('clear');
const frun = require('first-run');

const config = new Conf();
const { pathParser } = require('../libs/utils');

module.exports = async (command, restore = false) => {
	clear();
	
	if (!restore) {
		let questions = [];
		const choices = ['raw', 'full', 'regular', 'thumb'];

		const authQuestion = {
			name: 'auth',
			message: 'Access Token',
			default: config.get('auth-key'),
			validate: token => {
				const regex = /[a-z0-9]/g;
				return regex.test(token) ? true : 'Invalid token';				
			}
		};

		const sizeQuestion = {
			name: 'size',
			message: 'Image size',
			type: 'list',
			default: choices.indexOf(config.get('pic-size')),
			choices
		};

		const directoryQuestion = {
			name: 'directory',
			message: 'Default download path: ',
			default: config.get('directory'),
			filter: pathParser,
			validate: input => {
				input = input.trim;
				return input !== '';
			}
		};

		if (command[1]) {
			switch (command[1]) {
				case 'size':
					questions.push(sizeQuestion);
					break;
				case 'auth':
					questions.push(authQuestion);
					break;
				case 'dir':
				case 'directory':
					questions.push(directoryQuestion);
					break;
				default:
					questions.push(sizeQuestion, authQuestion, directoryQuestion);
					break;
			}
		} else {
			questions.push(sizeQuestion, authQuestion, directoryQuestion);
		}

		// get answers
		const {size, auth, directory} = await inquirer.prompt(questions);

		// Strong confirmation. keep user focus and prevent an accidental confirmation.
		const {confirm} = await inquirer.prompt([{
			name: 'confirm',
			message: chalk`Confirm ({yellow {bold yes}}/{yellow {bold no}}):`,
			validate: input => {
				if (input === 'yes' || input === 'no') {
					return true;
				} else if (input === 'ye' || input === 'y') {
					return chalk`Please type "{yellow {bold yes}}"`;
				} else if (input === 'n' || input === 'o') {
					return chalk`Please type "{yellow {bold no}}"`;
				}

				return chalk`Please type "{yellow {bold yes}}" or "{yellow {bold no}}"`;
			}
		}]);

		if (confirm === 'yes') {
			if (size) {
				config.set('pic-size', size);				
			} 

			if (auth) {
				config.set('auth-key', auth);				
			}
			
			if ( directory ) {
				config.set('directory', directory);
			}

			clear();
			console.log();
			console.log(chalk`{green Settings created!}`);
			console.log();
		} else {
			clear();
			console.log();
			console.log(chalk`{red Operation aborted}`);
			console.log();
		}
	} else {
		// if restore
		frun.clear();
		clear();

		console.log();
		console.log(chalk`{green Settings restored.}`);
		console.log();
	}
};
