// Modules

// const https = require('https');
const path = require('path');
// const fs = require('fs');
// const ProgressBar = require('progress');
const chalk = require('chalk');
// const wallpaper = require('wallpaper');
// const Ora = require('ora');
const Conf = require('conf');
const splash = require('../libs/core');
const download = require('../libs/download');

// Variables
const config = new Conf();
// const spinner = new Ora({text: 'Connecting to Unsplash', color: 'yellow', spinner: 'earth'});
const join = path.join;
const token = 'daf9025ad4da801e4ef66ab9d7ea7291a0091b16d69f94972d284c71d7188b34';
const apiUrl = `https://api.unsplash.com/photos/random?client_id=${token}`;
const log = console.log;

// Init
module.exports = fl => {
  let url = '';

  if (fl.user) {
    url = `${apiUrl}&&username=${fl.user}`;
  } else if (fl.featured) {
    url = `${apiUrl}&&featured=${fl.featured}`;
  } else if (fl.collection) {
    url = `${apiUrl}&&collection=${fl.collection}`;
  } else {
    url = `${apiUrl}`;
  }

  let dest = (fl.dest !== undefined && fl.dest.length) ? fl.dest : config.get('pic_dir');

  splash(url, photo => {
    download({
      filename: path.join(dest, `${photo.id}.jpg`),
      photo: photo
    }, fl, false);
  });

  log();
  log(`${chalk.yellow('Splash:')} Photo saved at ${dest}`);
  log();
};
