// Dataclass for mouse information
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

	// Clears canvas. Needs to be called before drawing every frame.
	clear() {
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
	}

	// Returns mouse information
	getMouse() {
		return this.mouse;
	}

	// Draws a circle
	//	strokeWidth = 0 -> fill
	// 	strokeWidth > 0 -> stroke size
	drawCircle(pos, radius, color, strokeWidth) {
		const x = pos.re;
		const y = pos.im;
		this.ctx.beginPath();
		this.ctx.arc(x, y, radius, 0, 2 * Math.PI);
		if (strokeWidth === 0) {
			this.ctx.fillStyle = color;
			this.ctx.fill();
		} else {
			this.ctx.strokeStyle = color;
			this.ctx.lineWidth = strokeWidth;
			this.ctx.stroke();
		}
	}

	// Writes text
	drawText(text, pos, font, color, isCentered) {
		const x = pos.re;
		const y = pos.im;

		if (isCentered) {
			this.ctx.textAlign = "center";
			this.ctx.textBaseline = "middle";
		}

		this.ctx.font = font;
		this.ctx.fillStyle = color;
		this.ctx.fillText(text, x, y);
	}

	// Adds a bunch of event listeners for mouse events
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

	// Updates registered mouse position on event listener trigger
	_updateMousePos(event) {
		// Calculate scaling factors based on the size
		// of the canvas and the bounding rect
		const rect = this.canvas.getBoundingClientRect();
		const scaleX = this.canvas.width / rect.width;
		const scaleY = this.canvas.height / rect.height;

		const rawX = (event.clientX - rect.left) * scaleX;
		const rawY = (event.clientY - rect.top) * scaleY;

		// Prevents errors if the mouse position is on the canvas border
		// by clamping mouse coordinates.
		this.mouse.pos.re = Math.max(0.1, Math.min(this.canvas.width - 0.1, rawX));
		this.mouse.pos.im = Math.max(0.1, Math.min(this.canvas.height - 0.1, rawY));
	}
}
