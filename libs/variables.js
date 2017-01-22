require('colors');
require('chili-js');


// Modules
module.exports = dns 						= require('dns');
module.exports = path 					= require('path');
module.exports = wallpaper 			= require('wallpaper');
module.exports = ora       			= require('ora');
module.exports = fs        			= require('fs');
module.exports = got 			 			= require('got');
module.exports = https 		 			= require('https');
module.exports = program   			= require('commander');
module.exports = mkdirp    			= require('mkdirp');
module.exports = updateNotifier = require('update-notifier');
module.exports = boxen          = require('boxen');
module.exports = clear 					= require('clear');
module.exports = jsonfile 			= require('jsonfile');

// Auto Updates & Package json
module.exports = pkg       			= require('../package.json');
module.exports = notifier 			= updateNotifier({
	pkg,
	updateCheckInterval: 1000 * 60 * 60
});

// API data
module.exports = token   = 'daf9025ad4da801e4ef66ab9d7ea7291a0091b16d69f94972d284c71d7188b34';
module.exports = api_url = 'https://api.unsplash.com/photos/random?client_id=' + token;

// Ora Spinner
module.exports = spinner = new ora({
	text: 'Connecting to Unsplash',
	color: 'yellow',
	spinner: 'earth'
});

// Various paths
module.exports = pic_dir = join(home, 'Pictures', 'splash_photos');
module.exports = data_pth = join(pic_dir, '.splash_datas.json')

// Photo infos and others
module.exports = photo      = undefined;
module.exports = photo_url  = undefined;
module.exports = creator    = undefined;
module.exports = file       = undefined;
module.exports = photo_name = undefined;
