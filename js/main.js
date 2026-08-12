const qtDepth = 3;
const qtSize = UNIVERSE_SIZE;
const particlesNumber = 1000;
const particlesPerBorder = 50;
const mouseParticleCharge = 3000;
const canvasId = "myCanvas";

let gameCanvas = new GameCanvas(canvasId);
let mouseParticlePresent = false;

function randomParticles(n) {
	out = new Array();
	while (n--) {
		const x = Math.random() * qtSize;
		const y = Math.random() * qtSize;
		out.push(new Particle(new Complex(x, y)));
	}
	return out;
}

function makeBorder(particlesPerBorder) {
	const borderParticleCharge = 10000;
	out = new Array();
	for (let i = 0; i < particlesPerBorder; i++) {
		const t = i * qtSize / (particlesPerBorder - 1);
		out.push(new ImmovableParticle(new Complex(0, t), borderParticleCharge));
		out.push(new ImmovableParticle(new Complex(t, 0), borderParticleCharge));
		out.push(new ImmovableParticle(new Complex(t, qtSize), borderParticleCharge));
		out.push(new ImmovableParticle(new Complex(qtSize, t), borderParticleCharge));
	}
	return out;
}

function handleMouseParticle() {
	mouse = gameCanvas.getMouse();
	if (mouseParticlePresent) {
		particles.pop();
		mouseParticlePresent = false;
	}
	if (mouse.isActive && mouse.isPressed) {
		const mouseParticle = new ImmovableParticle(mouse.pos, mouseParticleCharge);
		particles.push(mouseParticle);
		mouseParticlePresent = true;
	}
}

let particles = randomParticles(particlesNumber);

qt = new QuadTree(qtDepth, qtSize);
qt.insertParticles(particles);

function simulationLoop() {
	// console.log("Frame");

	qt.clear();
	handleMouseParticle();
	qt.insertParticles(particles);

	qt.upwardPass();

	qt.downwardPass();

	gameCanvas.clear();
	qt.drawParticles(gameCanvas);

	// Apply the calculated forces to update velocity and position
	qt.update();

	// Request the next frame
	requestAnimationFrame(simulationLoop);
}

simulationLoop();
