class Particle {
	constructor(
		pos,
		charge = PARTICLE_CHARGE,
		mass = PARTICLE_MASS,
		radius = PARTICLE_RADIUS,
		color = PARTICLE_COLOR,
		velocity = new Complex(),
		force = new Complex()
	) {
		// Complex charge is used to handle both gravity and electrostatics
		// aka both repulsive and attractive fields:
		// - Repulsive: charge = Complex(charge, 0)
		// - Attractive: charge = Complex(0, charge)
		this.pos = pos;
		this.velocity = velocity;
		this.force = force;
		this.mass = mass;
		this.charge = new Complex(charge, 0.0);
		this.radius = radius;
		this.color = color;
	}

	interact(other) {
		if (this === other) return;
		const dZ = this.pos.clone().sub(other.pos);
		const r2 = dZ.re * dZ.re + dZ.im * dZ.im;
		if (r2 < 1.0) return;
		const interactionForce = this.charge.clone().mulComplex(other.charge).divComplex(dZ);
		interactionForce.im = -interactionForce.im;
		this.force.add(interactionForce);
	}

	update() {
		const a_curr = this.force.clone().divScalar(this.mass);
		const dv = a_curr.clone().mulScalar(DELTA_TIME_SECONDS);
		this.velocity.add(dv).mulScalar(FRICTION);
		const dp = this.velocity.clone().mulScalar(DELTA_TIME_SECONDS);
		this.pos.add(dp);

		this._handleCircleBound();

		this.force.re = 0.0;
		this.force.im = 0.0;
	}

	draw(gameCanvas) {
		gameCanvas.drawCircle(this.pos, this.radius, this.color, 0);
	}

	_handleCircleBound() {
		const distance = this.pos.clone().sub(UNIVERSE_CENTER);
		if (distance.mag() <= BOUNDRY_RADIUS) return;
		const normal = distance.clone().norm();
		const newPos = UNIVERSE_CENTER.clone().add(normal.clone().mulScalar(BOUNDRY_RADIUS));
		this.pos.re = newPos.re;
		this.pos.im = newPos.im;

		const dotProduct = normal.dot(this.velocity);
		if (dotProduct > 0) {
			const restitution = 1.0 + BOUNCE_DAMPENING;
			this.velocity.sub(normal.clone().mulScalar(restitution * dotProduct));
		}
	}
}

class ImmovableParticle extends Particle {
	constructor(pos, charge) {
		super(pos, charge);
	}
	update() { }
	draw() { }
}

function randomParticles(n) {
	const out = [];
	while (n--) {
		const angle = Math.random() * 2 * Math.PI;
		const r = Math.sqrt(Math.random()) * (BOUNDRY_RADIUS - 10);
		const x = UNIVERSE_CENTER.re + r * Math.cos(angle);
		const y = UNIVERSE_CENTER.im + r * Math.sin(angle);
		out.push(new Particle(new Complex(x, y)));
	}
	return out;
}
