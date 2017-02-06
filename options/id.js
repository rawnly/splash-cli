#!/usr/bin/env node

require('../libs/variables');
require('../libs/utility');

const splash = require('../libs/core');

module.exports = (fl) => {
  var parse = (string) => {
    return normalize(string).match( urlRegex ) ? normalize(string).split('?photo=')[1] : string;
  }

  var id = parse(fl.id) ? parse(fl.id) : fl.id;
  var api_url_id = 'https://api.unsplash.com/photos/' + id + '?client_id=' + token;

  mkdirp(config.get('pic_dir'), (err) => {
    if (err) {log(err);}
  });

  log(id)


  fs.exists( join(config.get('pic_dir'), `${id}.jpg`), (exists) => {
    if (!exists) {
      splash(api_url_id, (data, photo) => {
        download( join(config.get('pic_dir'), data.name + '.jpg'), data.url, data.name, photo, fl);
      });

    } else {
      log(`You have this photo (${id}.jpg) locally!`);
      wallpaper.set( join(config.get('pic_dir'), `${id}.jpg`) );
    }
  });

}
