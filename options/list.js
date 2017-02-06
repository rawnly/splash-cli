#!/usr/bin/env node

require('../libs/variables');
require('../libs/utility');

module.exports = (fl) => {
  fs.readdir( config.get('pic_dir'), (err, files) => {
    if (err) { log(err); } else {
      if ( files[0] ) {

        files.sort();

        let list = [];

        files.forEach((item) => {
          if ( item.charAt(0) !== '.' && item !== 'thumbs' ) {
            item = item.slice(0, item.length - 4);
            list.push(item);
          }
        });

        clear();

        log('');
        log(list.length.toString().yellow.bold + ' Photos');
        log('');

        list.sort();

        list = jstringify(list);
        list = jparse(list);

        log(list);
        log('');

        if ( fl.export ) {
          jsonfile.writeFile('./list.json', list, (err) => {
            if ( err ) { return err; } else {
              log( 'File written at: ' + 'list.txt'.gray );
            }
          });
        }

      } else {
        log('==> Directory is empty'.gray);
      }
    }
  })
}
