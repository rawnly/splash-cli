const Conf = require('conf');
const inquirer = require('inquirer');
const chalk = require('chalk');
const clear = require('clear');
const frun = require('first-run');

const config = new Conf();

module.exports.settings = async (restore = false) => {
	if (!restore) {
		let questions = [];
		const choices = [ "raw", "full", "regular", "thumb" ];
	
		const authQuestion = {
			name: 'auth',
			message: 'Access Token',
			default: config.get('auth-key'),
			validate: token => {
				let regex = /[a-z0-9]/g;
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
	
		if ( command[1] ) {
			switch (command[1]) {
				case 'size':
					questions.push(sizeQuestion)
					break;
				case 'auth':
					questions.push(authQuestion)
					break;
				default: 
					questions.push(sizeQuestion, authQuestion);
					break;
			}
		} else {
			questions.push(sizeQuestion, authQuestion);
		}
		
		const {size, auth} = await inquirer.prompt(questions);
	
		const {confirm} = await inquirer.prompt([{
			name: 'confirm',
			message: chalk`Confirm ({yellow {bold yes}}/{yellow {bold no}}):`,
			validate: input => {
				if (input === 'yes' || input === 'no') {
					return true;
				} else if ( input === 'ye' || input === 'y') {
					return chalk`Please type "{yellow {bold yes}}"`;
				} else if (input === 'n' || input === 'o') {
					return chalk`Please type "{yellow {bold no}}"`;
				}
	
				return chalk`Please type "{yellow {bold yes}}" or "{yellow {bold no}}"`;
			}
		}]);
		
		if (confirm === 'yes') {
			config.set('pic-size', size)				
			config.set('auth-key', auth);
	
			clear();
			console.log()
			console.log(chalk`{green Settings created!}`);
			console.log()
		} else {
			clear();
			console.log()
			console.log(chalk`{red Operation aborted}`);
			console.log()
		}
	} else {
		frun.clear();
		clear();

		console.log()
		console.log(chalk`{green Settings restored.}`);
		console.log()
	}
}