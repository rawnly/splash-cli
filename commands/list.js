const fs = require('fs');
const defaults = require('../defaults.json');
const utils = require('../libs/utils');
const chalk = require('chalk');
const {
	exit
} = process;

const {
	pathParser,
	printBlock
} = utils;

module.exports = values => {
	const [write, out] = Object.keys(values);

	const folder = pathParser(defaults.directory);
	const exists = fs.existsSync(folder);

	if (exists) {
		let file = 'splash_list';
		let files = fs.readdirSync(folder);

		const EXTENSION_REGEX = /\.[a-z]{2,}$/;

		files = files.filter(pic => {
			return EXTENSION_REGEX.test(pic);
		}).map(item => {
			return item.replace(EXTENSION_REGEX, '');
		});

		let list = {
			photos: files,
			count: files.length
		};

		if (write) {
			if (out) {
				file = out.split(':').pop().replace(EXTENSION_REGEX, '.json');
			}

			fs.writeFileSync(file, JSON.stringify(list));
			printBlock(chalk`{green List exported} [{yellow ${file}}]`);
			exit();
		}

		printBlock(list);
	}

	return true;
};
