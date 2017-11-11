const pm2 = require('pm2');

class Deamon {
	constructor(file, name = 'splash-cli', {instances, killTimeout, maxMemoryRestart, execMode} = {}) {
		this.name = name;
		this.file = file;
		this.isRunning = false;
		this.options = {
			instances: instances || 1,
			maxMemoryRestart: maxMemoryRestart || '100M',
			killTimeout: killTimeout || undefined,
			execMode: execMode || 'cluster'
		};
	}

	list() {
		pm2.connect(err => {
			if (err) {
				throw new Error(err);
			}

			pm2.list((err, deamons) => {
				if (err) {
					throw new Error(err);
				}

				deamons = deamons.map(deamon => {
					return deamon.name;
				});

				console.log(deamons);

				pm2.disconnect();
			});
		});
	}

	start(force = false) {
		pm2.connect(err => {
			if (err) {
				throw new Error(err);
			}

			pm2.start({
				name: this.name,
				maxMemoryRestart: this.options.maxMemoryRestart,
				script: this.file,
				force: force,
				execMode: this.options.execMode,
				instances: this.options.instances,
				killTimeout: this.options.killTimeout
			}, error => {
				if (error) {
					throw new Error(error);
				}

				console.log('Deamon is running...');
				this.isRunning = true;
				pm2.disconnect();
			});
		});
	}

	stop() {
		pm2.connect(err => {
			if (err) {
				throw new Error(err);
			}

			pm2.stop(this.name, error => {
				if (error) {
					throw new Error(error);
				}

				console.log('Deamon is stopping...');
				this.isRunning = false;

				pm2.disconnect();
			});
		});
	}

	delete() {
		pm2.connect(err => {
			if (err) {
				throw new Error(err);
			}

			pm2.list((err, list) => {
				if (err) {
					throw err;
				}

				list = list.map(item => {
					return item.name;
				}).filter(item => {
					return item === this.name;
				});

				if (list.length) {
					pm2.delete(this.name, error => {
						if (error) {
							throw new Error(error);
						}

						console.log('Deamon has been deleted...');
						this.isRunning = false;

						pm2.disconnect();
					});
				}

				pm2.disconnect();
			});
		});
	}
}

module.exports = Deamon;
