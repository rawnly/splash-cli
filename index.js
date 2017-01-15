#!/usr/bin/env node

// Modules
require('colors');
const dns = require('dns');
const os = require('os');
const chalk = require('chalk');
const path = require('path');
const wallpaper = require('wallpaper');
const ora = require('ora');
const fs = require('fs');
const request = require('request');
const https = require('https');
const program = require('commander');
const mkdirp = require('mkdirp');
const updateNotifier = require('update-notifier');
const pkg = require('./package.json');
const boxen = require('boxen');
const clear = require('clear');
const jsonfile = require('jsonfile');
const notifier = updateNotifier({ pkg, updateCheckInterval: 1000 * 60 * 60 });

notifier.notify();

// Url elements
const token = 'daf9025ad4da801e4ef66ab9d7ea7291a0091b16d69f94972d284c71d7188b34';
const api_url = 'https://api.unsplash.com/photos/random?client_id=' + token;

// various declarations
var spinner = new ora({
	text: 'Connecting to Unsplash',
	color: 'yellow',
	spinner: 'earth'
});

var photo, photo_url, creator, file, photo_name, pth, join, pic_dir;

join = path.join;
pic_dir = join(os.homedir(), 'Pictures', 'splash_photos/' );
pth = join(__dirname, 'data.json');

program.version(pkg.version)
.option('-p, --path', 'Return the download directory.')
.option('-c --clean', 'Delete all downloaded photos.')
.option('-i --info', 'Display main photos infos.')
.option('--id <id>', 'Get photo from the id.')
.option('--check', 'Check for updates.')
.option('--export', 'Export list')
.option('-l --list', 'Return photo list');


program.parse(process.argv);


checkInternet(function (isOnline) {
	spinner.text = 'Checking your connection...';
	spinner.start();

	if (isOnline) {
		spinner.stop();
		spinner.text = 'Connecting to Unsplash';

		if ( program.list && !program.export ) {
			fs.readdir( pic_dir, (err, files) => {
				if (err) {
					console.log(err);
				} else {
					if ( files[0] ) {
						// Sort list by name
						files.sort();
						let list = [];
						files.forEach((item) => {
							// Remove .jpg
							item = item.slice(0, item.length - 4);
							list.push(item);
						});

						clear();

						console.log('');
						console.log(list.length.toString().yellow.bold + ' Photos');
						console.log('');

						list.sort();

						list = JSON.stringify(list);
						list = JSON.parse(list);

						console.log(list);
						console.log('');

					} else {
						console.log('==> Directory is empty'.yellow);
					}
				}
			});

		} else if (program.list && program.export) {
			fs.readdir(pic_dir, (err, files) => {
				files.sort();
				let list = [];
				files.forEach((item) => {
					// Remove .jpg
					item = item.slice(0, item.length - 4);
					list.push(item);
				});

				clear();

				console.log('');
				console.log(list.length.toString().yellow.bold + ' Photos');
				console.log('');

				list.sort();

				list = JSON.stringify(list);
				list = JSON.parse(list);

				console.log(list);
				console.log('');

				// Write file
				files = JSON.stringify(files);
				files = JSON.parse(files);

				jsonfile.writeFile('./splashList.json', files, (err) => {
					if ( err ) return err;
				});
			});
		} else if (program.path) {
			mkdirp(pic_dir, (err) => {
				if (err) {console.log(err);}
			});

			console.log(pic_dir);

		} else if (program.clean) {

			mkdirp(pic_dir, (err) => {
				if (err) {console.log(err);}
			});

			del(pic_dir);

		} else if ( program.id ) {

			var id = program.id;
			var api_url_id = 'https://api.unsplash.com/photos/' + id + '?client_id=' + token;

			mkdirp(pic_dir, (err) => {
				if (err) {console.log(err);}
			});

			fs.access(pic_dir + `/${id}.jpg`, (err) => {
				if (!err) {
					console.log('==> '.yellow.bold + 'You have this photo locally!');
					wallpaper.set(pic_dir + `/${id}.jpg`);
				} else {
					spinner.start();

					request(api_url_id, function(error, response, body) {
						if (!error && response.statusCode == 200) {
							fs.writeFile(__dirname + '/data.json', body, (err) => {

								if (err) {
									spinner.fail();
									console.log(err);
								} else {
									spinner.text = 'Connected!';
									spinner.succeed();
								}

								file = fs.readFileSync(pth, 'utf-8', (err) => {
									if ( err ) {
										throw err;
									}
								});

								photo = JSON.parse(file);
								photo_url = photo.urls.raw;
								creator = {
									fullname: photo.user.name,
									username: '@' + photo.user.username
								};

								photo_name = photo.id;

								download(pic_dir + `/${photo_name}.jpg`, photo_url);

							});
						}
					});
				}
			});

		} else if (program.check) {
			updateNotifier({
				pkg,
				callback: (error, update) => {
					if ( !error ) {
						if ( update.current !== update.latest ) {
							console.log('');
							console.log(boxen(`Update Available!\n ${update.current.gray + ' ==> ' + update.latest.green}\n\n` + chalk.yellow('npm install -g splash-cli'), { padding: 1, margin: 1, align: 'center', borderColor: 'yellow', borderStyle: 'double' }));
							console.log('');
						} else {
							console.log(`Latest release installed! ${update.latest.green}`);
						}
					}
				}
			});
		} else {
			mkdirp(pic_dir, (err) => {
				if (err) {console.log(err);}
			});
			spinner.start();
			request(api_url, function(error, response, body) {
				if (!error && response.statusCode == 200) {
					fs.writeFile(__dirname + '/data.json', body, (err) => {
            // if error when writing then fail() else success;
						if (err) {
							spinner.text = 'Can\'t connect. Check your connection!';
							spinner.fail();
						} else {
							spinner.text = 'Connected!';
							spinner.succeed();
						}

						file = fs.readFileSync(pth, 'utf-8', (err) => {
							if ( err ) {
								throw err;
							}
						});

						photo = JSON.parse(file);
						photo_url = photo.urls.raw;
						creator = {
							fullname: photo.user.name,
							username: '@' + photo.user.username
						};

						photo_name = photo.id;

						download(pic_dir + `/${photo_name}.jpg`, photo_url);

					});
				}
			});
		}
	} else {
		clear();
		spinner.stop();
		console.log('');
		console.log('');
		console.log(`
			I'm sorry, it seems i have trouble to connect to UNSPLASH.\n
			If your `.bold + 'internet connection'.rainbow.bold + ` works well, then visit https://unsplash.com
			maybe it's down or blocked...
		`.bold);
		console.log('');
		console.log('');
	}
});


