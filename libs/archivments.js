module.exports = (list, counter) => {
	let unlocked = false;

	if (list) {
		list.forEach(archivment => {
			if (counter === archivment.downloads) {
				unlocked = archivment;
			}
		});
	}

	return unlocked;
};
