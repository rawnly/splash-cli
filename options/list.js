// Modules
const fs = require('fs');
const Conf = require('conf');
const chalk = require('chalk');
const clear = require('clear');

// Variables
const jparse = JSON.parse;
const jstringify = JSON.stringify;
const config = new Conf();
const log = console.log;

// Init
module.exports = fl => {
	fs.readdir(config.get('pic_dir'), (err, files) => {
		if (err) {
			throw new Error(err);
		} else if (files[0]) {
			let list = [];

			files.sort();
			files.forEach(item => {
				if (item.charAt(0) !== '.' && item !== 'thumbs') {
					const newItem = item.slice(0, item.length - 4);
					list.push(newItem);
				}
			});

			clear();

			if (!list.length > 0) {
				log();
				log(chalk.yellow('Splash:') + chalk.gray(' No photos found'));
				log();
				return false;
			}

			log('');
			log(`${chalk.yellow.bold(list.length)} Photos`);
			log('');

			list.sort();

			list = jstringify(list);
			list = jparse(list);

			if (!fl.export) {
				log(list);
				log('');
			}

			if (fl.export && list.length > 0) {
				fs.writeFile('./list.json', jstringify(list), error => {
					if (error) {
						throw new Error(err);
					}
					log('---');
					log(`File written at: ${chalk.blue('./list.json')}`);
					log('');
				});
			}
		} else {
			log('---');
			log(chalk.yellow('Splash:') + chalk.gray(' The directory is empty'));
			log('');
		}
	});
};
