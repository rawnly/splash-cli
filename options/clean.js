require('chili-js');

const mkdirp = require('mkdirp');
const ProgressBar = require('progress');
const path = require('path');
const fs = require('fs');
const Conf = require('conf');

const config = new Conf();
const log = console.log;
const join = path.join;

// Delete elements
function del(directory) {
  log();
  fs.readdir(directory, (err, files) => {
    const imgs = [];
    files.forEach((item) => {
      if (item.includes('.jpg')) {
        imgs.push(item);
      }
    });
    if (imgs[0]) {
      const bar = new ProgressBar(`Deleted: ${':current'.green} of ${':total'.green}files from ${config.get('pic_dir').toString().blue}`, {
        total: imgs.length,
      });
      log('');

      files.forEach((file) => {
        if (file.includes('.jpg')) {
          fs.unlink(join(directory, `${file}`), () => {
            bar.tick(1);
          });
        }
      });
    } else {
      log('');
      console.log(`${'\n✦'.yellow.bold}The directory is empty!`);
      log('');
    }
  });
}


module.exports = () => {
  mkdirp(config.get('pic_dir'), (err) => {
    if (err) { log(err); }
  });

  del(config.get('pic_dir'));
};
