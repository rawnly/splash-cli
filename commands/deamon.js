const chalk = require('chalk');

const DEAMON = require('../libs/Deamon');
const {printBlock} = require('../libs/utils');

const deamon = (placeholder, {start, stop, del, destroy, end, list} = {}) => {
	const splash = new DEAMON('../libs/interval.js', 'splash-cli');

	const helpMENU = chalk`
	Splash DEAMON [Status: ${splash.isRunning ? 'Running' : 'Paused'}]

	{yellow --start} 		# Start the deamon.
	{yellow --end} / {yellow --stop} 		# Stop the deamon.
	{yellow --del} / {yellow --destroy} 	# Delete the deamon.
	`;

	if (!splash.isRunning && start) {
		splash.start(true);
	} else if (splash.isRunning && (stop || end)) {
		splash.stop();
	} else if (splash.isRunning && (del || destroy)) {
		splash.delete();
	} else if (list) {
		splash.list();
	} else {
		printBlock(helpMENU);
	}
};

module.exports = deamon;
