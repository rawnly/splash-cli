#!/usr/bin/env node

require('../libs/variables');
require('../libs/utility');

module.exports = (string) => {

  let old = notifier.update ? notifier.update.current : pkg.version;
  let spin = new ora({
    text: 'Updating with ...',
    spinner: 'dots',
    color: 'yellow'
  })

  log()

  spin.start()

  execa('npm', ['install', '--global', 'splash-cli']).then(() => {
    let _new = notifer.update ? notifer.update.latest : pkg.version
    spin.text = `Splash updated: ${old.toString().yellow} ==> ${_new.toString().green}!`.gray
    spin.succeed(spin.text)
    log()
  })
}
