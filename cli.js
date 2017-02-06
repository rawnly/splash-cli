#!/usr/bin/env node

require('./libs/variables');
require('./libs/utility');
const splash = require('./libs/core');

const cli = meow(`
  ` + `# Usage`.yellow.bold + `
    $ splash [--flags]

  ` + `# Help`.yellow.bold + `
    -l --list [extra flags]          ` + `# List of downloaded photos.`.gray + `
    -s --save [path] [--extra]       ` + `# Save photo without setting it as wallpaper.`.gray + `
    -d --dir [path]                  ` + `# Set the main download directory.`.gray + `
    -u --update                      ` + `# Update to latest version.`.gray + `
    -i --info                        ` + `# Get EXIF infos and Photographer infos.`.gray + `
    -c --clean                       ` + `# Delete all downloaded photos.`.gray + `
    --id <id | photo_url>            ` + `# Get image by photo ID or URL.`.gray + `
    --restore                        ` + `# Restore settings to default.`.gray + `
    --set                            ` + `# Set the saved photo [--save] as wallpaper.`.gray + `
    --export                         ` + `# Export the photo list [--list].`.gray + `

  ` + `# Example Combinations`.yellow.bold + `
    ${chalk.green('1) Export photo list: ')}      ${chalk.green.inverse('$ splash --list --export')}
    ${chalk.green('2) Get photo id info:')}       ${chalk.green.inverse('$ splash -i --id <id | url>')}
    ${chalk.green('3) Set saved photo as \n       wallpaper and get infos:')} ${chalk.green.inverse(`$ splash -i --save ${colors.underline('~/Desktop')} --set`)}
`, {
  alias: {
    l: 'list',
    c: 'clean',
    i: 'info',
    s: 'save',
    d: 'dir',
    u: 'update'
  }
})

function sp(action, flags) {
  if ( notifier.update ) {
    if (flags.update) {
      require('./options/update')()
    } else {
      notifier.notify({
        message: `${chalk.dim(notifier.update.current)} -> ${chalk.green(notifier.update.latest)}` +
        `\n Run ${chalk.cyan('splash --update')} to update`,
        boxenOpts: {
          padding: 1,
      		margin: 2,
      		align: 'center',
      		borderColor: 'yellow',
      		borderStyle: 'double'
        }
      })
    }

  } else {
    if ( flags.restore ) {
      // RESTORE
      require('./options/restore')();

    } else if ( flags.update ) {
      // UPDATE
      isOnline().then((value) => {
        if ( value ) {
          require('./options/update')()
        } else {
          log('i need an interet connection!')
          process.exit()
        }
      })

    } else if (flags.clean) {
      // CLEAN
      require('./options/clean')()

    } else if (flags.list) {
      // LIST ( --EXPORT )
      require('./options/list')(flags)

    } else if (flags.save) {
      // SAVE ( --SET )
      isOnline().then((value) => {
        if ( value ) {
          require('./options/save')(flags)
        } else {
          log('i need an interet connection!')
          process.exit()
        }
      })

    } else if (flags.id) {
      // ID
      isOnline().then((value) => {
        if ( value ) {
          require('./options/id')(flags)
        } else {
          log('I need an interet connection!')
          process.exit()
        }
      })

    } else if (flags.dir) {
      // Dir
      require('./options/dir')(flags)

    } else {
      // Splash Classic
      isOnline().then((value) => {
        if ( value ) {
          splash(api_url, (data, photo) => {
    				download(join(config.get('pic_dir'), data.name + '.jpg'), data.url, data.name, photo, flags);
    			})
        } else {
          log('I need an interet connection!')
          process.exit()
        }
      })
  	}
  }
}

sp(cli.input[0], cli.flags)
