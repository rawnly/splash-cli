// Modules
const Ora = require('ora');
const execa = require('execa');
const chalk = require('chalk');
const pkg = require('../package.json');

// ShortHands
const log = console.log;

module.exports = () => {
  const old = pkg.version;
  const spin = new Ora({
    text: 'Updating with...',
    spinner: 'dots',
    color: 'yellow'
  });

  log();

  spin.start();

  execa('npm', ['install', '--global', 'splash-cli']).then(() => {
    spin.text = `Splash updated: ${chalk.yellow(old)} ==> ${chalk.green(pkg.version)}!`;
    spin.succeed(spin.text);
    log();
  });
};
