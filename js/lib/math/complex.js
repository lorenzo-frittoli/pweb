class Complex {
	constructor(re = 0.0, im = 0.0) {
		this.re = re;
		this.im = im;
	}

	clone() {
		return new Complex(this.re, this.im);
	}

	mag() {
		return Math.hypot(this.re, this.im);
	}

	mag2() {
		return this.re * this.re + this.im * this.im;
	}

	arg() {
		return Math.atan2(this.im, this.re);
	}

	dot(other) {
		return this.re * other.re + this.im * other.im;
	}

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
		const denom = other.mag2();
		const re = (this.re * other.re + this.im * other.im) / denom;
		const im = (this.im * other.re - this.re * other.im) / denom;
		this.re = re;
		this.im = im;
		return this;
	}

	log() {
		const re = Math.log(this.mag());
		const im = this.arg();
		this.re = re;
		this.im = im;
		return this;
	}

	pow(n) {
		const magN = Math.pow(this.mag(), n);
		const argN = this.arg() * n;
		this.re = magN * Math.cos(argN);
		this.im = magN * Math.sin(argN);
		return this;
	}

	norm() {
		const mag = this.mag();
		if (mag !== 0) {
			this.re /= mag;
			this.im /= mag;
		}
		return this;
	}
}
