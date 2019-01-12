import { prompt } from 'inquirer';
import chalk from 'chalk';
import tlink from 'terminal-link';

import { errorHandler, warnIfNotLogged, printBlock } from '../extra/utils';
import { CollectionManager } from './libs/Collection';

// TODO: finish to write this command
export default async function userCommand([cmd, input]) {
	warnIfNotLogged();

	try {
		if (cmd) cmd = cmd.toString().toLowerCase();

		switch (cmd) {
		case 'get':
			let collection = await CollectionManager.get(input);
			collection = await collection.info();

			printBlock(chalk `
  {yellow {bold ${collection.title}}} [{cyan ${collection.total_photos}}]
  by {underline ${collection.user.name}} a.k.a {underline @${collection.user.username}}

  View more ${tlink('here', collection.links.html)}
`);

			break;
		case 'delete':
			const { statusCode } = await CollectionManager.delete(input);
			if (statusCode === 204) return printBlock(`Collection ${input} deleted successfully!`);
			break;
		default:
			return printBlock(`${cmd} is not an option.`);
			break;
		}
	} catch (error) {
		errorHandler(error);
	}
}