#!/usr/bin/env node
'use strict';
// Modules
require('chili-js');
require('./libs/utility');
const token = 'daf9025ad4da801e4ef66ab9d7ea7291a0091b16d69f94972d284c71d7188b34';
const api_url = 'https://api.unsplash.com/photos/random?client_id=' + token;

const figlet          = require('figlet');
const ProgressBar     = require('progress');
const normalize       = require('normalize-url');
const urlRegex        = require('url-regex');
const dns 						= require('dns');
const colors          = require('colors');
const chalk         	= require('chalk');
const meow            = require('meow');
const isOnline        = require('is-online');
const wallpaper 			= require('wallpaper');
const ora       			= require('ora');
const got 			 			= require('got');
const https 		 			= require('https');
const mkdirp    			= require('mkdirp');
const updateNotifier  = require('update-notifier');
const clear 					= require('clear');
const conf 					  = require('conf');
const firstRun 			  = require('first-run');
const execa 					= require('execa');
const pkg       	 	  = require('./package.json');
const splash 					= require('./libs/core');

const config 				  = new conf();
const notifier 			  = updateNotifier({
	pkg,
	updateCheckInterval: 1000
});
const spinner = new ora({
	text: 'Connecting to Unsplash',
	color: 'yellow',
	spinner: 'earth'
});

let pic_dir = config.get('pic_dir');


// Welcome Message
if ( firstRun() ) {
	config.set('pic_dir', join(home, 'Pictures', 'splash_photos'));
	log(`Hello ${colors.bold(user.toString().capitalize())}, all photos are stored in ${colors.yellow.underline(config.get('pic_dir'))}`);
  log('');
	log('');
  console.log(figlet.textSync('Splash'));
}

// Initializing
const cli = meow(`
  ` + `# Usage`.yellow.bold + `
    $ splash [--flags]

  ` + `# Help`.yellow.bold + `
    ${colors.blue.bold('## Standard')}
    -h --help                           ${colors.gray('# Display this message')}
    -v --version                        ${colors.gray('# Display splash version')}

    ${colors.blue.bold('## Search options')}

      -u --user <username>              ${colors.gray('# Pick random image from selected user')}
      -f --featured                     ${colors.gray('# Pick random image from featured photos')}
      -w --width <px>                   ${colors.gray('# image width')}
      -h --heigth <px>                  ${colors.gray('# image height')}
      -i --info                        ` + `# Get EXIF infos and Photographer infos.`.gray + `

      --collection <collection_ID>     ` + `# Filter by collection`.gray + `
      --id <id | photo_url>            ` + `# Get image by photo ID or URL.`.gray + `


    ${colors.blue.bold('## Other commands')}

      -l --list [extra flags]          ` + `# List of downloaded photos.`.gray + `
      -s --save [path] [extra flags]   ` + `# Save photo without setting it as wallpaper.`.gray + `
      -d --dir [path]                  ` + `# Set the main download directory.`.gray + `
      -u --update                      ` + `# Update to latest version.`.gray + `
      -c --clean                       ` + `# Delete all downloaded photos.`.gray + `

      --progress                            # show progressbar during downloads
      --restore                        ` + `# Restore settings to default.`.gray + `
      --set                            ` + `# Set the saved photo [--save] as wallpaper.`.gray + `
      --export                         ` + `# Export the photo list [--list].`.gray, {

  alias: {
    l: 'list',
    c: 'clean',
    i: 'info',
    s: 'save',
    d: 'dir',
    u: 'update',
    w: 'width',
    h: 'heigth',
    u: 'user',
    f: 'featured',
    v: 'version',
    h: 'help'
  }
})

// Main Function for meow
function sp(action, flags) {
  if ( notifier.update ) {
    if (flags.update) {
      require('./options/update')()
    } else {
      notifier.notify({
        message: `${chalk.dim(notifier.update.current)} -> ${chalk.green(notifier.update.latest)}` +
        `\n Run ${chalk.cyan('splash --update')} to update`,
        boxenOpts: {
          padding: 1,
      		margin: 2,
      		align: 'center',
      		borderColor: 'yellow',
      		borderStyle: 'double'
        }
      })
    }

  } else {
    if ( flags.restore ) {
      // RESTORE
      require('./options/restore')();

    } else if ( flags.update ) {
      // UPDATE
      isOnline().then((value) => {
        if ( value ) {
          require('./options/update')()
        } else {
          log('I need an internet connection!')
          process.exit()
        }
      })

    } else if (flags.clean) {
      // CLEAN
      require('./options/clean')()

    } else if (flags.list) {
      // LIST ( --EXPORT )
      require('./options/list')(flags)

    } else if (flags.save) {
      // SAVE ( --SET )
      isOnline().then((value) => {
        if ( value ) {
          require('./options/save')(flags)
        } else {
          log('I need an internet connection!')
          process.exit()
        }
      })

    } else if (flags.id) {
      // ID
      isOnline().then((value) => {
        if ( value ) {
          require('./options/id')(flags)
        } else {
          log('I need an internet connection!')
          process.exit()
        }
      })

    } else if (flags.dir) {
      // Dir
      require('./options/dir')(flags)

    } else {
      // Splash Classic
      isOnline().then((value) => {
        if ( value ) {
          let url = '';
          // let base = 'https://api.unsplash.com/photos/random?count=1';
          // let client = `client_id=${token}`;

          if ( flags.heigth && flags.width ) {
            url = `${api_url}&&w=${flags.width}&&h=${flags.heigth}`
          } else if ( flags.user ) {
            url = `${api_url}&&username=${flags.user}`
          } else if ( flags.featured ) {
            url = `${api_url}&&featured=${flags.featured}`
          } else if ( flags.collection ) {
            url = `${api_url}&&collection=${flags.collection}`
          } else {
            url = `${api_url}`
          }

          splash(url, (data, photo) => {
    				download(join(config.get('pic_dir'), data.name + '.jpg'), data.url, data.name, photo, flags);
    			})

        } else {
          log(colors.yellow('Splash:') + ' I need an internet connection!')
          process.exit()
        }
      })
  	}
  }
}

