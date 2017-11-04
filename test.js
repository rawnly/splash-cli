// This file was created with "better_touch_files"
const got = require('got');
const fs = require('fs');

async function main(url) {

}

function newPhoto(url) {
	got.stream(url).pipe(fs.createWriteStream('test/old-method.jpg'));
}

main('https://api.unsplash.com/photos/w58KovW_d0A/download?client_id=daf9025ad4da801e4ef66ab9d7ea7291a0091b16d69f94972d284c71d7188b34');

newPhoto('https://images.unsplash.com/photo-1440993443326-9e9f5aea703a');