function download(filename, url) {
	spinner.spinner = {
		frames: [
			'🚀'
		]
	};
	spinner.text = 'Making something awsome';
	spinner.start();

	var file;

	file = fs.createWriteStream(filename);

	https.get(url, function(response) {
		response.pipe(file).on('finish', () => {
			wallpaper.set(pic_dir + '/' + photo_name + '.jpg');
			spinner.succeed();

			if ( program.info ) {
				console.log('');
				console.log(`ID: ${photo.id.yellow}`);
				console.log('');

				if ( photo.exif !== undefined ) {
					if (photo.exif.make) {
						console.log('Make: '.yellow.bold + photo.exif.make);
					} else {
						console.log('Make: '.yellow.bold + '--');
					}
					if (photo.exif.model) {
						console.log('Model: '.yellow.bold + photo.exif.model);
					} else {
						console.log('Model: '.yellow.bold + '--');
					}
					if (photo.exif.exposure_time) {
						console.log('Shutter Speed: '.yellow.bold + photo.exif.exposure_time);
					} else {
						console.log('Shutter Speed: '.yellow.bold + '--');
					}
					if (photo.exif.aperture) {
						console.log('Aperture:'.yellow.bold + ' f/' + photo.exif.aperture);
					} else {
						console.log('Aperture: '.yellow.bold + ' f/' + '--');
					}
					if (photo.exif.focal_length) {
						console.log('Focal Length: '.yellow.bold + photo.exif.focal_length + 'mm');
					} else {
						console.log('Focal Length: '.yellow.bold + '--');
					}
					if (photo.exif.iso) {
						console.log('ISO: '.yellow.bold + photo.exif.iso);
					} else {
						console.log('ISO: '.yellow.bold + '--');
					}
				}
				console.log('');
				console.log('Shooted by: ' + creator.fullname.cyan.bold + ' (' + creator.username.yellow + ')' );
				console.log('Profile URL: ' + photo.user.links.html);
			} else {
				console.log('');
				console.log('Shooted by: ' + creator.fullname.cyan.bold + ' (' + creator.username.yellow + ')' );
			}

			console.log('');
		});
	});
}

function del(directory) {

	fs.readdir(directory, function (err, files) {

		spinner.spinner = {
			frames: [
				'🚀'
			]
		};
		spinner.text = 'Making something awsome';
		spinner.start();

		if ( files[0] ) {
			files.forEach(file => {
				fs.unlink(directory + file);
				spinner.text = 'Cleaned';
			});
			spinner.stopAndPersist('==>'.yellow.bold);
		} else {
			spinner.text = 'The directory is empty!'.bold;
			spinner.stopAndPersist('==>'.yellow.bold);
		}

	});
}

function checkInternet(cb) {
	dns.lookup('unsplash.com',function(err) {
		if (err && err.code == 'ENOTFOUND') {
			cb(false);
		} else {
			cb(true);
		}
	});
}
