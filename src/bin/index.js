import meow from 'meow';

import help from './helpmenu';
import client from '../client';

const {
	input,
	flags
} = meow(help, {
	flags: {
		help: {
			type: 'boolean',
			alias: 'h'
		},
		version: {
			type: 'boolean',
			alias: 'v'
		},
		collection: {
			type: 'string'
		},
		size: {
			type: 'string',
			default: 'full'
		},
		featured: {
			type: 'boolean',
			alias: 'f'
		},
		quiet: {
			type: 'boolean',
			alias: 'q'
		},
		user: {
			type: 'string',
			alias: 'u'
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
			type: 'string',
			alias: 'o'
		},
		save: {
			type: 'boolean',
			alias: 's'
		},
		info: {
			type: 'boolean',
			alias: 'i'
		}
	}
});

client(input, flags);