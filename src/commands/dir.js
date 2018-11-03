import printBlock from '@splash-cli/print-block';
import Directory from './utils/Directory';

import chalk from 'chalk';

export default async function ([cmd]) {
	switch (cmd) {
	case 'clean':
		return await Directory.clean();
	case 'get':
		return printBlock(chalk `That's the path: "{yellow {underline ${Directory.getPath()}}}"`);
	case 'count':
		return printBlock(chalk `Found {cyan ${await Directory.count()}} photos.`);
	default:
		printBlock(chalk `Unknown command "{red {bold ${cmd}}}"`);
	}
}