module.exports = (list, counter) => {
	let unlocked = false;

	list.forEach(archivment => {
		if (counter === archivment.downloads) {
			unlocked = archivment;
		}
	});

	return unlocked;
};
