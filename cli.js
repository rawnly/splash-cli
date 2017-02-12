#!/usr/bin/env node

require('./libs/variables');
require('./libs/utility');
const splash = require('./libs/core');

const cli = meow(`
  ` + `# Usage`.yellow.bold + `
    $ splash [--flags]

  ` + `# Help`.yellow.bold + `

    ${colors.blue.bold('## Search options')}

      -u --user <username>
      -f --featured
      -w --width <px>
      -h --heigth <px>
      -i --info                        ` + `# Get EXIF infos and Photographer infos.`.gray + `

      --collection <collection_ID>     ` + `# Filter by collection`.gray + `
      --id <id | photo_url>            ` + `# Get image by photo ID or URL.`.gray + `


    ${colors.blue.bold('## Other commands')}

      -l --list [extra flags]          ` + `# List of downloaded photos.`.gray + `
      -s --save [path] [extra flags]   ` + `# Save photo without setting it as wallpaper.`.gray + `
      -d --dir [path]                  ` + `# Set the main download directory.`.gray + `
      -u --update                      ` + `# Update to latest version.`.gray + `
      -c --clean                       ` + `# Delete all downloaded photos.`.gray + `

      --restore                        ` + `# Restore settings to default.`.gray + `
      --set                            ` + `# Set the saved photo [--save] as wallpaper.`.gray + `
      --export                         ` + `# Export the photo list [--list].`.gray, {

  alias: {
    l: 'list',
    c: 'clean',
    i: 'info',
    s: 'save',
    d: 'dir',
    u: 'update',
    w: 'width',
    h: 'heigth',
    u: 'user',
    f: 'featured'
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
          log('I need an internet connection!')
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
          log('I need an internet connection!')
          process.exit()
        }
      })

    } else if (flags.id) {
      // ID
      isOnline().then((value) => {
        if ( value ) {
          require('./options/id')(flags)
        } else {
          log('I need an internet connection!')
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
          let url = '';
          // let base = 'https://api.unsplash.com/photos/random?count=1';
          // let client = `client_id=${token}`;

          if ( flags.heigth && flags.width ) {
            url = `${api_url}&&w=${flags.width}&&h=${flags.heigth}`
          } else if ( flags.user ) {
            url = `${api_url}&&username=${flags.user}`
          } else if ( flags.featured ) {
            url = `${api_url}&&featured=${flags.featured}`
          } else if ( flags.collection ) {
            url = `${api_url}&&collection=${flags.collection}`
          } else {
            url = `${api_url}`
          }

          splash(url, (data, photo) => {
    				download(join(config.get('pic_dir'), data.name + '.jpg'), data.url, data.name, photo, flags);
    			})

        } else {
          log(colors.yellow('Splash:') + ' I need an internet connection!')
          process.exit()
        }
      })
  	}
  }
}

sp(cli.input[0], cli.flags)
