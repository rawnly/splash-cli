import test from 'ava'
import got from 'got'

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
