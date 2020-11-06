const Unsplash = require('..').default;

async function newWallpaper(collection = 'editorial') {
	const options = {};
	const splash = Unsplash.shared;

	if (collection) {
		options.collection = collection;
	} else {
		options.day = true;
	}

	if ( process.platform == 'darwin' ) {
		options.screen = 'all';
	}

	await splash([], options);
}

(async () => {
	await newWallpaper();
	console.log('\nWating...\n');

	var interval = 1000 * 10;

	setInterval(() => {
		interval -= 1000;

		process.stdout.write(`Remeaining: ${Math.round(interval / 1000)}s\r`);
	}, 1000);

	setTimeout(async () => await newWallpaper(), 1000 * 10);
})();
