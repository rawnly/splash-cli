#!/usr/bin/env node

// Bin file, for client/s;
require('babel-polyfill');

import Meow from 'meow';
import helpmenu from '../libs/helpmenu';
import client from '../client';

const {
	input,
	flags
} = new Meow(helpmenu, {
	flags: {
		collection: {
			type: 'string'
		},
		me: {
			type: 'boolean'
		},
		size: {
			type: 'string',
			default: 'full'
		},
		featured: {
			type: 'boolean'
		},
		quiet: {
			type: 'boolean'
		},
		user: {
			type: 'string'
		},
		settings: {
			type: 'boolean'
		},
		id: {
			type: 'string'
		},
		query: {
			type: 'string'
		},
		orientation: {
			type: 'string'
		},
		save: {
			type: 'boolean'
		},
		info: {
			type: 'boolean',
			alias: 'i'
		}
	},
	alias: {
		h: 'help',
		v: 'version',
		V: 'version',
		u: 'user',
		q: 'quiet',
		o: 'orientation',
		f: 'featured',
		s: 'save',
		i: 'info',
		a: 'auth'
	}
});

// Call the function
client(input, flags);
