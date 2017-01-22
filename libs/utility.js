require('./variables');
module.exports = infos = () => {
  if ( program.info ) {
    log('');
    log(`ID: ${photo.id.yellow}`);
    log('');

    if ( photo.exif !== undefined ) {
      if (photo.exif.make) {
        log('Make: '.yellow.bold + photo.exif.make);
      } else {
        log('Make: '.yellow.bold + '--');
      }
      if (photo.exif.model) {
        log('Model: '.yellow.bold + photo.exif.model);
      } else {
        log('Model: '.yellow.bold + '--');
      }
      if (photo.exif.exposure_time) {
        log('Shutter Speed: '.yellow.bold + photo.exif.exposure_time);
      } else {
        log('Shutter Speed: '.yellow.bold + '--');
      }
      if (photo.exif.aperture) {
        log('Aperture:'.yellow.bold + ' f/' + photo.exif.aperture);
      } else {
        log('Aperture: '.yellow.bold + ' f/' + '--');
      }
      if (photo.exif.focal_length) {
        log('Focal Length: '.yellow.bold + photo.exif.focal_length + 'mm');
      } else {
        log('Focal Length: '.yellow.bold + '--');
      }
      if (photo.exif.iso) {
        log('ISO: '.yellow.bold + photo.exif.iso);
      } else {
        log('ISO: '.yellow.bold + '--');
      }
    }
    log('');
    log('Shooted by: ' + creator.fullname.cyan.bold + ' (' + creator.username.yellow + ')' );
    log('Profile URL: ' + photo.user.links.html);
  } else {
    log('');
    log('Shooted by: ' + creator.fullname.cyan.bold + ' (' + creator.username.yellow + ')' );
  }
}

module.exports = down_load = (filename, url) => {
	spinner.spinner = {
		frames: [
			'🚀'
		]
	};
	spinner.text = 'Making something awsome';
	spinner.start();

	let file = fs.createWriteStream(filename);

	https.get(url, function(response) {
		response.pipe(file).on('finish', () => {
			spinner.succeed();

			if (program.set) {
				wallpaper.set(filename);
			}

      infos()

			log('')
		});
	});
}


module.exports = download = (filename, url) => {

	spinner.spinner = {
		frames: [
			'🚀'
		]
	};

	spinner.text = 'Making something awsome';
	spinner.start();

	let file = fs.createWriteStream(filename);

	https.get(url, function(response) {
		response.pipe(file).on('finish', () => {

      // Set the wallpaper
      wallpaper.set(`${pic_dir}/${photo_name}.jpg`);
      // Stop the spinner
			spinner.succeed();

      // Log photo infos
			infos();

			log('');
		});
	});
}

// Delete elements
module.exports = del = (directory) => {

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
				fs.unlink( join(directory, file) );
        log(`Removing ${file} from ${directory}`)
			});
      spinner.succeed()

		} else {
			spinner.text = 'The directory is empty!'.bold;
			spinner.stopAndPersist('==>'.yellow.bold);
		}

	});
}

// Check internet connection
module.exports = checkInternet = (callback) => {
	dns.lookup('unsplash.com',function(err) {
		if (err && err.code == 'ENOTFOUND') {
			callback(false);
			notifier.notify();
		} else {
			callback(true);
		}
	});
}



module.exports = splash = (url, callback) => {
  got(url).then(response => {
    let body = response.body;
    write(pic_dir + '/.splash_datas.json', body, (err) => {
      if (err) {
        spinner.text = 'Can\'t connect. Check your connection!';
        spinner.fail();
      } else {
        spinner.text = 'Connected!';
        spinner.succeed();
      }

      file = readSync(data_pth, 'utf-8', (err) => {
        if ( err ) {
          throw err;
        }
      })

      photo = jparse(file);

      creator = {
        fullname: photo.user.name,
        username: '@' + photo.user.username
      };

      let data = {
        url: photo.urls.raw,
        name: photo.id
      }

      photo_url = data.url;
      photo_name = data.name;

      callback(data)
    })
  }).catch((err) => {
    log(err.response.body)
  })
}
