require('babel-polyfill');
require('regenerator-runtime');

import printBlock from '@splash-cli/print-block';
import chalk from 'chalk';
import figures from 'figures';
import { config } from '../extra/config';
import Alias from './utils/Alias';

export default function alias([action, alias, aliasID = false]) {
	const aliases = config.get('aliases') || [];

	switch (action) {
	case 'delete':
	case 'remove':
		const removed = Alias.remove(alias);
		if (removed === false) printBlock(chalk`{red {bold Error:}} Alias {yellow "${alias}"} not found.`, config.get('aliases'));
		break;
	case 'set':
		let created = false;

		if (/[a-z\-\_]\=[0-9]{1,7}/.test(alias)) {
			const [name, id] = alias.split(/\=|\/|\:/g);
			created = Alias.set(name, id);
			printBlock(chalk `{bold Alias created!}`, '', chalk`{yellow ${name}: ${id}}`);
		} else if (alias && aliasID) {
			created = Alias.set(alias, aliasID);
			printBlock(chalk `{bold Alias created!}`, '', chalk`{yellow ${alias}: ${aliasID}}`);
		} else {
			return printBlock(
				chalk `{bold {red Invalid alias!}}`,
				'',
				chalk `Please use {underline the following syntax}:`,
				'',
				chalk `{dim $ splash} {green alias} {yellow name=id}`,
				chalk `{dim $ splash} {green alias} {yellow name id}`
			);
		}

		if (!created) return printBlock(
			chalk `{bold {red Error:}} Duplicate! An alias with these parameters already exists!`,
			chalk `If you want replace it use {yellow 'alias remove'}`,
			'',
			...aliases.map(item => chalk `{yellow ${item.name}}: ${item.id}`)
		);

		break;
	case 'get':
		alias = Alias.get(alias);

		if (!alias) return printBlock(
			chalk.bold.red('Invalid Alias'), 
			'', 
			'', 
			chalk`{cyan Aliases: (${aliases.length})}`, 
			'', 
			...aliases.map(item => chalk`{dim ${figures.pointer}} {yellow ${item.name}}: ${item.id}`)
		);
      
		printBlock(chalk `{bold {yellow "${alias.name}"}}: ${alias.id}`);
		break;
	default:
		printBlock(
			chalk`Invalid action "{red ${action}}"`,
			'Allowed actions are:',
			' - set',
			' - get'
		);
		break;
	}
}