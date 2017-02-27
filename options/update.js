// Modules
const Ora = require('ora');
const pkg = require('../package.json');
const execa = require('execa');

// ShortHands
const log = console.log;


module.exports = () => {
  const old = pkg.version;
  const spin = new Ora({
    text: 'Updating with...',
    spinner: 'dots',
    color: 'yellow',
  });

  log();

  spin.start();

  execa('npm', ['install', '--global', 'splash-cli']).then(() => {
    spin.text = `Splash updated: ${old.toString().yellow} ==> ${pkg.version.toString().green}!`.gray;
    spin.succeed(spin.text);
    log();
  });
};
