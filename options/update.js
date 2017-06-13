// Modules

const Ora = require('ora');
const execa = require('execa');
const chalk = require('chalk');
const got = require('got');
const pkg = require('../package.json');

// ShortHands
const log = console.log;

module.exports = () => {
  const old = pkg.version;
  const spin = new Ora({
    text: `Checking for ${chalk.yellow('YARN')}...`,
    spinner: 'dots',
    color: 'yellow'
  });

  log();

  spin.start();

  execa('yarn', ['--version']).then(r => {
    spin.succeed()
    spin.text = "[YARN] Updating";
    spin.start()
    execa('yarn', ['global', 'add', 'splash-cli']).then(r => {
      got('https://raw.githubusercontent.com/Rawnly/splash-cli/master/package.json').then(({body}) => {
        body = JSON.parse(body);
        spin.text = `Splash updated: ${chalk.yellow(old)} ==> ${chalk.green(body.version)}!`;
        spin.succeed(spin.text);
      });
    })
  }).catch(e => {
    spin.fail();
    spin.text = "Checking for " + chalk.yellow('node package manager');
    spin.start();
    execa('npm', ['--version']).then(() => {
      spin.succeed();
      spin.text = "[NPM] Updating";
      spin.start()
      execa('npm', ['install', '--global', 'splash-cli']).then(r => {
        got('https://raw.githubusercontent.com/Rawnly/splash-cli/master/package.json').then(({body}) => {
          body = JSON.parse(body);
          spin.text = `Splash updated: ${chalk.yellow(old)} ==> ${chalk.green(body.version)}!`;
          spin.succeed(spin.text);
        });
      })
    }).catch(e => {
      console.log('Unable to update.', e);
    })
  })
}
