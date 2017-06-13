// This file was created with "better_touch_files"
const ora = require('ora');
const execa = require('execa');
const chalk = require('chalk');

const spin = new ora({
  text: 'Checking for yarn..',
  spinner: 'dots',
  color: 'cyan'
});


spin.start()

execa('yarn', ['--version']).then(r => {
  spin.succeed()
  spin.text = "[YARN] Updating";
  spin.start()
  execa('yarn', ['global', 'add', 'simple-download-cli']).then(r => {
    spin.succeed();
    console.log('Simple has been installed!');
  })
}).catch(e => {
  spin.fail();
  spin.text = "Checking for " + chalk.yellow('node package manager');
  spin.start();
  execa('npm', ['--version']).then(() => {
    spin.succeed();
    spin.text = "[NPM] Updating";
    spin.start()
    execa('npm', ['install', '--global', 'simple-download-cli']).then(r => {
      spin.succeed();
      console.log('Simple has been installed!');
    })
  }).catch(e => {
    console.log('Unable to update.', e);
  })
})
