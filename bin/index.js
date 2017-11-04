#! /usr/bin/env node

// Bin file, for client/s;
const client = require('../client');
const Meow = require('meow');

const cli = new Meow({
	flags: {
		collection: {
			type: 'string',
			alias: 'col'
		},
		size: {
			type: 'string',
			alias: 'q',
			default: 'full'
		},
		user: {type: 'string'},
		settings: {type: 'boolean'},
		id: {type: 'string'},
		query: {type: 'string'},
		orientation: {type: 'string'},
		save: {type: 'boolean'}
	},
	aliases: {
		h: 'help',
		v: 'version'
	}
});

// Call the function
client(cli.input, cli.flags);
