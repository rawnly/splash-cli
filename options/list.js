
// Modules
const Conf = require('conf');
const fs = require('fs');
const colors = require('colors');
const clear = require('clear');

// Variables
const jparse = JSON.parse;
const jstringify = JSON.stringify;
const config = new Conf();
const log = console.log;

// Init
module.exports = (fl) => {
  fs.readdir(config.get('pic_dir'), (err, files) => {
    if (err) { log(err); } else if (files[0]) {
      files.sort();

      let list = [];

      files.forEach((item) => {
        if (item.charAt(0) !== '.' && item !== 'thumbs') {
          const newItem = item.slice(0, item.length - 4);
          list.push(newItem);
        }
      });

      clear();

      if (!list.length > 0) {
        log();
        log('Splash:'.yellow + ' No photos found'.gray);
        log();
        process.exit();
      }

      log('');
      log(`${list.length.toString().yellow.bold} Photos`);
      log('');

      list.sort();

      list = jstringify(list);
      list = jparse(list);

      if (!fl.export) {
        log(list);
        log('');
      }

      if (fl.export && list.length > 0) {
        fs.writeFile('./list.json', jstringify(list), (error) => {
          if (error) throw new Error(err);
          log('---');
          log(`File written at: ${'./list.json'.blue}`);
          log('');
        });
      }
    } else {
      log('---');
      log(colors.yellow('Splash:') + ' The directory is empty'.gray);
      log('');
    }
  });
};
