#! /usr/bin/env node

// Bin file, for client/s;
const client = require('./client');
const Meow = require('meow');

const cli = new Meow(`
	Set dely via SPLASH_DELAY ENV

	-h --help 
	-v --version
`, {
	flags: {
		delay: {
			type: 'string',
			default: 5000
		},
		quiet: {
			type: 'boolean',
			default: true,
			alias: 'q'
		}
	},
	aliases: {
		h: 'help',
		v: 'version'
	}
});

cli.flags.quiet = true;
client(cli.input, cli.flags);

let count = 0;
let interval = setInterval(function() {	
	count++;	
	if (count <= 5) {
		client(cli.input, cli.flags);
	} else {
		clearInterval(interval);
	}
}, process.env.SPLASH_DELAY || 5000);
