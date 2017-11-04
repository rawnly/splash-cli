const normalize = require('normalize-url');
const clear = require('clear');
const got = require('got');
const Ora = require('ora');
const chalk = require('chalk');

const jparse = JSON.parse;
const jstring = JSON.stringify;
const spinner = new Ora({
	text: `Connecting to UNSPLASH`,
	color: 'yellow',
	spinner: 'earth'
});

const splash = async url => {
	url = normalize(url);

	clear();
	spinner.start();

	try {
		const {body, statusCode, statusMessage} = await got(url);
		const photo = jparse(body);

		spinner.text = 'Connected';
		spinner.succeed();

		return {data: photo, status: {statusCode, statusMessage}};
	} catch (err) {
		clear();

		spinner.fail();
		console.log();
		console.log(chalk`{yellow Splash Error:}`, err.statusMessage || err.name, err.statusCode || err.code);

		console.log();
		return err;
	}
};

module.exports = splash;
