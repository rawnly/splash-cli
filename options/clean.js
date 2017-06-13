const path = require('path');
const fs = require('fs');
const mkdirp = require('mkdirp');
const ProgressBar = require('progress');
const Conf = require('conf');
const chalk = require('chalk');

const config = new Conf();
const log = console.log;
const join = path.join;

// Delete elements

function del(directory) {
  fs.readdir(directory, (err, files) => {
    if (err) {
      throw new Error(err);
    }

    const imgs = [];

    files.forEach(item => {
      if (item.includes('.jpg')) {
        imgs.push(item);
      }
    });

    if (imgs[0]) {
      const bar = new ProgressBar(`
Deleted: ${chalk.green(':current')} of ${chalk.green(':total')} files from ${chalk.yellow(config.get('pic_dir'))}
      `, {
        total: imgs.length
      });

      files.forEach(file => {
        if (file.includes('.jpg')) {
          fs.unlink(join(directory, `${file}`), () => {
            bar.tick(1);
          });
        }
      });
    } else {
      console.log(`
${chalk.yellow.bold('✦')} The directory is empty!
      `);
    }
  });
}

module.exports = () => {
  mkdirp(config.get('pic_dir'), err => {
    if (err) {
      log(err);
    }
  });

  del(config.get('pic_dir'));
};
