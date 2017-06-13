// Modules

const path = require('path');
const normalize = require('normalize-url');
const Conf = require('conf');
const mkdirp = require('mkdirp');
const download = require('../libs/download');
const splash = require('../libs/core');

const token = 'daf9025ad4da801e4ef66ab9d7ea7291a0091b16d69f94972d284c71d7188b34';
const apiUrl = normalize(`https://api.unsplash.com/photos/random?client_id=${token}`);
const join = path.join;
const config = new Conf();

// Init
module.exports = fl => {
	let width;
	let height;
	let url;
	let prefix;
	const size = fl.size.toString().split('x');

	if (size.length === 2) {
		width = fl.size.toString().split('x')[0];
		height = fl.size.toString().split('x')[1];
		prefix = `${width}x${height}`;
		url = `${apiUrl}&w=${width}&h=${height}`;
	} else {
		width = fl.size.toString().split('x')[0];
		prefix = `${width}`;
		url = `${apiUrl}&w=${width}`;
	}

	mkdirp(config.get('pic_dir'), e => {
		if (e) {
			throw new Error(e);
		}
	});

	if (fl.size && fl.set) {
		splash(url, photo => {
			download({
				filename: join(config.get('pic_dir'), `${prefix}_${photo.id}.jpg`),
				photo,
				custom: true
			}, fl);
		});
	} else {
		splash(url, photo => {
			download({
				filename: join(config.get('pic_dir'), `${prefix}_${photo.id}.jpg`),
				photo,
				custom: true
			}, fl, false);
		});
	}
};
