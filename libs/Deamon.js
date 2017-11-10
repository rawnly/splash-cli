const pm2 = require('pm2');

class Deamon {
	constructor(scriptPath, name = 'splash-cli') {
		this.name = name;
		this.file = scriptPath;
		this.isRunning = false;
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

	start() {
		pm2.connect(err => {
			if (err) {
				throw new Error(err);
			}

			pm2.start({
				name: this.name,
				maxMemoryRestart: '100M',
				script: this.file
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

			pm2.delete(this.name, error => {
				if (error) {
					throw new Error(error);
				}

				console.log('Deamon has been deleted...');
				this.isRunning = false;

				pm2.disconnect();
			});
		});
	}
}

module.exports = Deamon;
