import chalk from 'chalk';
import tlink from 'terminal-link';
import parseID from '@splash-cli/parse-unsplash-id';

import { errorHandler, warnIfNotLogged, printBlock, authenticate, authenticatedRequest } from '../extra/utils';
import { CollectionManager } from './libs/Collection';
import Aliases from './libs/Alias';
import { prompt } from 'inquirer';

const getCreateQuestions = (name = null) => [
	{
		name: 'name',
		message: 'Name:',
		default: name,
	},
	{
		name: 'description',
		message: 'Description:',
	},
	{
		name: 'private',
		message: 'Is this collection private?',
		default: false,
		type: 'confirm',
	},
];

// TODO: finish to write this command
export default async function userCommand([cmd, input]) {
	warnIfNotLogged();

	try {
		if (cmd) cmd = cmd.toString().toLowerCase();

		switch (cmd) {
		case 'new':
		case 'create':
			const { name: title, description, private: isPrivate } = await prompt(getCreateQuestions(input));
			const newCollection = await CollectionManager.create(title, description, isPrivate);

			if (!Aliases.has(title)) {
				Aliases.set(title, newCollection.id);
			}

			return userCommand(['get', `${newCollection.id}`]);
		case 'add':
		case 'add-photos':
			printBlock(chalk`{bold {yellow Type "stop" or "exit" to add photos.}}`);
			let photos = [];

			if (!input) {
				errorHandler(new Error('Missing collection ID!'));
				return;
			}

			const c = Aliases.get(input) || parseInt(input);
			const addPhotos = async (array) => {
				const { photo_id } = await prompt([
					{
						name: 'photo_id',
						message: 'Photo ID or URL',
						prefix: chalk.green(`(${array.length})`),
					},
				]);

				if (photo_id === 'stop' || photo_id === 'exit') return;

				const id = parseID(photo_id);
				array.push(id);

				await addPhotos(array);
			};

			await addPhotos(photos);

			// TODO: End implementation
			await Promise.all(
				photos.map(
					async (photo) =>
						await authenticatedRequest(`/collections/${c}/add`, {
							method: 'POST',
							body: JSON.stringify({
								photo_id: photo,
							}),
							headers: {
								'Content-Type': 'application/json',
							},
						}),
				),
			);

			printBlock('Congratualtions!');
			break;
		case 'get':
			let collection = await CollectionManager.get(input);
			collection = await collection.info();

			printBlock(chalk`
  {yellow {bold ${collection.title}}} [{cyan ${collection.total_photos}}]
  by {underline ${collection.user.name}} a.k.a {underline @${collection.user.username}}

  View more ${tlink('here', collection.links.html)}
`);

			break;
		case 'delete':
			const { statusCode, statusMessage } = await CollectionManager.delete(input);
			if (statusCode === 204) return printBlock(`Collection ${input} deleted successfully!`);
			return printBlock(`${statusCode} - ${statusMessage}`);
			break;
		case 'help':
		case 'h':
		case 'how':
			printBlock(
				'DIR HELP',
				'',
				chalk`
						{bold {black {bgWhite COMMANDS}}}   			{bold {black {bgYellow ALIASES}}} 		{bold {black {bgWhite DESCRIPTION}}}

						{cyan {bold get}}    {yellow <collection_id>} 	{dim none}	  {dim GET COLLECTION INFOS}
						{cyan {bold delete}} {yellow <collection_id>}	{dim none}	  {dim COUNTS ALL THE DOWNLOADED PHOTOS}
						{cyan {bold help}} 				{yellow "how"}	  {dim SHOWS THIS MESSAGE}
					`
					.split('\n')
					.map((item) => `  ${item.trim()}`)
					.join('\n'),
			);
			break;
		default:
			if (!cmd) return userCommand(['help']);
			printBlock(chalk`Unknown command "{red {bold ${cmd}}}"`);
		}
	} catch (error) {
		errorHandler(error);
	}
}
