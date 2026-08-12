class Complex {
	constructor(re = 0.0, im = 0.0) {
		this.re = re;
		this.im = im;
	}

	clone() {
		return new Complex(this.re, this.im);
	}

	// Immutable
	mag() {
		return Math.hypot(this.re, this.im);
	}

	mag2() {
		return this.re * this.re + this.im * this.im;
	}

	arg() {
		return Math.atan2(this.im, this.re);
	}

	// Mutable
	flip() {
		this.re = -this.re;
		this.im = -this.im;
		return this;
	}

	con() {
		this.im = -this.im;
		return this;
	}

	add(other) {
		this.re += other.re;
		this.im += other.im;
		return this;
	}

	sub(other) {
		this.re -= other.re;
		this.im -= other.im;
		return this;
	}

	mulScalar(scalar) {
		this.re *= scalar;
		this.im *= scalar;
		return this;
	}

	mulComplex(other) {
		// (a + ib) * (c + id) = (ac - bd) + i(ad + bc)
		const re = this.re * other.re - this.im * other.im;
		const im = this.re * other.im + this.im * other.re;

		this.re = re;
		this.im = im;
		return this;
	}

	divScalar(scalar) {
		this.re /= scalar;
		this.im /= scalar;
		return this;
	}

	divComplex(other) {
		// c1 / c2 = c1 * coniugate(c2) / ||c2||^2
		const denom = other.mag2();
		// Unrolled congiugate operation for performance
		const re = (this.re * other.re + this.im * other.im) / denom;
		const im = (this.im * other.re - this.re * other.im) / denom;

		this.re = re;
		this.im = im;
		return this;
	}

	log() {
		// ln(z) = ln(|z|) + i * arg(z)
		const re = Math.log(this.mag());
		const im = this.arg();

		this.re = re;
		this.im = im;
		return this;
	}

	pow(n) {
		// z^n = r^n * (cos(n theta) + i * sin(n theta))
		const magN = Math.pow(this.mag(), n);
		const argN = this.arg() * n;

		this.re = magN * Math.cos(argN);
		this.im = magN * Math.sin(argN);
		return this;
	}
}
