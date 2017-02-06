#!/usr/bin/env node

require('./libs/variables');
require('./libs/utility');

var splash = require('./libs/core');


program.version(pkg.version)
.option('-l --list', 'output photo list')
.option('-c --clean', 'delete all downloaded photos.')
.option('-u --update', 'Update to latest version')
.option('-i --info', 'display main photos infos.')
.option('-s --save [path]', 'Save the image to a local path')
.option('-d --dir [path]', 'Set the default "splash_photos" directory')
.option('--id <id>', 'get photo from the id.')
.option('--set', 'optional for --save (required --save), set the saved photo as wallpaper')
.option('--export', 'export a photo list')
.option('--restore', 'restore default options');

program.parse(process.argv);

isOnline().then(status => {
	if (status) {

		if (program.restore) {
			config.set('pic_dir', join(home, 'Pictures', 'splash_photos'));
			firstRun.clear();

			log(`Settings restored to defaults!`.yellow)

		// Program Path
		} else if (program.update) {
			execa('npm', ['install', '--global', 'splash-cli'], (res) => {
				log(res.stdout)
			})
			// List
		} else if (program.list) {
			fs.readdir( config.get('pic_dir'), (err, files) => {
				if (err) { log(err); } else {
					if ( files[0] ) {

						files.sort();

						let list = [];

						files.forEach((item) => {
							if ( item.charAt(0) !== '.' && item !== 'thumbs' ) {
								item = item.slice(0, item.length - 4);
								list.push(item);
							}
						});

						clear();

						log('');
						log(list.length.toString().yellow.bold + ' Photos');
						log('');

						list.sort();

						list = jstringify(list);
						list = jparse(list);

						log(list);
						log('');

						if ( program.export ) {
							jsonfile.writeFile('./list.json', list, (err) => {
								if ( err ) { return err; } else {
									log( 'File written at: ' + 'list.txt'.yellow );
								}
							});
						}

					} else {
						log('==> Directory is empty'.yellow);
					}
				}
			});

		// Clean photos
		} else if (program.clean) {

			mkdirp(config.get('pic_dir'), (err) => {
				if (err) {log(err);}
			});

			del( config.get('pic_dir') );

		// Save photo
		} else if (program.save) {

			splash(api_url, (data, photo) => {
				let directory = (program.save.length) ? join(program.save, data.name + '.jpg') : join(config.get('pic_dir'), data.name + '.jpg');
				down_load(directory, data.url, photo);
			});

		// Get by id
		} else if (program.id) {

			var id = program.id;
			var api_url_id = 'https://api.unsplash.com/photos/' + id + '?client_id=' + token;

			mkdirp(config.get('pic_dir'), (err) => {
				if (err) {log(err);}
			});

			fs.exists( join(config.get('pic_dir'), `${id}.jpg`), (exists) => {
				if (!exists) {
					splash(api_url_id, (data, photo) => {
						download( join(config.get('pic_dir'), data.name + '.jpg'), data.url, data.name, photo);
					});

				} else {
					log(`You have this photo (${id}.jpg) locally!`);
					wallpaper.set( join(config.get('pic_dir'), `${id}.jpg`) );
				}
			});


		// DIR
		} else if (program.dir) {

			if (!program.dir.length) {
				program.dir = config.get('pic_dir');
				log(`Actual directory => ${config.get('pic_dir').toString().yellow}`)
			} else {
				if (program.dir.includes('~')) {
					program.dir == join(home, program.dir.split('~')[1]);
				}

				config.set('pic_dir', program.dir)
				log('Changed to ' + config.get('pic_dir'))
			}


		} else {
			splash(api_url, (data, photo) => {
				download(join(config.get('pic_dir'), data.name + '.jpg'), data.url, data.name, photo);
			});
		}

	} else {
		clear();
		spinner.stop();
		console.log('');
		console.log('');
		console.log(`
			I'm sorry, it seems I have troubles to connect to UNSPLASH.\n
			If your `.bold + 'internet connection'.rainbow.bold + ` works well, then visit https://unsplash.com
			maybe it's down or blocked...
		`.bold);
		console.log('');
		console.log('');
	}
})
