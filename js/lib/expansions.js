class Expansion {
	constructor(base_coefficient = new Complex(), term_coefficients = Array.from({ length: NUMBER_OF_TERMS }, () => new Complex())) {
		this.base_coefficient = base_coefficient
		this.term_coefficients = term_coefficients;
	}

	clone() {
		// Deep copy
		return new this.constructor(this.base_coefficient, this.term_coefficients.map(term => term.clone()));
	}

	add(other) {
		this.base_coefficient.add(other.base_coefficient);
		for (let i = 0; i < NUMBER_OF_TERMS; i++) {
			this.term_coefficients[i].add(other.term_coefficients[i]);
		}
	}
}

class MultipoleExpansion extends Expansion {
	fromParticles(center, particles) {
		this.base_coefficient = new Complex(0.0, 0.0);
		this.term_coefficients = Array.from({ length: NUMBER_OF_TERMS }, () => new Complex(0.0, 0.0));
		for (const particle of particles) {
			const q = particle.charge.clone();
			const z = particle.pos.clone().sub(center);
			this.base_coefficient.add(q);

			for (let idx = 0; idx < NUMBER_OF_TERMS; idx++) {
				// a_k = - sum_i q_i z_i^k / k
				const k = idx + 1;
				const zK = z.clone().pow(k);
				const flipped_coeff = q.clone().mulComplex(zK).divScalar(k);
				this.term_coefficients[idx].sub(flipped_coeff);
			}
		}
		return this;
	}

	shiftTo(oldCenter, newCenter) {
		// b_l = (sum_(k=1)^l a_k z_0^(l-k) binomial(l-1, k-1)) - a_0 z_0^l / l
		const z0 = oldCenter.clone().sub(newCenter);
		const new_term_coefficients = Array.from({ length: NUMBER_OF_TERMS }, () => new Complex(0.0, 0.0));

		let zPow = new Complex(1.0, 0.0);

		for (let lkDelta = 0; lkDelta < NUMBER_OF_TERMS; lkDelta++) {
			for (let k = 1; k + lkDelta <= NUMBER_OF_TERMS; k++) {
				const l = k + lkDelta;
				let a = this.term_coefficients[k - 1].clone();
				new_term_coefficients[l - 1].add(a.mulComplex(zPow).mulScalar(binomial(l - 1, k - 1)));
			}
			zPow.mulComplex(z0);
			new_term_coefficients[lkDelta].sub(this.base_coefficient.clone().mulComplex(zPow).divScalar(lkDelta + 1));
		}
		this.term_coefficients = new_term_coefficients;
		return this;
	}
}

class LocalExpansion extends Expansion {
	fromMultipole(multipoleCenter, multipole) {
		// precalc
		// series_k = a_k / z_0^k (-1)^k
		let series = Array.from(
			{ length: NUMBER_OF_TERMS },
			(_, idx) => multipole.term_coefficients[idx].clone()
				.divComplex(
					multipoleCenter.clone().pow(idx + 1)
				).mulScalar((idx % 2 === 0) ? -1 : 1));


		// base coefficient calculation (b_0)
		// a_0 log(-z_0)
		this.base_coefficient = multipoleCenter.clone().flip().log().mulComplex(multipole.base_coefficient);
		// + sum(series)
		for (const s of series) {
			this.base_coefficient.add(s);
		}

		// term coefficients calculation (b_i)
		this.term_coefficients = Array.from({ length: NUMBER_OF_TERMS }, () => new Complex());
		for (let i = 0; i < NUMBER_OF_TERMS; i++) {
			const l = i + 1;
			for (let j = 0; j < NUMBER_OF_TERMS; j++) {
				const k = j + 1;
				// sum(series * binomial)
				this.term_coefficients[i].add(series[j].clone().mulScalar(binomial(l + k - 1, k - 1)));
			}
			// sum multiplied by 1 / z_0^l
			this.term_coefficients[i].divComplex(multipoleCenter.clone().pow(l));
			// - a_0 / l z_0^l
			this.term_coefficients[i].sub(multipole.base_coefficient.clone().divComplex(multipoleCenter.clone().pow(l).mulScalar(l)));
		}
		return this;
	}

	shiftTo(oldCenter, newCenter) {
		// in the formula, only -z_0 is used, so I directly calculate the flipped version
		const minus_z0 = newCenter.clone().sub(oldCenter);


		// calc term coefficients
		let new_term_coefficients = Array.from({ length: NUMBER_OF_TERMS }, () => new Complex(0.0, 0.0));
		for (let i = 0; i < NUMBER_OF_TERMS; i++) {
			const l = i + 1;
			for (let j = i; j < NUMBER_OF_TERMS; j++) {
				const k = j + 1;
				new_term_coefficients[i].add(this.term_coefficients[j].clone().mulScalar(binomial(k, l)).mulComplex(minus_z0.clone().pow(k - l)));
			}
		}

		// calc base coefficient (k = 0, l = 0 simplifies to this)
		let new_base_coefficient = this.base_coefficient.clone();
		for (let j = 0; j < NUMBER_OF_TERMS; j++) {
			const k = j + 1;
			// simplifications due to l = 0
			new_base_coefficient.add(this.term_coefficients[j].clone().mulComplex(minus_z0.clone().pow(k)));
		}

		this.term_coefficients = new_term_coefficients;
		this.base_coefficient = new_base_coefficient;
		return this;
	}

	applyForce(pos, particle) {
		const dZ = particle.pos.clone().sub(pos);

		// Field is the spatial derivative of the potential (expansion)
		// From power rule:
		// field = sum(l * coeff_l * dZ ^ (l-1))
		let field = new Complex(0.0, 0.0);
		for (let i = 0; i < NUMBER_OF_TERMS; i++) {
			const l = i + 1;
			const coeff = this.term_coefficients[i];
			const dZpow = dZ.clone().pow(l - 1);
			const term = coeff.clone().mulScalar(l).mulComplex(dZpow);
			field.add(term);
		}

		// Force = field * charge
		const force = field.clone().mulComplex(particle.charge).con();
		particle.force.add(force);
	}
}

