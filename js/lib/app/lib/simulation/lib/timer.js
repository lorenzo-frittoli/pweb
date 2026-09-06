class Timer {
	constructor() {
		this.accumulator = 0.0;
		this.lastTimeSeconds = performance.now() / 1000.0;
	}

	currentTimeSeconds() {
		return this.lastTimeSeconds;
	}

	updateTime(currentTimeMillis) {
		const currentTimeSeconds = currentTimeMillis / 1000.0;

		let elapsedSeconds = currentTimeSeconds - this.lastTimeSeconds;
		this.lastTimeSeconds = currentTimeSeconds;

		elapsedSeconds = Math.min(elapsedSeconds, 0.25);

		this.accumulator += elapsedSeconds;
	}

	// Returns true if you should run a physics update.
	// Must be called multiple times per frame (while loop); 
	// after every positive call, a physics update must be performed.
	shouldStepPhysics() {
		if (this.accumulator >= DELTA_TIME_SECONDS) {
			this.accumulator -= DELTA_TIME_SECONDS;
			return true;
		}
		return false;
	}
}
