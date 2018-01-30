require('babel-polyfill');

import normalize from 'normalize-url';
import got from 'got';
import Ora from 'ora';
import chalk from 'chalk';
import {
	printBlock,
	isDecember
} from './utils';

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
