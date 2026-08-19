//#region node_modules/.nitro/vite/services/ssr/assets/mouse-a8BURx1K.js
var MouseUI = class {
	canvas;
	mouse;
	constructor(canvas) {
		this.canvas = canvas;
		const updateTouchXY = (event) => {
			const { targetTouches, target } = event;
			if (targetTouches.length < 1) return;
			const rect = target.getBoundingClientRect();
			const leftPad = (rect.width - 560) / 2 + rect.left;
			const topPad = (rect.height - 384) / 2 + rect.top;
			const { clientX, clientY } = targetTouches[0];
			const xPos = clientX - leftPad;
			const yPos = clientY - topPad;
			this.mouse.setMouseXY(Math.max(Math.min(xPos, 559), 0), Math.max(Math.min(yPos, 383), 0), 560, 384);
		};
		if ("ontouchstart" in window) {
			this.canvas.addEventListener("touchmove", (event) => {
				updateTouchXY(event);
			});
			this.canvas.addEventListener("touchstart", (event) => {
				updateTouchXY(event);
				setTimeout(() => this.mouse.setMouseDown(true), 20);
			});
			this.canvas.addEventListener("touchend", (event) => {
				updateTouchXY(event);
				setTimeout(() => this.mouse.setMouseDown(false), 20);
			});
			this.canvas.addEventListener("touchcancel", (event) => {
				updateTouchXY(event);
				this.mouse.setMouseDown(false);
			});
		} else {
			this.canvas.addEventListener("mousemove", (event) => {
				const { offsetX, offsetY, target } = event;
				this.mouse.setMouseXY(offsetX, offsetY, target.clientWidth, target.clientHeight);
			});
			this.canvas.addEventListener("mousedown", () => {
				this.mouse.setMouseDown(true);
			});
			this.canvas.addEventListener("mouseup", () => {
				this.mouse.setMouseDown(false);
			});
		}
	}
	setMouse = (mouse) => {
		this.mouse = mouse;
	};
	mouseMode = (on) => {
		if (on) this.canvas.classList.add("mouseMode");
		else this.canvas.classList.remove("mouseMode");
	};
};
//#endregion
export { MouseUI };
