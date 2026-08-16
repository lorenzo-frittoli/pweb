class QuadTree {
	constructor(maxLevel, size) {
		this.maxLevel = maxLevel;
		this.size = size;
		const pos = new Complex(size / 2, size / 2);
		const RootClass = (this.maxLevel === 0) ? QTBottomNode : QTMiddleNode;
		this.root = new RootClass(pos, size, 0, this.maxLevel);
	}

	insertParticle(particle) {
		this.root.insertParticle(particle);
	}

	insertParticles(particles) {
		for (const particle of particles) {
			this.insertParticle(particle);
		}
	}

	clearParticles() {
		this.root.clear();
	}

	upwardPass() {
		this.root.upwardPass();
	}

	downwardPass() {
		this.root.downwardPass([], [this.root]);
	}

	drawParticles(gameCanvas) {
		this.root.drawParticles(gameCanvas);
	}

	update() {
		this.root.update();
	}

	stepSimulation() {
		this.upwardPass();
		this.downwardPass();
		this.update();
	}

}

class QTNode {
	constructor(pos, size) {
		this.pos = pos;
		this.size = size;
		this.multipoleExpansion = new MultipoleExpansion();
		this.localExpansion = new LocalExpansion();
	}
	listChildren() { console.assert(false, "Virtual function not overridden by child class"); }
	upwardPass() { console.assert(false, "Virtual function not overridden by child class"); }
	downwardPass() { console.assert(false, "Virtual function not overridden by child class"); }
	drawParticles(gameCanvas) { console.assert(false, "Virtual function not overridden by child class"); }
	insertParticle(particle) { console.assert(false, "Virtual function not overridden by child class"); }
	clear() { console.assert(false, "Virtual function not overridden by child class"); }
	update() { console.assert(false, "Virtual function not overridden by child class"); }

	universalDownwardPass(targetList) {
		for (const other of targetList) {
			const z0 = other.pos.clone().sub(this.pos);
			let local = new LocalExpansion().fromMultipole(z0, other.multipoleExpansion);
			this.localExpansion.add(local);
		}
	}

	is_touching(other) {
		if (other.size != this.size) return false;
		const delta = this.pos.clone().sub(other.pos);
		const deltaX = Math.abs(delta.re);
		const deltaY = Math.abs(delta.re);
		const deltaXok = deltaX <= this.size + FLOAT_TOLERANCE;
		const deltaYok = deltaY <= this.size + FLOAT_TOLERANCE;
		return deltaXok && deltaYok;
	}

	contains(particle) {
		const delta = this.pos.clone().sub(particle.pos);
		const deltaX = Math.abs(delta.re);
		const deltaY = Math.abs(delta.im);
		const halfSize = this.size / 2;
		const deltaXok = deltaX <= halfSize + FLOAT_TOLERANCE;
		const deltaYok = deltaY <= halfSize + FLOAT_TOLERANCE;
		return deltaXok && deltaYok;
	}
}

class QTBottomNode extends QTNode {
	constructor(pos, size, currentLevel, maxLevel) {
		super(pos, size);
		this.particles = new Array();

		console.assert(currentLevel === maxLevel, "Bottom node was not created on bottom level");
	}
	listChildren() {
		return [];
	}
	upwardPass() {
		this.multipoleExpansion.fromParticles(this.pos, this.particles);
	}
	downwardPass(targetList, neighboursList) {
		this.universalDownwardPass(targetList);

		for (let particle of this.particles) {
			// Far-field interactions
			this.localExpansion.applyForce(this.pos, particle);

			// Near-field interactions
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
		console.assert(this.contains(particle), "Particle insertion error on bottom layer");
		this.particles.push(particle);
	}

	clear() {
		this.particles.length = 0; // Clears array
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

		const NWpos = this.pos.clone().add(new Complex(-offset, -offset));
		const NEpos = this.pos.clone().add(new Complex(+offset, -offset));
		const SWpos = this.pos.clone().add(new Complex(-offset, +offset));
		const SEpos = this.pos.clone().add(new Complex(+offset, +offset));

		this.nw = new ChildClass(NWpos, childSize, childLevel, maxLevel);
		this.ne = new ChildClass(NEpos, childSize, childLevel, maxLevel);
		this.sw = new ChildClass(SWpos, childSize, childLevel, maxLevel);
		this.se = new ChildClass(SEpos, childSize, childLevel, maxLevel);
	}

	listChildren() {
		return [this.nw, this.ne, this.sw, this.se];
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
		const potentialTargetList = new Array();
		for (const nb of neighboursList) {
			for (const child of nb.listChildren()) {
				potentialTargetList.push(child);
			}
		}

		for (let child of this.listChildren()) {
			let childTargetList = new Array();
			let childNeighbourList = new Array();
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
		console.assert(false,
			`Particle insertion error on middle layer\n${particle.pos.re} ${particle.pos.im}`
		);
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
