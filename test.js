import test from 'ava'
import got from 'got'
import execa from 'execa'
import ProgressBar from 'progress'
import del from './libs/utility'
import mkdirp from 'mkdirp'
import fs from 'fs'
import path from 'path'
// import * from 'chili-js'

test('checking the client_id', t => {
  let url = 'https://api.unsplash.com/photos/random?client_id=daf9025ad4da801e4ef66ab9d7ea7291a0091b16d69f94972d284c71d7188b34'

  got(url).then(response => {
    let body = repsonse.body;
    if ( body ) {
      return true
    }
  }).catch(err => {
    throw new Error(err.response.body)
  })
})

test('checking splash', t => {
  execa('node', ['cli.js', '--save .']).then(res => {
    execa('rm', ['*.jpg']).then(res => {
      return true
    })
  })
})

test('Testing progressbar', t => {
  var bar = new ProgressBar('Testing :percent [:bar] ', {total: 10, complete: '↓', incomplete: '.'})
  var id = setInterval(function () {
    bar.tick(1)
    if (bar.complete) {
      clearInterval(id)
    }
  }, 1000);
})

test('Testing del', f => {
  var files = [
    'testfile_#1.md',
    'testfile_#2.md',
    'testfile_#3.md',
    'testfile_#4.md'
  ];

  mkdirp('./testingFolder')

  files.forEach((item) => {
    fs.writeFile('./testingFolder/' + item, `# ${item} \n> Testing file number ${ item.split('#')[1].split('.md').join('') }`, (err, data) => {
      if (!err) {
        return true
      } else {
        throw new Error(err)
      }
    })
  })
})
