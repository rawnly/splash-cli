#!/usr/bin/env node

require('../libs/variables');
require('../libs/utility');

module.exports = () => {
  mkdirp(config.get('pic_dir'), (err) => {
    if (err) {log(err);}
  });

  del( config.get('pic_dir') );
  del( join(config.get('pic_dir'), 'thumbs') );
}
