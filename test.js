import test from 'ava';
import got from 'got';
import execa from 'execa';
import ProgressBar from 'progress';

test('checking the client_id', () => {
  const url = 'https://api.unsplash.com/photos/random?client_id=daf9025ad4da801e4ef66ab9d7ea7291a0091b16d69f94972d284c71d7188b34';

  got(url).then(({ body }) => {
    if (body) {
      return true;
    }
    return false;
  }).catch((err) => {
    throw new Error(err.response.body);
  });
});

test('checking splash', () => {
  execa('node', ['cli.js', '--save .']).then(() => {
    execa('rm', ['*.jpg']).then(() => true);
  });
});

test('Testing progressbar', () => {
  const bar = new ProgressBar('Testing :percent [:bar] ', { total: 10, complete: '↓', incomplete: '.' });
  const id = setInterval(() => {
    bar.tick(1);
    if (bar.complete) {
      clearInterval(id);
    }
  }, 1000);
});
