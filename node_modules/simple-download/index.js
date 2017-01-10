const fs = require('fs')
const https = require('https')
const path = require('path')
const random = require('randomstring')

module.exports = (file_name, url, destination, callback) => {
	'use strict'
	if ( !file_name || file_name === 'random') {
		file_name = random.generate({
			length: 12,
			charset: 'readable',
			capitalization: 'lowercase'
		}) + path.extname(url)
	}

	if ( !callback ) {
		callback = () => {
			null
		}
	}

	var join = path.join
	var file = fs.createWriteStream( join(destination, file_name) )

	https.get(url, function(response) {
		response.pipe(file).on('finish', () => {
			callback()
		})
	})
}
