const DEAMON = require('../libs/Deamon');
const MEOW = require('meow');

const {input, flags} = new MEOW();

function client(input, {start, stop, del, list}) {
	const splash = new DEAMON('../interval.js', 'splash-cli');

	if (list) {
		splash.list();
	} else if (start) {
		splash.start();
	} else if (stop) {
		splash.stop();
	} else if (del) {
		splash.delete();
	}
}

client(input, flags);
