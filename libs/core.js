const normalize = require('normalize-url');
const got = require('got');
const Ora = require('ora');
const chalk = require('chalk');
const {
	printBlock,
	isDecember
} = require('./utils');

const jparse = JSON.parse;
const spinner = new Ora({
	text: `Connecting to UNSPLASH`,
	color: 'yellow',
	spinner: isDecember() ? 'christmas' : 'earth'
});

const splash = async (url, {
	quiet
}) => {
	url = normalize(url);

	if (!quiet) {
		spinner.start();
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
			spinner.succeed();
		}

		return {
			data: photo,
			status: {
				statusCode,
				statusMessage
			}
		};
	} catch (err) {
		spinner.fail();
		printBlock(chalk`{yellow Splash Error:}`, err.statusMessage || err.name, err.statusCode || err.code);
		return err;
	}
};

module.exports = splash;
