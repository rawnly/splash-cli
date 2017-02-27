// Modules
const ProgressBar = require('progress');
const wallpaper = require('wallpaper');
const Ora = require('ora');
const https = require('https');
const fs = require('fs');
const Conf = require('conf');

const config = new Conf();
const log = console.log;
const spinner = new Ora({ text: 'Connecting to Unsplash', color: 'yellow', spinner: 'earth' });
const Thief = require('color-thief');

const thief = new Thief();
const tiny = require('tinycolor2');
const darkMode = require('dark-mode');

// Functions
function infos(matrice, fl) {
  const creator = {
    fullname: matrice.user.name,
    username: `@${matrice.user.username}`,
  };

  if (fl.info) {
    log('');
    log(`ID: ${matrice.id.yellow}`);
    log('');

    if (matrice.exif !== undefined) {
      if (matrice.exif.make) {
        log('Make: '.yellow.bold + matrice.exif.make);
      } else {
        log(`${'Make: '.yellow.bold}--`);
      }
      if (matrice.exif.model) {
        log('Model: '.yellow.bold + matrice.exif.model);
      } else {
        log(`${'Model: '.yellow.bold}--`);
      }
      if (matrice.exif.exposure_time) {
        log('Shutter Speed: '.yellow.bold + matrice.exif.exposure_time);
      } else {
        log(`${'Shutter Speed: '.yellow.bold}--`);
      }
      if (matrice.exif.aperture) {
        log(`${'Aperture:'.yellow.bold} f/${matrice.exif.aperture}`);
      } else {
        log(`${'Aperture: '.yellow.bold} f/--`);
      }
      if (matrice.exif.focal_length) {
        log(`${'Focal Length: '.yellow.bold + matrice.exif.focal_length}mm`);
      } else {
        log(`${'Focal Length: '.yellow.bold}--`);
      }
      if (matrice.exif.iso) {
        log('ISO: '.yellow.bold + matrice.exif.iso);
      } else {
        log(`${'ISO: '.yellow.bold}--`);
      }
    }
    log('');
    log(`Shooted by: ${creator.fullname.cyan.bold} (${creator.username.yellow})`);
    log(`Profile URL: ${matrice.user.links.html}`);
  } else {
    log('');
    log(`Shooted by: ${creator.fullname.cyan.bold} (${creator.username.yellow})`);
  }
}

function download(filename, photo, fl) {
  spinner.text = 'Making something awsome';
  if (!fl.progress) {
    spinner.start();
  }


  const file = fs.createWriteStream(filename);

  https.get(photo.urls.raw, (response) => {
    if (fl.progress) {
      const len = parseInt(response.headers['content-length'], 10);
      const bar = new ProgressBar(`${'↓ '.yellow + ':percent'.red} [:bar] :elapsed s`, {
        complete: '=',
        incomplete: ' ',
        width: 20,
        total: len,
        clear: true,
      });

      response.on('data', (chunk) => {
        bar.tick(chunk.length, {
          passphrase: 'Making something awsome',
        });
      });
    }


    response.pipe(file).on('finish', () => {
      const img = `${config.get('pic_dir')}/${photo.id}.jpg`;

      // Set the wallpaper and change the osx theme
      if (process.platform === 'darwin' && fl.theme) {
        darkMode.isDark().then((status) => {
          const color = `rgb( ${thief.getColor(img).join(', ')} )`;
          const brightness = tiny(color).getBrightness();
          const isBright = !!((brightness && brightness >= 127.5));

          if (isBright && status === true) {
            darkMode.disable();
          } else if (!isBright && status === false) {
            darkMode.enable();
          }
        });
      }

      // Set wallpaper
      wallpaper.set(img);

      // Stop the spinner and log the output
      spinner.succeed();
      infos(photo, fl);

      // Spacer
      log('');
    });
  });
}

module.exports = download;
