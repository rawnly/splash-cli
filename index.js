#!/usr/bin/env node

require('./libs/variables');

fs.exists( join(__dirname, 'libs', '.prefs') , (exists) => {
	if (!exists) {
		console.log(`Preference file created at ${join(__dirname, '.prefs').yellow}`);
		log('');
		log('');

		fs.writeFile( join(__dirname, 'libs', '.prefs'), `${home}/Pictures/splash_photos` );
	} else {
		pic_dir = fs.readFileSync( join(__dirname, 'libs', '.prefs'), 'utf-8' );
	}
});

require('./libs/utility');

program.version(pkg.version)
.option('-p, --path', 'output the download directory.')
.option('-l --list', 'output photo list')
.option('-c --clean', 'delete all downloaded photos.')
.option('-i --info', 'display main photos infos.')
.option('-s --save [path]', 'Save the image to a local path')
.option('-d --dir [path]', 'Set the default "splash_photos" directory')
.option('--id <id>', 'get photo from the id.')
.option('--set', 'Optional for --save (required --save), set the saved photo as wallpaper')
.option('--export', 'export a photo list')
.option('--check', 'check for updates.');

program.parse(process.argv);

checkInternet((conn) => {
	if (conn) {
		if (program.path) {
			mkdirp(pic_dir, (err) => {
				err ? log(err) : err;
			});

			log(pic_dir);
		} else if (program.list) {
			fs.readdir( pic_dir, (err, files) => {
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
		} else if (program.check) {
			log('');
			console.log('OOPS!');
			console.log('I\'m sorry! but the --check flag is momentaneally disabled for bugfix');
			console.log('');
		} else if (program.clean) {

			mkdirp(pic_dir, (err) => {
				if (err) {log(err);}
			});

			del(pic_dir);

		} else if (program.save) {

			splash(api_url, (data) => {
				let directory = (program.save.length) ? join(program.save, data.name + '.jpg') : join(pic_dir, data.name + '.jpg');
				down_load(directory, photo_url);
			});

		} else if (program.id) {

			var id = program.id;
			var api_url_id = 'https://api.unsplash.com/photos/' + id + '?client_id=' + token;

			mkdirp(pic_dir, (err) => {
				if (err) {log(err);}
			});

			fs.exists( join(pic_dir, `${id}.jpg`), (exists) => {
				if (!exists) {
					splash(api_url_id, (data) => {
					download( join(pic_dir, data.name + '.jpg'), data.url );
				});
				} else {
					log(`You have this photo (${id}.jpg) locally!`);
					wallpaper.set( join(pic_dir, id + '.jpg') );
				}
			});

		} else if (program.dir) {

			if (!program.dir.length) {
				program.dir = pic_dir;
			}

			fs.exists(join(__dirname, 'libs', '.prefs'), (exists) => {
				if (exists) {
				if (program.dir.includes('~')) {
				program.dir == join(home, program.dir.split('~')[1]);
			}

				fs.writeFile(join(__dirname, 'libs', '.prefs'), program.dir, (err) => {
				if (!err) {
					console.log(`${program.dir} is the new store directory`);
				} else {
					throw err;
				}
			});
			} else {
				if (program.dir.includes('~')) {
				program.dir == join(home, program.dir.split('~')[1]);
			}

				fs.writeFile(join(__dirname, 'libs', '.prefs'), program.dir, (err) => {
				if (!err) {
					console.log(`Changed from ${pic_dir} to ${program.dir}`);
				} else {
					throw err;
				}
			});
			}
			});
		} else {
			splash(api_url, (data) => {
				download(join(pic_dir, data.name + '.jpg'), data.url);
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
});
