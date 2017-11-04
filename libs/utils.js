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


Array.prototype.first = function () {
	return this[0];
};

const checkArchivments = () => {
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

const showCopy = data => {
	const user = data.user;
	console.log();

	if (data.description) {
		console.log();
		console.log(chalk.dim(`> ${data.description}`));
		console.log();
	}
	console.log(`Downloaded: ${uFormatter(data.downloads)} times.`);
	console.log(`Viewed: ${uFormatter(data.views)} times.`);
	console.log(`Liked by ${uFormatter(data.likes)} users.`);

	console.log();
	console.log();

	console.log(`Shot by: ${chalk.cyan.bold(user.name)} (@${chalk.yellow(user.username)})`);
	console.log();
};

const parseExif = source => {
	if (source.exif) {
		const exif = [];

		Object.keys(source.exif).forEach(item => {
			const current = {};
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

const openURL = (flags, url) => {
	spinner.text = '';

	if (!flags.quiet) {
		spinner.start();
	}

	return new Promise((resolve, reject) => {
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

const splashError = (e, opt = {message: 'Splash Error', colors: {message: 'yellow', error: 'red'}}) => {
	console.log();
	console.log(chalk`{${opt.colors.message} ${opt.message}:} {${opt.colors.error} ${e}}`);

	throw new Error(e);
};

const capitalize = (string, separator = ' ') => {
	let words = string.split(separator);
	words = words.map(word => {
		return word.charAt(0).toUpperCase() + word.substr(1, word.length);
	});

	return words.join(separator);
};

const pathParser = path => {
	if (path.includes('~')) {
		path = path.replace('~', os.homedir());
	}

	return path;
};

// Parse url / id;
const parseID = id => {
	const regex = /[a-zA-Z0-9\_\-]{11}/g;

	id = id.toString();

	if (regex.test(id)) {
		return id.match(regex)[0];
	}

	return false;
};

const parseCollection = alias => {
	const aliases = config.get('aliases');

	const collection = aliases.filter(item => {
		return item.name === alias;
	}).shift();

	if (collection) {
		return collection;
	}

	return false;
};

 const collectionInfo = async id => {
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

const setUriParam = (key, value) => {
	return `&${key}=${value.toString()}`;
};


const uFormatter = num => {
	if (num > 999999999) {
		if (num % 1000000000 === 0) {
			return num / 1000000000 + 'B';
		}
		return (num / 1000000000).toFixed(1) + 'B';
	}

	if (num > 999999) {
		if (num % 1000000 === 0) {
			return num / 1000000 + 'M';
		}
		return (num / 1000000).toFixed(1) + 'M';
	}

	if (num > 999) {
		if (num % 1000 === 0) {
			return num / 1000 + 'K';
		}
		return (num / 1000).toFixed(1) + 'K';
	}

	return num;
}

const downloadFlags = async (url, flags) => {
	if (flags.id) {
		// Parse photo "id" form "photo url" and validate it.
		const id = parseID(flags.id);

		if (!id) {
			clear();
			console.log(chalk`{red {bold Invalid}} {yellow url/id}`);
		}

		// Change API URL
		url = `${api.base}/photos/${id}?client_id=${api.token}`;
	} else {
		// Search filters

		// Photo ORIENTATION
		if (flags.orientation) {
			let orientation;
			switch (flags.orientation) {
				case 'landscape':
				case 'horizontal':
					orientation = 'landscape';
					break;

				case 'portrait':
				case 'vertical':
					orientation = 'portrait';
					break;

				case 'squarish':
				case 'square':
					orientation = 'squarish';
					break;
				default:
					orientation = config.get('orientation') || undefined;
					break;
			}

			url += setUriParam('orientation', orientation);
		}

		if (flags.query) {
			// SEARCH PHOTO BY KEYWORD
			const query = encodeURIComponent(flags.query.toLowerCase());
			url += setUriParam('query', query);
		} else if (flags.featured) {
			// GET RANDOM FEATURED PHOTO
			url += setUriParam('featured', true);
		} else if (flags.user) {
			// GET RANDOM PHOTO FROM GIVEN USERNAME
			const username = flags.user.toLowerCase();
			url += setUriParam('username', username);
		} else if (flags.collection) {
			// GET RANDOM PHOTO FROM GIVEN COLLECTION
			let collection;
			const regex = /[0-9]{3,7}/g;

			// Check if the input given is a valid ALIAS
			const isAlias = parseCollection(flags.collection);

			// Check if the input given is a valid collection id
			const isCollection = regex.test(flags.collection) || (!isNaN(Number(flags.collection)) && Number(flags.collection) >= 251);

			if (isAlias) {
				// Grab infos
				collection = await collectionInfo(isAlias.value);
			} else if (isCollection) {
				// Grab infos
				collection = await collectionInfo(flags.collection.toString().match(regex)[0]);
			} else {
				// Some response if data is no valid.
				clear();
				console.log();
				console.log(chalk`{red Invalid collection ID}`);
				console.log();
				process.exit();
			}

			clear();
			console.log();

			// Output the collection infos.
			let message = chalk`Collection: {cyan ${collection.title}} by {yellow @${collection.user}}`;

			if (collection.featured && collection.curated) {
				message = '[Featured - Curated] ' + message;
			} else if (collection.featured) {
				message = '[Featured] ' + message;
			} else if (collection.curated) {
				message = '[Curated]';
			}

			console.log(message);
			console.log();

			// Update the URL
			url += setUriParam('collections', collection);
		}
	}

	return url;
}

module.exports.checkArchivments = checkArchivments;
module.exports.showCopy = showCopy;
module.exports.parseExif = parseExif;
module.exports.openURL = openURL;
module.exports.splashError = splashError;
module.exports.capitalize = capitalize;
module.exports.pathParser = pathParser;
module.exports.parseID = parseID;
module.exports.parseCollection = parseCollection;
module.exports.collectionInfo = collectionInfo;
module.exports.setUriParam = setUriParam;
module.exports.formatter = uFormatter;
module.exports.downloadFlags = downloadFlags;