// Call the main function
sp(cli.input[0], cli.flags)















// Functions
function infos(matrice, fl) {
	let creator = {
		fullname: matrice.user.name,
		username: `@${matrice.user.username}`
	};

	if ( fl.info ) {
		log('');
		log(`ID: ${matrice.id.yellow}`);
		log('');

		if ( matrice.exif !== undefined ) {
			if (matrice.exif.make) {
				log('Make: '.yellow.bold + matrice.exif.make);
			} else {
				log('Make: '.yellow.bold + '--');
			}
			if (matrice.exif.model) {
				log('Model: '.yellow.bold + matrice.exif.model);
			} else {
				log('Model: '.yellow.bold + '--');
			}
			if (matrice.exif.exposure_time) {
				log('Shutter Speed: '.yellow.bold + matrice.exif.exposure_time);
			} else {
				log('Shutter Speed: '.yellow.bold + '--');
			}
			if (matrice.exif.aperture) {
				log('Aperture:'.yellow.bold + ' f/' + matrice.exif.aperture);
			} else {
				log('Aperture: '.yellow.bold + ' f/' + '--');
			}
			if (matrice.exif.focal_length) {
				log('Focal Length: '.yellow.bold + matrice.exif.focal_length + 'mm');
			} else {
				log('Focal Length: '.yellow.bold + '--');
			}
			if (matrice.exif.iso) {
				log('ISO: '.yellow.bold + matrice.exif.iso);
			} else {
				log('ISO: '.yellow.bold + '--');
			}
		}
		log('');
		log('Shooted by: ' + creator.fullname.cyan.bold + ' (' + creator.username.yellow + ')' );
		log('Profile URL: ' + matrice.user.links.html);
	} else {
		log('');
		log('Shooted by: ' + creator.fullname.cyan.bold + ' (' + creator.username.yellow + ')' );
	}
};

function down_load(filename, url, m, fl) {
	spinner.spinner = {
		frames: [
			'🚀'
		]
	};
	spinner.text = ' Making something awsome';

  if (!fl.progress) {
    spinner.start();
  }

	let file = fs.createWriteStream(filename);

	https.get(url, function(response) {
    if ( fl.progress ) {
      var len = parseInt(response.headers['content-length'], 10);
      var bar = new ProgressBar('↓ '.yellow + ':percent'.red + ' [:bar] :elapsed' + 's', {
        complete: '↓',
        incomplete: ' ',
        total: len,
        width: 15,
        clear: true
      });

      response.on('data', function (chunk) {
        load.tick(chunk.length, {
          'passphrase': 'Making something awsome'
        });
      });
    }

		response.pipe(file).on('finish', () => {

      spinner.succeed();
			if (fl.set) {
				wallpaper.set(filename);
			}

			infos(m, fl);

			log('');
		});
	});
};


function download(filename, url, photo, m, fl) {
	spinner.text = 'Making something awsome';
  if ( !fl.progress ) {
    spinner.start();
  }


	let file = fs.createWriteStream(filename);

	https.get(url, function(response) {

    if ( fl.progress ) {
      var len = parseInt(response.headers['content-length'], 10);
      var bar = new ProgressBar('↓ '.yellow + ':percent'.red + ' [:bar] :elapsed' + 's', {
        complete: '=',
        incomplete: ' ',
        width: 20,
        total: len,
        clear: true
      });

      response.on('data', function (chunk) {
        bar.tick(chunk.length, {
          'passphrase': 'Making something awsome'
        });
      });
    }


		response.pipe(file).on('finish', () => {
      // Set the wallpaper
			wallpaper.set(`${config.get('pic_dir')}/${photo}.jpg`);

      // Stop the spinner
      spinner.succeed();


      // Log photo infos
			infos(m, fl);

			// Blank spacer
			log('');
		});
	});
};

// Delete elements
function del(directory) {
	log();
	fs.readdir(directory, function (err, files) {
    let imgs = [];
    files.forEach((item) => {
      if (item.includes('.jpg')) {
        imgs.push(item);
      }
    });
		if ( imgs[0] ) {
      var bar = new ProgressBar('Deleted: '+':current'.green+' of '+':total'.green+`files from ${pic_dir.toString().blue}`, {
        total: imgs.length
      });
      log('');

			files.forEach(file => {
				if ( file.includes('.jpg') ) {
					fs.unlink( join(directory, `${file}`), () => {
            bar.tick(1);
					});
				}
			});

		} else {
      log('');
      console.log('\n✦'.yellow.bold + 'The directory is empty!');
      log('');
		}

	});
};
