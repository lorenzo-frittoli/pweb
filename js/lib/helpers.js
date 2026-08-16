function randomParticles(n) {
	out = new Array();
	while (n--) {
		const x = Math.random() * UNIVERSE_SIZE;
		const y = Math.random() * UNIVERSE_SIZE;
		out.push(new Particle(new Complex(x, y)));
	}
	return out;
}
