const normalize = require('normalize-url');
const clear = require('clear');
const got = require('got');
const Ora = require('ora');
const chalk = require('chalk');
const {
	printBlock
} = require('./utils');

const jparse = JSON.parse;
const spinner = new Ora({
	text: `Connecting to UNSPLASH`,
	color: 'yellow',
	spinner: 'earth'
});

const {
	start,
	fail,
	succeed
} = spinner;

const splash = async (url, {
	quiet
}) => {
	url = normalize(url);

	if (!quiet) {
		start();
	}

	try {
		const {
			body,
			statusCode,
			statusMessage
		} = await got(url);
		const photo = jparse(body);

		if (!quiet) {
			spinner.text = 'Connected';
			succeed();
		}

		return {
			data: photo,
			status: {
				statusCode,
				statusMessage
			}
		};
	} catch (err) {
		printBlock(chalk`{yellow Splash Error:}`, err.statusMessage || err.name, err.statusCode || err.code, fail);
		return err;
	}
};

module.exports = splash;
