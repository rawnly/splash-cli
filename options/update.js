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
    text: 'Updating...',
    spinner: 'dots',
    color: 'yellow'
  });

  log();

  spin.start();

  execa('npm', ['install', '--global', 'splash-cli']).then(() => {
    got('https://raw.githubusercontent.com/Rawnly/splash-cli/master/package.json').then(({body}) => {
      body = JSON.parse(body);
      spin.text = `Splash updated: ${chalk.yellow(old)} ==> ${chalk.green(body.version)}!`;
      spin.succeed(spin.text);
    });
    log();
  });
};
