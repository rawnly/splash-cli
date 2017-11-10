#! /usr/bin/env node

// Bin file, for client/s;
const client = require('./client');
const Meow = require('meow');

const {
	input,
	flags
} = new Meow(`
	-h --help 
	-v --version
`, {
		description: 'Set dely via SPLASH_DELAY ENV',
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

let {
	delay,
	quiet
} = flags;

delay |= process.env.SPLASH_DELAY;
quiet |= true;

client(input, {
	quiet,
	delay
});

let count = 0;
let interval = setInterval(function () {
	count++;
	if (count <= 5) {
		client(input, flags);
	} else {
		clearInterval(interval);
	}
}, delay || 60000);
