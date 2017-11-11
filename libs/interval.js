#! /usr/bin/env node
const splash = require('../client');

async function interval(delay) {
	let sp = await splash([], {quiet: true});

	if (sp) {
		setInterval(() => {
			splash([], {quiet: true});
		}, delay);
	} else {
		process.exit(2);
	}
}

interval(10000);
