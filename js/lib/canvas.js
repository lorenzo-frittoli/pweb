class Mouse {
	constructor() {
		this.isActive = false;
		this.isPressed = false;
		this.pos = new Complex();
	}
}

class GameCanvas {
	constructor(canvasId) {
		this._canvasId = canvasId;
		this.canvas = document.getElementById(this._canvasId);
		this.ctx = this.canvas.getContext("2d");
		this.mouse = new Mouse();

		this._initMouseListeners();
	}

	clear() {
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
	}

	getMouse() {
		return this.mouse;
	}

	_initMouseListeners() {
		this.canvas.addEventListener('mousemove', (e) => {
			this.mouse.isActive = true;
			this._updateMousePos(e);
		});

		this.canvas.addEventListener('mouseleave', () => {
			this.mouse.isActive = false;
		});

		this.canvas.addEventListener('mouseenter', (e) => {
			this.mouse.isActive = true;
			this._updateMousePos(e);
		});

		this.canvas.addEventListener('mousedown', (e) => {
			// Left click
			if (e.button === 0) {
				this.mouse.isPressed = true;
				this._updateMousePos(e);
			}
		});

		this.canvas.addEventListener('mouseup', (e) => {
			if (e.button === 0) {
				this.mouse.isPressed = false;
			}
		});
	}

	_updateMousePos(event) {
		const rect = this.canvas.getBoundingClientRect();
		const scaleX = this.canvas.width / rect.width;
		const scaleY = this.canvas.height / rect.height;

		// 1. Calculate raw coordinates
		const rawX = (event.clientX - rect.left) * scaleX;
		const rawY = (event.clientY - rect.top) * scaleY;

		// 2. CLAMP the coordinates!
		// Math.max prevents it from going below 0.1 (Left/Top edges)
		// Math.min prevents it from exceeding width/height (Right/Bottom edges)
		// (We use a tiny 0.1 margin instead of 0 to prevent exact-edge Quadtree rejection bugs)
		this.mouse.pos.re = Math.max(0.1, Math.min(this.canvas.width - 0.1, rawX));
		this.mouse.pos.im = Math.max(0.1, Math.min(this.canvas.height - 0.1, rawY));
	}
}
