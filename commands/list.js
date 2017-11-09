const fs = require('fs');
const defaults = require('../defaults.json');
const utils = require('../libs/utils');
const clear = require('clear');

const {pathParser} = utils;

module.exports = (write = false, file = './splash_photos') => {
	clear();

	const folder = pathParser(defaults.directory);

	const exists = fs.existsSync(folder);

	if (exists) {
		const extRegex = /\.[a-z]{3}$/;
		let list = fs.readdirSync(folder);
		list = list.filter(pic => {
			return extRegex.test(pic);
		});

		list = list.map(item => {
			return item.replace(extRegex, '');
		});

		list = {photos: list, count: list.length};

		file = file.replace(/\.\w{1,4}/g, '');

		if (write) {
			fs.writeFileSync(`${file}.json`, JSON.stringify(list));
			console.log();
			console.log('List exported');
			console.log();
		}

		return list;
	}
};
