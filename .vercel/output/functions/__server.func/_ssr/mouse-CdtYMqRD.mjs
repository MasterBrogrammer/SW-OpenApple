import { i as debug } from "./util-CcAkGmGv.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/mouse-CdtYMqRD.js
var rom = new Uint8Array([
	0,
	0,
	0,
	0,
	0,
	56,
	0,
	24,
	0,
	0,
	0,
	1,
	32,
	0,
	0,
	0,
	0,
	0,
	32,
	33,
	34,
	35,
	36,
	37,
	38,
	39,
	0,
	0,
	0,
	0,
	0,
	0,
	96,
	96,
	96,
	96,
	96,
	96,
	96,
	96,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	214,
	0,
	0,
	0,
	0
]);
var CLAMP_MIN_LOW = 1144;
var CLAMP_MAX_LOW = 1272;
var CLAMP_MIN_HIGH = 1400;
var CLAMP_MAX_HIGH = 1528;
var X_LOW = 1144;
var Y_LOW = 1272;
var X_HIGH = 1400;
var Y_HIGH = 1528;
var STATUS = 1912;
var MODE = 2040;
var STATUS_DOWN = 128;
var STATUS_LAST = 64;
var STATUS_MOVED = 32;
var INT_SCREEN = 8;
var INT_PRESS = 4;
var INT_MOVE = 2;
var MODE_ON = 1;
var MODE_INT_MOVE = 2;
var MODE_INT_PRESS = 4;
var MODE_INT_VBL = 8;
/**
* Firmware routine offset pointers
*/
var ENTRIES = {
	SET_MOUSE: 18,
	SERVE_MOUSE: 19,
	READ_MOUSE: 20,
	CLEAR_MOUSE: 21,
	POS_MOUSE: 22,
	CLAMP_MOUSE: 23,
	HOME_MOUSE: 24,
	INIT_MOUSE: 25
};
var Mouse = class {
	cpu;
	cbs;
	/** Lowest mouse X */
	clampXMin = 0;
	/** Lowest mouse Y */
	clampYMin = 0;
	/** Highest mouse X */
	clampXMax = 1023;
	/** Highest mouse Y */
	clampYMax = 1023;
	/** Mouse X position */
	x = 0;
	/** Mouse Y position */
	y = 0;
	/** Mouse mode  */
	mode = 0;
	/** Mouse button down state */
	down = false;
	/** Last mouse button down state */
	lastDown = false;
	/** Last mouse Y Position */
	lastX = 0;
	/** Last mouse X position  */
	lastY = 0;
	/** Interrupt service flags */
	serve = 0;
	/** Move happened since last refresh */
	shouldIntMove = false;
	/** Button press happened since last refresh */
	shouldIntPress = false;
	/** Slot for screen hole indexing */
	slot = 0;
	constructor(cpu, cbs) {
		this.cpu = cpu;
		this.cbs = cbs;
		this.cbs.setMouse(this);
	}
	ioSwitch(_off, _val) {}
	read(_page, off) {
		let state = this.cpu.getState();
		const holeWrite = (addr, val) => {
			this.cpu.write(addr >> 8, (addr & 255) + this.slot, val);
		};
		const holeRead = (addr) => {
			return this.cpu.read(addr >> 8, addr & 255);
		};
		const clearCarry = (state) => {
			state.s &= 254;
			return state;
		};
		if (this.cpu.getSync()) {
			switch (off) {
				case rom[ENTRIES.SET_MOUSE]:
					this.mode = state.a;
					this.cbs.mouseMode(!!(this.mode & MODE_ON));
					state = clearCarry(state);
					break;
				case rom[ENTRIES.SERVE_MOUSE]:
					holeWrite(STATUS, this.serve);
					state = clearCarry(state);
					this.serve = 0;
					break;
				case rom[ENTRIES.READ_MOUSE]:
					{
						const moved = this.lastX !== this.x || this.lastY !== this.y;
						const status = (this.down ? STATUS_DOWN : 0) | (this.lastDown ? STATUS_LAST : 0) | (moved ? STATUS_MOVED : 0);
						const mouseXLow = this.x & 255;
						const mouseYLow = this.y & 255;
						const mouseXHigh = this.x >> 8;
						const mouseYHigh = this.y >> 8;
						holeWrite(X_LOW, mouseXLow);
						holeWrite(Y_LOW, mouseYLow);
						holeWrite(X_HIGH, mouseXHigh);
						holeWrite(Y_HIGH, mouseYHigh);
						holeWrite(STATUS, status);
						holeWrite(MODE, this.mode);
						this.lastDown = this.down;
						this.lastX = this.x;
						this.lastY = this.y;
						state = clearCarry(state);
					}
					break;
				case rom[ENTRIES.CLEAR_MOUSE]:
					debug("clearMouse");
					state = clearCarry(state);
					break;
				case rom[ENTRIES.POS_MOUSE]:
					debug("posMouse");
					state = clearCarry(state);
					break;
				case rom[ENTRIES.CLAMP_MOUSE]:
					if (state.a) {
						this.clampYMin = holeRead(CLAMP_MIN_LOW) | holeRead(CLAMP_MIN_HIGH) << 8;
						this.clampYMax = holeRead(CLAMP_MAX_LOW) | holeRead(CLAMP_MAX_HIGH) << 8;
						debug("clampMouse Y", this.clampYMin, this.clampYMax);
					} else {
						this.clampXMin = holeRead(CLAMP_MIN_LOW) | holeRead(CLAMP_MIN_HIGH) << 8;
						this.clampXMax = holeRead(CLAMP_MAX_LOW) | holeRead(CLAMP_MAX_HIGH) << 8;
						debug("clampMouse X", this.clampXMin, this.clampXMax);
					}
					state = clearCarry(state);
					break;
				case rom[ENTRIES.HOME_MOUSE]:
					debug("homeMouse");
					this.x = this.clampXMin;
					this.y = this.clampYMin;
					state = clearCarry(state);
					break;
				case rom[ENTRIES.INIT_MOUSE]:
					this.slot = state.y >> 4;
					debug("initMouse slot", this.slot);
					state = clearCarry(state);
			}
			this.cpu.setState(state);
		}
		return rom[off];
	}
	write() {}
	/**
	* Triggers interrupts based on activity since the last tick
	*/
	tick() {
		if (this.mode & MODE_INT_VBL) this.serve |= INT_SCREEN;
		if (this.mode & MODE_INT_PRESS && this.shouldIntPress) this.serve |= INT_PRESS;
		if (this.mode & MODE_INT_MOVE && this.shouldIntMove) this.serve |= INT_MOVE;
		if (this.serve) this.cpu.irq();
		this.shouldIntMove = false;
		this.shouldIntPress = false;
	}
	/**
	* Scales mouse position and clamps to min and max,and flags
	* potential mouse state change interrupt
	*
	* @param x Client mouse X position
	* @param y Client mouse Y position
	* @param w Client width
	* @param h Client height
	*/
	setMouseXY(x, y, w, h) {
		const rangeX = this.clampXMax - this.clampXMin;
		const rangeY = this.clampYMax - this.clampYMin;
		this.x = x * rangeX / w + this.clampXMin & 65535;
		this.y = y * rangeY / h + this.clampYMin & 65535;
		this.shouldIntMove = true;
	}
	/**
	* Tracks mouse button state and flags potential
	* mouse state change interrupt
	*
	* @param down Mouse button down state
	*/
	setMouseDown(down) {
		this.shouldIntPress = this.down !== down;
		this.down = down;
	}
	/**
	* Restores saved state
	*
	* @param state stored state
	*/
	setState(state) {
		this.clampXMin = state.clampXMin;
		this.clampYMin = state.clampYMin;
		this.clampXMax = state.clampXMax;
		this.clampYMax = state.clampYMax;
		this.x = state.x;
		this.y = state.y;
		this.mode = state.mode;
		this.down = state.down;
		this.lastDown = state.lastDown;
		this.lastX = state.lastX;
		this.lastY = state.lastY;
		this.serve = state.serve;
		this.shouldIntMove = state.shouldIntMove;
		this.shouldIntPress = state.shouldIntPress;
		this.slot = state.slot;
	}
	/**
	* Saves state for restoration
	*
	* @returns restorable state
	*/
	getState() {
		return {
			clampXMin: this.clampXMin,
			clampYMin: this.clampYMin,
			clampXMax: this.clampXMax,
			clampYMax: this.clampYMax,
			x: this.x,
			y: this.y,
			mode: this.mode,
			down: this.down,
			lastDown: this.lastDown,
			lastX: this.lastX,
			lastY: this.lastY,
			serve: this.serve,
			shouldIntMove: this.shouldIntMove,
			shouldIntPress: this.shouldIntPress,
			slot: this.slot
		};
	}
};
//#endregion
export { Mouse as default };
