class Simulation extends EventTarget {
	constructor() {
		super();
		this.gameCanvas = new GameCanvas(CANVAS_ID);
		this.quadTree = new QuadTree(QT_DEPTH, UNIVERSE_SIZE);
		this.timer = new Timer();
		this.gameState = "idle";
		this.particles = [];
		this.mouseParticlePresent = false;
		this.score = -1;
		this.stateBeginTimeSeconds = this.timer.currentTimeSeconds();
		this._runAnimation();
	}

	startGameOrFail() {
		try {
			this._changeGameState("countdown");
		} catch { }
	}

	_changeGameState(newGameState) {
		if (this.gameState === "running" && newGameState === "idle") {
			const finalScore = this._getRoundedScore();
			if (finalScore > 0) {
				this.dispatchEvent(new CustomEvent("gameover", { detail: { score: finalScore } }));
			}
		} else if (this.gameState === "idle" && newGameState === "countdown") {
			this.score = 0;
			this.particles = randomParticles(NUMBER_OF_PARTICLES);
		} else if (this.gameState === "countdown" && newGameState === "running") {
			this.score = 0;
		} else {
			throw new Error(`Invalid gamestate transition: ${this.gameState} -> ${newGameState}`);
		}

		this.stateBeginTimeSeconds = this.timer.currentTimeSeconds();
		this.gameState = newGameState;
	}

	_stepGame() {
		const elapsedSeconds = this.timer.currentTimeSeconds() - this.stateBeginTimeSeconds;

		if (this.gameState === "running") {
			if (elapsedSeconds > GAME_DURATION_SECONDS) {
				this._changeGameState("idle");
				return;
			}
			this._handleMouseParticle();
			this.quadTree.clearParticles();
			this.quadTree.insertParticles(this.particles);
			this.quadTree.stepSimulation();
			this._handleScore();
		} else if (this.gameState === "countdown") {
			if (elapsedSeconds > COUNTDOWN_DURATION_SECONDS) {
				this._changeGameState("running");
			}
		}
	}

	_draw() {
		const elapsedSeconds = this.timer.currentTimeSeconds() - this.stateBeginTimeSeconds;
		this.gameCanvas.clear();

		if (this.gameState === "running") {
			this.quadTree.drawParticles(this.gameCanvas);

			const graphicalRadius = BOUNDRY_RADIUS + PARTICLE_RADIUS + BOUNDRY_STROKE / 2;
			this.gameCanvas.drawCircle(UNIVERSE_CENTER, graphicalRadius, BOUNDRY_COLOR, BOUNDRY_STROKE);
			this.gameCanvas.drawCircle(UNIVERSE_CENTER, SCOREZONE_RADIUS, SCOREZONE_COLOR, SCOREZONE_STROKE);

			const startAngle = -Math.PI / 2;
			const endAngle = startAngle + 2 * Math.PI * (elapsedSeconds / GAME_DURATION_SECONDS);
			this.gameCanvas.drawCircle(UNIVERSE_CENTER, SCOREZONE_RADIUS, SCOREZONE_COLOR, 2 * SCOREZONE_STROKE, startAngle, endAngle);

			this.gameCanvas.drawText(this._getRoundedScore(), UNIVERSE_CENTER, SCORECOUNTER_FONT, SCORECOUNTER_COLOR);
		} else if (this.gameState === "countdown") {
			const stepDuration = COUNTDOWN_DURATION_SECONDS / 4;
			let text = "3";
			if (elapsedSeconds > 3 * stepDuration) text = "GO!";
			else if (elapsedSeconds > 2 * stepDuration) text = "1";
			else if (elapsedSeconds > 1 * stepDuration) text = "2";

			this.gameCanvas.drawText(text, UNIVERSE_CENTER, SCORECOUNTER_FONT, SCORECOUNTER_COLOR);
		} else if (this.gameState === "idle") {
			const text = this.score === -1 ? "Press Start" : `Final: ${this._getRoundedScore()}`;
			this.gameCanvas.drawText(text, UNIVERSE_CENTER, "40px Arial", SCORECOUNTER_COLOR);
		}
	}

	_handleMouseParticle() {
		const mouse = this.gameCanvas.getMouse();
		if (this.mouseParticlePresent) {
			this.particles.pop();
			this.mouseParticlePresent = false;
		}
		if (mouse.isActive && mouse.isPressed) {
			this.particles.push(new ImmovableParticle(mouse.pos, MOUSE_PARTICLE_CHARGE));
			this.mouseParticlePresent = true;
		}
	}

	_handleScore() {
		let particlesInScoreZone = 0;
		for (const particle of this.particles) {
			if (particle.pos.clone().sub(UNIVERSE_CENTER).mag() <= SCOREZONE_RADIUS) {
				particlesInScoreZone++;
			}
		}
		this.score += particlesInScoreZone * DELTA_TIME_SECONDS;
	}

	_runAnimation(currentTimeMillis = performance.now()) {
		this.timer.updateTime(currentTimeMillis);
		while (this.timer.shouldStepPhysics()) {
			this._stepGame();
		}
		this._draw();
		requestAnimationFrame((ts) => this._runAnimation(ts));
	}

	_getRoundedScore() {
		return Math.round(this.score);
	}
}
