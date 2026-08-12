class Particle {
	constructor(pos, charge = 10, mass = 1, velocity = new Complex(), force = new Complex()) {
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

		// Needed for leapfrog integration
		this.previous_acceleration = new Complex();
	}
	interact(other) {
		if (this === other) return;

		const dZ = this.pos.clone().sub(other.pos);

		// Softening: Prevent Infinity/NaN if particles perfectly overlap
		const r2 = dZ.re * dZ.re + dZ.im * dZ.im;
		if (r2 < 1.0) return;

		// FIX: Use complex multiplication! 
		// (Imaginary * Imaginary naturally creates the negative Real force)
		const interactionForce = this.charge.clone().mulComplex(other.charge).divComplex(dZ);

		// Fix the Cartesian Y-axis flip
		interactionForce.im = -interactionForce.im;

		this.force.add(interactionForce);
	}
	update() {
		console.assert(!isNaN(this.pos.re) && !isNaN(this.pos.im));
		// 1. Calculate current acceleration (a = F/m)
		const a_curr = this.force.clone().divScalar(this.mass);

		// 2. "Kick" - Update velocity using current acceleration
		// v(t + dt) = v(t) + a(t) * dt
		const dv = a_curr.clone().mulScalar(DELTA_TIME);
		this.velocity.add(dv);

		// 3. "Drift" - Update position using the NEW velocity
		// x(t + dt) = x(t) + v(t + dt) * dt
		const dp = this.velocity.clone().mulScalar(DELTA_TIME);
		this.pos.add(dp);

		// Wall-bounce effect
		// X-Axis (Left and Right walls)
		if (this.pos.re < 0) {
			this.pos.re = 0;
			this.velocity.re *= -BOUNCE_DAMPENING;
		} else if (this.pos.re > UNIVERSE_SIZE) {
			this.pos.re = UNIVERSE_SIZE;
			this.velocity.re *= -BOUNCE_DAMPENING;
		}

		// Y-Axis (Top and Bottom walls)
		if (this.pos.im < 0) {
			this.pos.im = 0;
			this.velocity.im *= -BOUNCE_DAMPENING;
		} else if (this.pos.im > UNIVERSE_SIZE) {
			this.pos.im = UNIVERSE_SIZE;
			this.velocity.im *= -BOUNCE_DAMPENING;
		}

		// Reset forces
		this.force.re = 0.0;
		this.force.im = 0.0;
		console.assert(!isNaN(this.pos.re) && !isNaN(this.pos.im));
	}
	draw(gameCanvas, circleColor = "cyan", radius = 3, drawForce = false, forceColor = "red") {
		const ctx = gameCanvas.ctx;
		const x = this.pos.re;
		const y = this.pos.im;

		// Draw a circle
		ctx.beginPath();
		ctx.arc(x, y, radius, 0, 2 * Math.PI);
		ctx.fillStyle = circleColor;
		ctx.fill();

		// Draw force vector
		if (drawForce) {
			const forceVector = this.force.clone().mulScalar(2000);
			const forceEndPoint = this.pos.clone().add(forceVector);
			const fx = forceEndPoint.re;
			const fy = forceEndPoint.im;
			ctx.beginPath();
			ctx.moveTo(x, y);
			ctx.lineTo(fx, fy);
			ctx.strokeStyle = forceColor;
			ctx.stroke();
		}
	}
}

class ImmovableParticle extends Particle {
	constructor(pos, charge) {
		super(pos, charge)
	}
	update() { } // Empty method => no update => immovable
	draw(gameCanvas) {
		super.draw(gameCanvas, "purple");
	}
}
