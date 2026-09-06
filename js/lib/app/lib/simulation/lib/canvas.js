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

	drawCircle(pos, radius, color, strokeWidth, startAngle = 0, endAngle = 2 * Math.PI) {
		this.ctx.beginPath();
		this.ctx.arc(pos.re, pos.im, radius, startAngle, endAngle);
		if (strokeWidth === 0) {
			this.ctx.fillStyle = color;
			this.ctx.fill();
		} else {
			this.ctx.strokeStyle = color;
			this.ctx.lineWidth = strokeWidth;
			this.ctx.stroke();
		}
	}

	drawText(text, pos, font, color) {
		this.ctx.textAlign = "center";
		this.ctx.textBaseline = "middle";
		this.ctx.font = font;
		this.ctx.fillStyle = color;
		this.ctx.fillText(text, pos.re, pos.im);
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
			if (e.button === 0) {
				this.mouse.isPressed = true;
				this._updateMousePos(e);
			}
		});

		// Listen on window so releasing click outside canvas resets press state
		window.addEventListener('mouseup', (e) => {
			if (e.button === 0) {
				this.mouse.isPressed = false;
			}
		});
	}

	_updateMousePos(event) {
		const rect = this.canvas.getBoundingClientRect();
		if (rect.width === 0 || rect.height === 0) return;
		const scaleX = this.canvas.width / rect.width;
		const scaleY = this.canvas.height / rect.height;
		const rawX = (event.clientX - rect.left) * scaleX;
		const rawY = (event.clientY - rect.top) * scaleY;
		this.mouse.pos.re = Math.max(0.1, Math.min(this.canvas.width - 0.1, rawX));
		this.mouse.pos.im = Math.max(0.1, Math.min(this.canvas.height - 0.1, rawY));
	}
}
