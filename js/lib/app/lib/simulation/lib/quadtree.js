class QuadTree {
	constructor(maxLevel, size) {
		this.maxLevel = maxLevel;
		this.size = size;
		const pos = new Complex(size / 2, size / 2);
		const RootClass = (this.maxLevel === 0) ? QTBottomNode : QTMiddleNode;
		this.root = new RootClass(pos, size, 0, this.maxLevel);
	}

	insertParticles(particles) {
		for (const particle of particles) {
			this.root.insertParticle(particle);
		}
	}

	clearParticles() {
		this.root.clear();
	}

	drawParticles(gameCanvas) {
		this.root.drawParticles(gameCanvas);
	}

	stepSimulation() {
		this.root.resetExpansions();
		this.root.upwardPass();
		this.root.downwardPass([], [this.root]);
		this.root.update();
	}
}

class QTNode {
	constructor(pos, size) {
		this.pos = pos;
		this.size = size;
		this.multipoleExpansion = new MultipoleExpansion();
		this.localExpansion = new LocalExpansion();
	}

	resetExpansions() {
		this.multipoleExpansion = new MultipoleExpansion();
		this.localExpansion = new LocalExpansion();
	}

	universalDownwardPass(targetList) {
		for (const other of targetList) {
			const z0 = other.pos.clone().sub(this.pos);
			let local = new LocalExpansion().fromMultipole(z0, other.multipoleExpansion);
			this.localExpansion.add(local);
		}
	}

	is_touching(other) {
		if (other.size !== this.size) return false;
		const delta = this.pos.clone().sub(other.pos);
		return Math.abs(delta.re) <= this.size + FLOAT_TOLERANCE && Math.abs(delta.im) <= this.size + FLOAT_TOLERANCE;
	}

	contains(particle) {
		const delta = this.pos.clone().sub(particle.pos);
		const halfSize = this.size / 2;
		return Math.abs(delta.re) <= halfSize + FLOAT_TOLERANCE && Math.abs(delta.im) <= halfSize + FLOAT_TOLERANCE;
	}
}

class QTBottomNode extends QTNode {
	constructor(pos, size, currentLevel, maxLevel) {
		super(pos, size);
		this.particles = [];
	}

	listChildren() { return []; }

	resetExpansions() {
		super.resetExpansions();
	}

	upwardPass() {
		this.multipoleExpansion.fromParticles(this.pos, this.particles);
	}

	downwardPass(targetList, neighboursList) {
		this.universalDownwardPass(targetList);
		for (let particle of this.particles) {
			this.localExpansion.applyForce(this.pos, particle);
			for (const nb of neighboursList) {
				for (const other_particle of nb.particles) {
					particle.interact(other_particle);
				}
			}
		}
	}

	drawParticles(gameCanvas) {
		for (const p of this.particles) {
			p.draw(gameCanvas);
		}
	}

	insertParticle(particle) {
		this.particles.push(particle);
	}

	clear() {
		this.particles = [];
	}

	update() {
		for (let p of this.particles) {
			p.update();
		}
	}
}

class QTMiddleNode extends QTNode {
	constructor(pos, size, currentLevel, maxLevel) {
		super(pos, size);
		const childLevel = currentLevel + 1;
		const childSize = size / 2;
		const offset = childSize / 2;
		const ChildClass = (childLevel === maxLevel) ? QTBottomNode : QTMiddleNode;

		this.nw = new ChildClass(this.pos.clone().add(new Complex(-offset, -offset)), childSize, childLevel, maxLevel);
		this.ne = new ChildClass(this.pos.clone().add(new Complex(+offset, -offset)), childSize, childLevel, maxLevel);
		this.sw = new ChildClass(this.pos.clone().add(new Complex(-offset, +offset)), childSize, childLevel, maxLevel);
		this.se = new ChildClass(this.pos.clone().add(new Complex(+offset, +offset)), childSize, childLevel, maxLevel);
	}

	listChildren() {
		return [this.nw, this.ne, this.sw, this.se];
	}

	resetExpansions() {
		super.resetExpansions();
		for (let child of this.listChildren()) {
			child.resetExpansions();
		}
	}

	upwardPass() {
		this.multipoleExpansion = new MultipoleExpansion();
		for (let child of this.listChildren()) {
			child.upwardPass();
			this.multipoleExpansion.add(child.multipoleExpansion.clone().shiftTo(child.pos, this.pos));
		}
	}

	downwardPass(targetList, neighboursList) {
		this.universalDownwardPass(targetList);
		const potentialTargetList = [];
		for (const nb of neighboursList) {
			for (const child of nb.listChildren()) {
				potentialTargetList.push(child);
			}
		}

		for (let child of this.listChildren()) {
			let childTargetList = [];
			let childNeighbourList = [];
			for (const other of potentialTargetList) {
				if (child.is_touching(other)) {
					childNeighbourList.push(other);
				} else {
					childTargetList.push(other);
				}
			}
			child.localExpansion = this.localExpansion.clone().shiftTo(this.pos, child.pos);
			child.downwardPass(childTargetList, childNeighbourList);
		}
	}

	drawParticles(gameCanvas) {
		for (const child of this.listChildren()) {
			child.drawParticles(gameCanvas);
		}
	}

	insertParticle(particle) {
		for (let child of this.listChildren()) {
			if (child.contains(particle)) {
				child.insertParticle(particle);
				return;
			}
		}
	}

	clear() {
		for (let child of this.listChildren()) {
			child.clear();
		}
	}

	update() {
		for (let child of this.listChildren()) {
			child.update();
		}
	}
}
