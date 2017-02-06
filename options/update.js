#!/usr/bin/env node

require('../libs/variables');
require('../libs/utility');

module.exports = (string) => {

  let old = pkg.version;
  let spin = new ora({
    text: 'Updating with ...',
    spinner: 'dots',
    color: 'yellow'
  })

  log()

  spin.start()

  execa('npm', ['install', '--global', 'splash-cli']).then(() => {
    spin.text = `Splash updated: ${old.toString().yellow} ==> ${pkg.version.toString().green}!`.gray
    spin.succeed(spin.text)
    log()
  })
}
