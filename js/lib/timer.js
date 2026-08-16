// Handles delta time discrepancy between frame rendering and simulation speed
class Timer {
	constructor() {
		this.accumulator = 0.0;
		// Millis -> seconds
		this.lastTime = performance.now() / 1000.0;
	}

	// Updates the current time.
	// Must be called at the beginning of every frame.
	updateTime(currentTimeMillis) {
		// requestAnimationFrame passes milliseconds, so we convert it to seconds here
		const currentTimeSeconds = currentTimeMillis / 1000.0;

		let elapsedSeconds = currentTimeSeconds - this.lastTime;
		this.lastTime = currentTimeSeconds;

		elapsedSeconds = Math.min(elapsedSeconds, 0.25);

		this.accumulator += elapsedSeconds;
	}

	// Returns true if you should run a physics update.
	// WARN:
	//	Must be called multiple times per frame (while loop); 
	//	after every positive call, a physics update must be performed.
	shouldStepPhysics() {
		if (this.accumulator >= DELTA_TIME_SECONDS) {
			this.accumulator -= DELTA_TIME_SECONDS;
			return true;
		}
		return false;
	}
}
