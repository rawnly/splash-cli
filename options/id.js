// Modules

const path = require('path');
const fs = require('fs');
const normalize = require('normalize-url');
const wallpaper = require('wallpaper');
const Conf = require('conf');
const urlRegex = require('url-regex');
const mkdirp = require('mkdirp');
const download = require('../libs/download');
const splash = require('../libs/core');

const token = 'daf9025ad4da801e4ef66ab9d7ea7291a0091b16d69f94972d284c71d7188b34';
const log = console.log;
const join = path.join;
const config = new Conf();

// Init
module.exports = fl => {
	function parse(string) {
    // Return normalize(string).match(urlRegex) ? normalize(string).split('?photo=')[1] : string;
		if (normalize(string).match(urlRegex)) {
			let url = '';

			if (normalize(string).split('?photo=')[1] === undefined) {
				url = normalize(string).split('/photos/')[1];
			} else {
				url = normalize(string).split('?photo=')[1];
			}

			return url;
		}
		return string;
	}

	const id = parse(fl.id) ? parse(fl.id) : fl.id;
	const apiUrlID = `https://api.unsplash.com/photos/${id}?client_id=${token}`;

	mkdirp(config.get('pic_dir'), err => {
		if (err) {
			throw new Error(err);
		}
	});

	fs.exists(join(config.get('pic_dir'), `${id}.jpg`), exists => {
		if (exists === false) {
			splash(apiUrlID, photo => {
				download({
					filename: join(config.get('pic_dir'), `${photo.id}.jpg`),
					photo
				}, fl);
			});
		} else {
			wallpaper.set(join(config.get('pic_dir'), `${id}.jpg`));
			log(`[${id}.jpg] You have this photo locally!`);
		}
	});
};
