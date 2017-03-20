// Modules
const normalize = require('normalize-url');
const clear = require('clear');
const got = require('got');
const Ora = require('ora');
const chalk = require('chalk');

// Variables
const log = console.log;
const jparse = JSON.parse;
const spinner = new Ora({text: 'Connecting to Unsplash', color: 'yellow', spinner: 'earth'});

module.exports = (url, callback) => {
  got(normalize(url)).then(response => {
    spinner.text = 'Connected!';
    spinner.succeed();

    const body = response.body;
    const photo = jparse(body);

    callback(photo);
  }).catch(err => {
    clear();
    spinner.stop();
    log();
    log(chalk.yellow('Splash Error: ') + err.message);
    log();
    throw new Error(err);
  });
};
