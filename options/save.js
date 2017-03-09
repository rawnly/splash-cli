// Modules

const https = require('https');
const path = require('path');
const fs = require('fs');
const ProgressBar = require('progress');
const chalk = require('chalk');
const wallpaper = require('wallpaper');
const Ora = require('ora');
const Conf = require('conf');
const splash = require('../libs/core');

// Variables
const config = new Conf();
const spinner = new Ora({text: 'Connecting to Unsplash', color: 'yellow', spinner: 'earth'});
const join = path.join;
const token = 'daf9025ad4da801e4ef66ab9d7ea7291a0091b16d69f94972d284c71d7188b34';
const apiUrl = `https://api.unsplash.com/photos/random?client_id=${token}`;
const log = console.log;

// Functions
function infos(matrice, fl) {
  const creator = {
    fullname: matrice.user.name,
    username: `@${matrice.user.username}`
  };

  if (fl.info) {
    log('');
    log(`ID: ${matrice.id.yellow}`);
    log('');

    if (matrice.exif !== undefined) {
      if (matrice.exif.make) {
        log(chalk.yellow.bold('Make: ') + matrice.exif.make);
      } else {
        log(`${chalk.yellow.bold('Make: ')}--`);
      }
      if (matrice.exif.model) {
        log(chalk.yellow.bold('Model: ') + matrice.exif.model);
      } else {
        log(`${chalk.yellow.bold('Model: ')}--`);
      }
      if (matrice.exif.exposure_time) {
        log(chalk.yellow.bold('Shutter Speed: ') + matrice.exif.exposure_time);
      } else {
        log(`${chalk.yellow.bold('Shutter Speed: ')}--`);
      }
      if (matrice.exif.aperture) {
        log(`${chalk.yellow.bold('Aperture:')} f/${matrice.exif.aperture}`);
      } else {
        log(`${chalk.yellow.bold('Aperture:')} f/--`);
      }
      if (matrice.exif.focal_length) {
        log(`${chalk.yellow.bold('Focal Length: ') + matrice.exif.focal_length}mm`);
      } else {
        log(`${chalk.yellow.bold('Focal Length: ')}--`);
      }
      if (matrice.exif.iso) {
        log(chalk.yellow.bold('ISO: ') + matrice.exif.iso);
      } else {
        log(`${chalk.yellow.bold('ISO: ')}--`);
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

function down(filename, url, m, fl) {
  spinner.spinner = {
    frames: [
      '🚀'
    ]
  };
  spinner.text = ' Making something awsome';

  if (!fl.progress) {
    spinner.start();
  }

  const file = fs.createWriteStream(filename);

  https.get(url, response => {
    if (fl.progress) {
      const len = parseInt(response.headers['content-length'], 10);
      const bar = new ProgressBar(`${'↓ '.yellow + ':percent'.red} [:bar] :elapsed s`, {
        complete: '#',
        incomplete: ' ',
        total: len,
        width: 15,
        clear: true
      });

      response.on('data', chunk => {
        bar.tick(chunk.length, {
          passphrase: 'Making something awsome'
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
}

// Init
module.exports = fl => {
  let url = '';

  if (fl.heigth && fl.width) {
    url = `${apiUrl}&&w=${fl.width}&&h=${fl.heigth}`;
  } else if (fl.user) {
    url = `${apiUrl}&&username=${fl.user}`;
  } else if (fl.featured) {
    url = `${apiUrl}&&featured=${fl.featured}`;
  } else if (fl.collection) {
    url = `${apiUrl}&&collection=${fl.collection}`;
  } else {
    url = `${apiUrl}`;
  }

  splash(url, (data, photo) => {
    const directory = (fl.save.length) ? join(fl.save, `${data.name}.jpg`) : join(config.get('pic_dir'), `${data.name}.jpg`);
    down(directory, data.url, photo, fl);
  });

  log();
  log(`${chalk.yellow('Splash:')} Photo saved at ${fl.save}`);
  log();
};
