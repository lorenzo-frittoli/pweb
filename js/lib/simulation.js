// Handles everything about the interactive environment.
class Simulation {
	constructor() {
		// Components
		this.gameCanvas = new GameCanvas(CANVAS_ID);
		this.quadTree = new QuadTree(QT_DEPTH, UNIVERSE_SIZE);
		this.timer = new Timer();

		// Attributes
		this.particles = randomParticles(NUMBER_OF_PARTICLES);
		this.mouseParticlePresent = false;
		this.score = 0;
	}

	// Calculate new forces and step forward particle simulation
	_stepSimulation() {
		this._handleMouseParticle();
		this.quadTree.clearParticles();
		this.quadTree.insertParticles(this.particles);
		this.quadTree.stepSimulation();
		this._handleScore();
	}

	// Draw to canvas
	_draw() {
		// Clear canvas
		this.gameCanvas.clear();

		// Draw particles
		this.quadTree.drawParticles(this.gameCanvas);

		// Draw boundry zone
		const graphicalRadius = BOUNDRY_RADIUS + PARTICLE_RADIUS + BOUNDRY_STROKE / 2;
		this.gameCanvas.drawCircle(UNIVERSE_CENTER, graphicalRadius, BOUNDRY_COLOR, BOUNDRY_STROKE);

		// Draw winning zone
		this.gameCanvas.drawCircle(UNIVERSE_CENTER, SCOREZONE_RADIUS, SCOREZONE_COLOR, SCOREZONE_STROKE);

		// Draw current score (rounded)
		this.gameCanvas.drawText(this.getRoundedScore(), UNIVERSE_CENTER, SCORECOUNTER_FONT, SCORECOUNTER_COLOR, true);
	}

	// Handles player interaction with the simulation
	_handleMouseParticle() {
		const mouse = this.gameCanvas.getMouse();
		if (this.mouseParticlePresent) {
			this.particles.pop();
			this.mouseParticlePresent = false;
		}
		if (mouse.isActive && mouse.isPressed) {
			const mouseParticle = new ImmovableParticle(mouse.pos, MOUSE_PARTICLE_CHARGE);
			this.particles.push(mouseParticle);
			this.mouseParticlePresent = true;
		}
	}

	// Handles player score during the game
	_handleScore() {
		// Count winning particles
		let particlesInScoreZone = 0;
		for (const particle of this.particles) {
			const distance = particle.pos.clone().sub(UNIVERSE_CENTER).mag();
			if (distance <= SCOREZONE_RADIUS)
				particlesInScoreZone++;
		}

		// Score is number of winning particles / second
		const currentFrameScore = particlesInScoreZone * DELTA_TIME_SECONDS;
		this.score += currentFrameScore;
	}

	// Recursive animation function (requestAnimationFrame)
	runAnimation(currentTime = performance.now()) {
		this.timer.updateTime(currentTime);

		while (this.timer.shouldStepPhysics()) {
			this._stepSimulation();
		}

		this._draw();

		// Wrapping class method in arrow function to preserve `this` context
		requestAnimationFrame((timestamp) => this.runAnimation(timestamp));
	}

	getRoundedScore() { return Math.round(this.score); }
}
