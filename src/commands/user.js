import printBlock from '@splash-cli/print-block';
import chalk from 'chalk';
import { prompt } from 'inquirer';
import { config, unsplash } from '../extra/config';
import login from './utils/user_login';
import {
	authenticatedRequest,
	updateMe,
	errorHandler
} from '../extra/utils';


export default async function userCommand([cmd]) {
	try {
		if (cmd) cmd = cmd.toString().toLowerCase();

		switch (cmd) {
		case 'login':
			await login();
			break;
		case 'logout':
			const {
				isSure
			} = await prompt([{
				name: 'isSure',
				message: 'Are you sure?',
				default: false,
				type: 'confirm'
			}]);

			if (isSure !== true) {
				console.log(chalk `{bold {red Aborted}}`);
				return;
			}

			config.delete('user');
			printBlock(chalk `User data {bold deleted} successfully.`);
			break;
		case 'update':
		case 'edit':
			const data = await updateMe();

			if ( data.error || data.errors ) return errorHandler(data.error || data.errors);
                
			await userCommand([ 'get' ]);

			break;
		case 'likes':
			const { profile: { username, total_likes: totalLikes } } = config.get('user');
			const likedPhotos = [];

			const photos = await authenticatedRequest(`users/${username}/likes`);
			photos.map(photo => {
				likedPhotos.push({
					id: photo.id,
					html: photo.links.html,
					download: photo.links.download_location,
					user: {
						username: photo.user.username,
						name: photo.user.name,
						profile: photo.user.links.html
					}
				});
			});

			printBlock(chalk`{bold {black {bgYellow Last 10 liked photos:}}}`);
			likedPhotos.forEach(photo => {
				console.log(chalk`{bold {yellow ID:}} ${photo.id}`);
				console.log(chalk`{bold {yellow Author:}} {cyan @${photo.user.username}}`);
				console.log(chalk`{bold {yellow Link:}} {underline ${photo.html}}`);
				console.log(chalk`{dim -}`.repeat(10));
				console.log();
			});
			break;
		case 'get':
			if ( !config.has('user') ) {
				printBlock(chalk`Please log in.`);
				return;
			}

			let user;

			try {
				user = await authenticatedRequest('me');
			} catch (error) {
				user = config.get('user').profile;
			}
                

			const userData = chalk `
                    {yellow Name}: ${user.name} {dim (@${user.username})}
                    {yellow Bio}: ${user.bio}
                    {yellow Location}: ${user.location}

                    {dim —————————————————————————————————————————}

                    {yellow Downloads Count}: ${user.downloads} 
                    {yellow Photos Count}: ${user.photos.length}

                    {dim —————————————————————————————————————————}

                    {yellow Followers}: ${user.followers_count}
                    {yellow Following}: ${user.following_count}
                `.split('\n').map(item => '  ' + item.trim()).join('\n');

			printBlock(userData);

			break;
		default:
			printBlock(chalk `{yellow Sorry!} Option: {yellow "${cmd}"} currently {underline {red not available}}.`);
			console.log(unsplash);
			break;
		}
	} catch (error) {
		errorHandler(error);
	}
}


