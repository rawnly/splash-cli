#!/usr/bin/env node

// Modules
const http = require('http');
const wallpaper = require('wallpaper');
const ora = require('ora');
const fs = require('fs');
const request = require('request');
const https = require('https');
const colors = require('colors');
const program = require('commander');
const mkdirp = require('mkdirp');
const updateNotifier = require('update-notifier');
const pkg = require('./package.json');

// Url elements
const token = 'daf9025ad4da801e4ef66ab9d7ea7291a0091b16d69f94972d284c71d7188b34';
const api_url = "https://api.unsplash.com/photos/random?client_id=" + token;

// various declarations
var spinner = new ora({
  text: 'Connecting to Unsplash',
  color: 'yellow',
  spinner: 'earth'
});

var photo,
    creator,
    file,
    photo_list,
    photo_name,
    path = __dirname + "/data.json";

program.version(pkg.version)
.option('-p, --path', 'Return the download directory.')
.option('-c --clean', 'Delete all downloaded photos.')
.option('-i --info', 'Display main photos infos')
.option('--id <id>', 'Get photo from the id.');

program.parse(process.argv);

if (program.path) {
  mkdirp(__dirname + '/photos/', (err) => {
    if (err) {console.log(err)};
  });

  console.log(__dirname + '/photos/');
  updateNotifier({pkg}).notify();

} else if (program.clean) {

  mkdirp(__dirname + '/photos/', (err) => {
    if (err) {console.log(err)};
  });

  del(__dirname + '/photos/');
  updateNotifier({pkg}).notify();

} else if ( program.id ) {

  var id = program.id;
  var api_url_id = "https://api.unsplash.com/photos/" + id + "?client_id=" + token;

  mkdirp(__dirname + '/photos/', (err) => {
    if (err) {console.log(err)};
  });

  // Init
  fs.access(__dirname + '/photos/' + id + '.jpg', (err) => {
    if (!err) {
      console.log('==> '.yellow.bold + 'You have this photo locally!');
      wallpaper.set(__dirname + '/photos/' + id + '.jpg');
    } else {
      // Show spinner
      spinner.start();

      // Start request
      request(api_url_id, function(error, response, body) {
          if (!error && response.statusCode == 200) {
              fs.writeFile(__dirname + '/data.json', body, (err) => {
                  // if error when writing then fail() else success;
                  if (err) {
                      spinner.text = "Can't connect. Check your connection!";
                      spinner.fail();
                  } else {
                      spinner.text = 'Connected!';
                      spinner.succeed();
                  }

                  file = fs.readFileSync(path, 'utf-8', (err) => {
                    if ( err ) {
                      throw err;
                    }
                  });

                  photo = JSON.parse(file);
                  photo_url = photo.urls.raw;
                  creator = {
                    fullname: photo.user.name,
                    username: '@' + photo.user.username
                  };

                  photo_name = photo.id;

                  download(__dirname + `/photos/${photo_name}.jpg`, photo_url);
                  updateNotifier({pkg}).notify();
              });
          }
      });
    }
  });

} else {
  // Init
  mkdirp(__dirname + '/photos/', (err) => {
    if (err) {console.log(err)};
  });
  // Show spinner
  spinner.start();
  // Start request
  request(api_url, function(error, response, body) {
      if (!error && response.statusCode == 200) {
          fs.writeFile(__dirname + '/data.json', body, (err) => {
              // if error when writing then fail() else success;
              if (err) {
                  spinner.text = "Can't connect. Check your connection!";
                  spinner.fail();
              } else {
                  spinner.text = 'Connected!';
                  spinner.succeed();
              }

              file = fs.readFileSync(path, 'utf-8', (err) => {
                if ( err ) {
                  throw err;
                }
              });

              photo = JSON.parse(file);
              photo_url = photo.urls.raw;
              creator = {
                fullname: photo.user.name,
                username: '@' + photo.user.username
              };

              photo_name = photo.id;

              download(__dirname + `/photos/${photo_name}.jpg`, photo_url);
              updateNotifier({pkg}).notify();
          });
      }
  });
}


function download(filename, url) {
  spinner.spinner = {
    frames: [
      '🚀'
    ]
  }
  spinner.text = 'Making something awsome';
  spinner.start();

  var file, request, status;

  file = fs.createWriteStream(filename);

  request = https.get(url, function(response) {
    response.pipe(file).on('finish', () => {
      wallpaper.set(__dirname + '/photos/' + photo_name + '.jpg');
      spinner.succeed();

      if ( program.info ) {
        console.log('');
        console.log('ID: ' + photo.id);
        console.log('');

        if ( photo.exif !== undefined ) {
          if (photo.exif.make) {
            console.log('Make: '.yellow.bold + photo.exif.make);
          } else {
            console.log('Make: '.yellow.bold + 'Unknown');
          }
          if (photo.exif.model) {
            console.log('Model: '.yellow.bold + photo.exif.model);
          } else {
            console.log('Model: '.yellow.bold + 'Unknown');
          }
          if (photo.exif.exposure_time) {
            console.log('Shutter Speed: '.yellow.bold + photo.exif.exposure_time);
          } else {
            console.log('Shutter Speed: '.yellow.bold + 'Unknown');
          }
          if (photo.exif.aperture) {
            console.log('Aperture:'.yellow.bold + ' f/' + photo.exif.aperture);
          } else {
            console.log('Aperture: '.yellow.bold + 'Unknown');
          }
          if (photo.exif.focal_length) {
            console.log('Focal Length: '.yellow.bold + photo.exif.focal_length);
          } else {
            console.log('Focal Length: '.yellow.bold + 'Unknown');
          }
          if (photo.exif.iso) {
            console.log('ISO: '.yellow.bold + photo.exif.iso);
          } else {
            console.log('ISO: '.yellow.bold + 'Unknown');
          }
        }
        console.log('');
        console.log('Shooted by: ' + creator.fullname.cyan.bold + ' (' + creator.username.yellow + ')' );
        console.log('Profile URL: ' + photo.user.links.self);
      } else {
        console.log('Shooted by: ' + creator.fullname.cyan.bold + ' (' + creator.username.yellow + ')' );
      }

      console.log('');
    });
  });
}

function del(directory) {

  fs.readdir(directory, function (err, files) {

    spinner.spinner = {
      frames: [
        '🚀'
      ]
    }
    spinner.text = 'Making something awsome';
    spinner.start()

    if ( files[0] ) {
      files.forEach(file => {
        fs.unlink(directory + file);
        spinner.text = 'Cleaned';
      });
      spinner.stopAndPersist('==>'.yellow.bold);
    } else {
      spinner.text = 'The directory is empty!'.bold;
      spinner.stopAndPersist('==>'.yellow.bold);
    }

  });
}
