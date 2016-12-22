#!/usr/bin/env node

// Modules
const http = require('http');
const wallpaper = require('wallpaper');
const ora = require('ora');
const fs = require('fs');
const request = require('request');
const https = require('https');
const randomstring = require("randomstring");
const colors = require('colors');
const program = require('commander');

// Url elements
const token = 'daf9025ad4da801e4ef66ab9d7ea7291a0091b16d69f94972d284c71d7188b34';
const api_url = "https://api.unsplash.com/photos/random?client_id=" + token;
const photo_name = randomstring.generate(5);

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
    path = __dirname + "/data.json";

program.version('v0.1.1')
.option('-p, --path', 'Return the download directory')
.option('-c --clean', 'Delete all downloaded photos');

program.parse(process.argv);

if (program.path) {
  console.log(__dirname + '/photos/');
} else if (program.clean) {
  del(__dirname + '/photos/');
} else {
  // Init
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

              download(__dirname + `/photos/${photo_name}.jpg`, photo_url);
          });
      }
  });
}


download = (filename, url) => {
  spinner.text = 'Downloading & Setting Up';
  spinner.spinner = {
    interval: 500,
    frames: ['📦']
  }
  spinner.start();

  var file, request, status;

  file = fs.createWriteStream(filename);

  request = https.get(url, function(response) {
    response.pipe(file).on('finish', () => {
      wallpaper.set(__dirname + '/photos/' + photo_name + '.jpg');
      spinner.text = 'Done!';
      spinner.succeed();
      console.log('Shooted by: ' + creator.fullname.cyan.bold + ' (' + creator.username.yellow + ')' );
    });
  });
}

function del(directory) {
  fs.readdir(directory, function (err, files) {
    photo_list = [];

    spinner.spinner = {
      frames: [
        '🗑'
      ]
    }
    spinner.text = 'Deleting';
    spinner.start()

    files.forEach(file => {
      fs.unlink(directory + file);
    });

    if ( !files[1] ) {
      spinner.stopAndPersist('⚠️');
    } else {
      spinner.fail();
    }

  });
}
