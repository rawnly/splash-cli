const opn = require('opn');
const Ora = require('ora');
const Conf = require('conf');

const os = require('os');

const config = new Conf();
const chalk = require('chalk');
const got = require('got');
const normalize = require('normalize-url');

const spinner = new Ora({text: 'Connecting to Unsplash', color: 'yellow', spinner: 'earth'});

const api = {
	base: 'https://api.unsplash.com',
	token: 'daf9025ad4da801e4ef66ab9d7ea7291a0091b16d69f94972d284c71d7188b34',
	oauth: normalize('https://unsplash.com/oauth/authorize?client_id=daf9025ad4da801e4ef66ab9d7ea7291a0091b16d69f94972d284c71d7188b34&redirect_uri=urn:ietf:wg:oauth:2.0:oob&response_type=code&scope=public')
};

module.exports.checkArchivments = () => {
	let unlocked = false;
	const list = config.get('archivments');
	const counter = config.get('download-counter');

	if (list) {
		list.forEach(archivment => {
			if (counter === archivment.downloads) {
				unlocked = archivment;
			}
		});
	}

	return unlocked;
};

module.exports.showCopy = data => {
	const user = data.user;
	console.log();
	
	if ( data.description ) {
		console.log();
		console.log(chalk.dim(`> ${data.description}`))
		console.log();
	};
	console.log(`Downloaded: ${ uFormatter(data.downloads) } times.`);
	console.log(`Viewed: ${ uFormatter(data.views) } times.`);
	console.log(`Liked by ${ uFormatter(data.likes) } users.`);

	console.log();	
	console.log();

	console.log(`Shot by: ${chalk.cyan.bold(user.name)} (@${chalk.yellow(user.username)})`);
	console.log();
};

module.exports.parseExif = source => {
	if (source.exif) {
		const exif = [];

		Object.keys(source.exif).forEach(item => {
			let current = {};
			current.name = item;
			if (source.exif[item] == undefined || source.exif[item] == '') {
				current.value = '--';
			} else {
				current.value = source.exif[item];
			}

			exif.push(current);
		});

		return exif;
	}

	return false;
};

module.exports.openURL = url => {
	spinner.text = '';
	spinner.start();
	return new Promise(function (resolve, reject) {
		const op = opn(url);

		if (op) {
			spinner.succeed();
			resolve(url);
		} else {
			spinner.fail();
			reject(url);
		}
	});
};

module.exports.splashError = (e, opt = {message: 'Splash Error', colors: {message: 'yellow', error: 'red'}}) => {
	console.log();
	console.log(chalk`{${opt.colors.message} ${opt.message}:} {${opt.colors.error} ${e}}`);

	throw new Error(e);
};

module.exports.capitalize = (string, separator = ' ') => {
	let words = string.split(separator);
	words = words.map(word => {
		return word.charAt(0).toUpperCase() + word.substr(1, word.length);
	});

	return words.join(separator);
};

module.exports.pathParser = path => {
	if (path.includes('~')) {
		path = path.replace('~', os.homedir());
	}

	return path;
};

// parse url / id;
module.exports.parseID = id => {
	const regex = /[a-zA-Z0-9\_\-]{11}/g;

	id = id.toString();

	if (regex.test(id)) {
		return id.match(regex)[0];
	}

	return false;
};

module.exports.parseCollection = alias => {
	const aliases = config.get('aliases');

	const collection = aliases.filter(item => {
		return item.name === alias;
	}).shift();

	if (collection) {
		return collection;
	}

	return false;
};

Array.prototype.first = function () {
	return this[0];
};

module.exports.collectionInfo = async id => {
	try {
		let {body} = await got(`${api.base}/collections/${id}?client_id=${api.token}`);
		body = JSON.parse(body);

		return {
			id: body.id,
			title: body.title,
			description: body.description,
			user: body.user.username,
			featured: body.featured,
			curated: body.curated
		};
	} catch (error) {
		throw new Error(error);
	}
};

module.exports.setUriParam = (key, value) => {
	return `&${key}=${value.toString()}`;
}

function kFormatter(num) {
	if ( num > 999) {
		if ( num % 1000 === 0) {
			return num / 1000 + 'K';
		} else {
			return (num / 1000).toFixed(1) + 'K';
		}
	} else {
		return num;
	}
}

function mFormatter(num) {
	if ( num > 999999) {
		if ( num % 1000000 === 0) {
			return num / 1000000 + 'M';
		} else {
			return (num / 1000000).toFixed(1) + 'M';
		}
	} else {
		return num;
	}
}

function bFormatter(num) {
	if ( num > 999999999) {
		if ( num % 1000000000 === 0) {
			return num / 1000000000 + 'B';
		} else {
			return (num / 1000000000).toFixed(1) + 'B';
		}
	} else {
		return num;
	}
}

function uFormatter(num) {
	if ( num > 999999999) {
		return bFormatter(num)		
	}

	if (num > 999999) {
		return mFormatter(num)
	} 

	if (num > 999) {
		return kFormatter(num);
	}

	return num;
}

module.exports.formatter = uFormatter;