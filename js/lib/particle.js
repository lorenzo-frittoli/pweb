// Class for simulation particles.
class Particle {
	constructor(
		pos,
		charge = PARTICLE_CHARGE,
		mass = PARTICLE_MASS,
		radius = PARTICLE_RADIUS,
		color = PARTICLE_COLOR,
		velocity = new Complex(),
		force = new Complex(),
	) {
		this.pos = pos;
		this.velocity = velocity;
		this.force = force;
		this.mass = mass;

		// Complex charge is used to handle both gravity and electrostatics
		// aka both repulsive and attractive fields:
		// - Repulsive: charge = Complex(charge, 0)
		// - Attractive: charge = Complex(0, charge)
		// In particular, for gravity, charge = Complex(0, sqrt(G) * mass)
		this.charge = new Complex(charge, 0.0);

		this.radius = radius;
		this.color = color;
	}

	// Handles near-field interactions
	interact(other) {
		if (this === other) return;

		const dZ = this.pos.clone().sub(other.pos);

		// Softening: prevents absurde forces by limiting close interactions
		const r2 = dZ.re * dZ.re + dZ.im * dZ.im;
		if (r2 < 1.0) return;

		// TODO: put formula here
		const interactionForce = this.charge.clone().mulComplex(other.charge).divComplex(dZ);
		interactionForce.im = -interactionForce.im;

		this.force.add(interactionForce);
	}

	// Updates position
	update() {
		console.assert(!isNaN(this.pos.re) && !isNaN(this.pos.im));

		// Leapfrog integration
		// a = F/m
		const a_curr = this.force.clone().divScalar(this.mass);

		// v(t + dt) = v(t) + a(t) * dt
		const dv = a_curr.clone().mulScalar(DELTA_TIME_SECONDS);
		this.velocity.add(dv).mulScalar(FRICTION);

		// x(t + dt) = x(t) + v(t + dt) * dt
		const dp = this.velocity.clone().mulScalar(DELTA_TIME_SECONDS);
		this.pos.add(dp);

		// Circular Wall-Bounce Effect
		this._handleCircleBound();

		// Reset forces
		this.force.re = 0.0;
		this.force.im = 0.0;

		console.assert(!isNaN(this.pos.re) && !isNaN(this.pos.im));
	}

	// Draws to canvas
	draw(gameCanvas) {
		gameCanvas.drawCircle(this.pos, this.radius, this.color, 0);
	}

	// Handles the bouncy circle border
	_handleCircleBound() {
		const distance = this.pos.clone().sub(UNIVERSE_CENTER);

		if (distance.mag() <= BOUNDRY_RADIUS) return;

		const normal = distance.clone().norm();

		// Clamp position
		const newPos = UNIVERSE_CENTER.clone().add(normal.clone().mulScalar(BOUNDRY_RADIUS));
		// this.pos = newPos; doesn't work due to object reassignment
		this.pos.re = newPos.re;
		this.pos.im = newPos.im;

		// Fix for getting stuck in the border
		const dotProduct = normal.dot(this.velocity);
		if (dotProduct > 0) {
			// Calculate bounce dampening based on angle of approach
			const restitution = 1.0 + BOUNCE_DAMPENING;
			this.velocity.sub(normal.clone().mulScalar(restitution * dotProduct));
		}
	}
}

// This type of particle applies forces to other particles but
// does not do physics updates and is invisible.
// It is used for user interactions.
class ImmovableParticle extends Particle {
	constructor(pos, charge) {
		super(pos, charge)
	}

	// Dummy methods
	update() { }
	draw(gameCanvas) { }
}
