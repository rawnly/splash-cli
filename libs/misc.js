// FUNCTION
const opn = require('opn');
const chalk = require('chalk');

module.exports = {
  openURL: openURL,
  error: error
};

function openURL(url) {
  return new Promise(function(resolve, reject) {
    opn(url);
    resolve();
  });
}

function error(e, opt = {message: 'Splash Error', colors: {
  message: 'yellow',
  error: 'red'
}}) {
  console.log('');
  console.log(chalk`{${opt.colors.message} ${opt.message}:} {${opt.colors.error} ${e}}`);
  console.log('');
  throw new Error(e);
  console.log('');
}
