//#region node_modules/.nitro/vite/services/ssr/assets/js-CtkL2_CI.js
var hex_digits = "0123456789ABCDEF";
/** Writes to the console. */
function debug(...args) {
	console.log(...args);
}
/**
* Returns a string of hex digits (all caps).
* @param v the value to encode
* @param n the number of nibbles. If `n` is missing, it is guessed from the value
*     of `v`. If `v` < 256, it is assumed to be 2 nibbles, otherwise 4.
*/
function toHex(v, n) {
	if (!n) n = v < 256 ? 2 : 4;
	let result = "";
	for (let idx = 0; idx < n; idx++) {
		result = hex_digits[v & 15] + result;
		v >>= 4;
	}
	return result;
}
/** Identifier for a NMOS 6502 CPU */
var FLAVOR_6502 = "6502";
/** Identifier for a Rockwell 65C02 CPU */
var FLAVOR_ROCKWELL_65C02 = "rockwell65c02";
/** Identifier for a WDC 65C02 CPU */
var FLAVOR_WDC_65C02 = "wdc65c02";
/** Array of valid 65C02 flavors*/
var FLAVORS_65C02 = [FLAVOR_ROCKWELL_65C02, FLAVOR_WDC_65C02];
[...FLAVORS_65C02];
/** Addressing mode name to instruction size mapping. */
var sizes = {
	accumulator: 1,
	implied: 1,
	immediate: 2,
	absolute: 3,
	zeroPage: 2,
	relative: 2,
	absoluteX: 3,
	absoluteY: 3,
	zeroPageX: 2,
	zeroPageY: 2,
	absoluteIndirect: 3,
	zeroPageXIndirect: 2,
	zeroPageIndirectY: 2,
	zeroPageIndirect: 2,
	absoluteXIndirect: 3,
	zeroPage_relative: 3
};
/** Flags to status byte mask. */
var flags = {
	N: 128,
	V: 64,
	X: 32,
	B: 16,
	D: 8,
	I: 4,
	Z: 2,
	C: 1
};
/** CPU-referenced memory locations. */
var loc = {
	STACK: 256,
	NMI: 65530,
	RESET: 65532,
	BRK: 65534
};
function isResettablePageHandler(pageHandler) {
	return pageHandler.reset !== void 0;
}
var BLANK_PAGE = {
	read: function() {
		return 0;
	},
	write: function() {}
};
var CPU6502 = class {
	/**
	* Constructor for all versions.
	*
	* @param flavor One of several supported CPU flavors, either
	* `FLAVOR_6502` (the default), the original MOS 6502;
	* `FLAVOR_ROCKWELL_65C02`, a Rockwell manufactured 65C02;
	* or `FLAVOR_WDC_65C02`, a WDC manufactured 65C02.
	*/
	constructor({ flavor } = {}) {
		this.pc = 0;
		this.sr = flags.X;
		this.ar = 0;
		this.xr = 0;
		this.yr = 0;
		this.sp = 255;
		this.addr = 0;
		this.memPages = new Array(256);
		this.resetHandlers = [];
		this.cycles = 0;
		this.sync = false;
		this.wait = false;
		this.stop = false;
		this.implied = () => {
			this.readByte(this.pc);
		};
		this.readImmediate = () => {
			return this.readBytePC();
		};
		this.readAbsolute = () => {
			return this.readByte(this.readWordPC());
		};
		this.readZeroPage = () => {
			return this.readByte(this.readBytePC());
		};
		this.readAbsoluteX = () => {
			const addr = this.readWordPC();
			const pc = this.addr;
			const addrIdx = addr + this.xr & 65535;
			this.workCycleIndexedRead(pc, addr, addrIdx);
			return this.readByte(addrIdx);
		};
		this.readAbsoluteY = () => {
			const addr = this.readWordPC();
			const pc = this.addr;
			const addrIdx = addr + this.yr & 65535;
			this.workCycleIndexedRead(pc, addr, addrIdx);
			return this.readByte(addrIdx);
		};
		this.readZeroPageX = () => {
			const zpAddr = this.readBytePC();
			this.readByte(zpAddr);
			return this.readByte(zpAddr + this.xr & 255);
		};
		this.readZeroPageY = () => {
			const zpAddr = this.readBytePC();
			this.readByte(zpAddr);
			return this.readByte(zpAddr + this.yr & 255);
		};
		this.readZeroPageXIndirect = () => {
			const zpAddr = this.readBytePC();
			this.readByte(zpAddr);
			const addr = this.readZPWord(zpAddr + this.xr & 255);
			return this.readByte(addr);
		};
		this.readZeroPageIndirectY = () => {
			const zpAddr = this.readBytePC();
			const pc = this.addr;
			const addr = this.readZPWord(zpAddr);
			const addrIdx = addr + this.yr & 65535;
			this.workCycleIndexedRead(pc, addr, addrIdx);
			return this.readByte(addrIdx);
		};
		this.readZeroPageIndirect = () => {
			return this.readByte(this.readZPWord(this.readBytePC()));
		};
		this.writeAbsolute = (val) => {
			this.writeByte(this.readWordPC(), val);
		};
		this.writeZeroPage = (val) => {
			this.writeByte(this.readBytePC(), val);
		};
		this.writeAbsoluteX = (val) => {
			const addr = this.readWordPC();
			const pc = this.addr;
			const addrIdx = addr + this.xr & 65535;
			this.workCycleIndexedWrite(pc, addr, addrIdx);
			this.writeByte(addrIdx, val);
		};
		this.writeAbsoluteY = (val) => {
			const addr = this.readWordPC();
			const pc = this.addr;
			const addrIdx = addr + this.yr & 65535;
			this.workCycleIndexedWrite(pc, addr, addrIdx);
			this.writeByte(addrIdx, val);
		};
		this.writeZeroPageX = (val) => {
			const zpAddr = this.readBytePC();
			this.readByte(zpAddr);
			this.writeByte(zpAddr + this.xr & 255, val);
		};
		this.writeZeroPageY = (val) => {
			const zpAddr = this.readBytePC();
			this.readByte(zpAddr);
			this.writeByte(zpAddr + this.yr & 255, val);
		};
		this.writeZeroPageXIndirect = (val) => {
			const zpAddr = this.readBytePC();
			this.readByte(zpAddr);
			const addr = this.readZPWord(zpAddr + this.xr & 255);
			this.writeByte(addr, val);
		};
		this.writeZeroPageIndirectY = (val) => {
			const zpAddr = this.readBytePC();
			const pc = this.addr;
			const addr = this.readZPWord(zpAddr);
			const addrIdx = addr + this.yr & 65535;
			this.workCycleIndexedWrite(pc, addr, addrIdx);
			this.writeByte(addrIdx, val);
		};
		this.writeZeroPageIndirect = (val) => {
			this.writeByte(this.readZPWord(this.readBytePC()), val);
		};
		this.readAddrZeroPage = () => {
			return this.readBytePC();
		};
		this.readAddrZeroPageX = () => {
			const zpAddr = this.readBytePC();
			this.readByte(zpAddr);
			return zpAddr + this.xr & 255;
		};
		this.readAddrAbsolute = () => {
			return this.readWordPC();
		};
		this.readAddrAbsoluteIndirectBug = () => {
			const addr = this.readWordPC();
			const page = addr & 65280;
			const off = addr & 255;
			const lsb = this.readByte(addr);
			return this.readByte(page | off + 1 & 255) << 8 | lsb;
		};
		this.readAddrAbsoluteIndirect = () => {
			const addr = this.readWord(this.readWordPC());
			this.readByte(this.addr);
			return addr;
		};
		this.readAddrAbsoluteX = (opts) => {
			let addr = this.readWordPC();
			const page = addr & 65280;
			addr = addr + this.xr & 65535;
			if (this.is65C02) {
				if (opts?.inc) this.readByte(this.addr);
				else if (page !== (addr & 65280)) this.readByte(this.addr);
			} else {
				const off = addr & 255;
				this.readByte(page | off);
			}
			return addr;
		};
		this.readAddrAbsoluteY = () => {
			let addr = this.readWordPC();
			const page = addr & 65280;
			addr = addr + this.yr & 65535;
			const off = addr & 255;
			this.readByte(page | off);
			return addr;
		};
		this.readAddrZeroPageXIndirect = () => {
			const zpAddr = this.readBytePC();
			this.readByte(zpAddr);
			return this.readZPWord(zpAddr + this.xr & 255);
		};
		this.readAddrZeroPageIndirectY = () => {
			const zpAddr = this.readBytePC();
			const addr = this.readZPWord(zpAddr);
			const addrIdx = addr + this.yr & 65535;
			const oldPage = addr & 65280;
			const off = addrIdx & 255;
			this.readByte(oldPage | off);
			return addrIdx;
		};
		this.readAddrAbsoluteXIndirect = () => {
			const lsb = this.readBytePC();
			const pc = this.addr;
			const addr = (this.readBytePC() << 8 | lsb) + this.xr & 65535;
			this.readByte(pc);
			return this.readWord(addr);
		};
		this.readNop = () => {
			this.readWordPC();
			this.readByte(this.addr);
		};
		this.readNopImplied = () => {};
		this.brk = (readFn) => {
			readFn();
			this.pushWord(this.pc);
			this.pushByte(this.sr | flags.B);
			if (this.is65C02) this.setFlag(flags.D, false);
			this.setFlag(flags.I, true);
			this.pc = this.readWord(loc.BRK);
		};
		this.stp = () => {
			this.stop = true;
			this.readByte(this.pc);
			this.readByte(this.pc);
		};
		this.wai = () => {
			this.wait = true;
			this.readByte(this.pc);
			this.readByte(this.pc);
		};
		this.lda = (readFn) => {
			this.ar = this.testNZ(readFn());
		};
		this.ldx = (readFn) => {
			this.xr = this.testNZ(readFn());
		};
		this.ldy = (readFn) => {
			this.yr = this.testNZ(readFn());
		};
		this.sta = (writeFn) => {
			writeFn(this.ar);
		};
		this.stx = (writeFn) => {
			writeFn(this.xr);
		};
		this.sty = (writeFn) => {
			writeFn(this.yr);
		};
		this.stz = (writeFn) => {
			writeFn(0);
		};
		this.adc = (readFn) => {
			this.ar = this.add(this.ar, readFn(), false);
		};
		this.sbc = (readFn) => {
			this.ar = this.add(this.ar, readFn() ^ 255, true);
		};
		this.incA = () => {
			this.readByte(this.pc);
			this.ar = this.increment(this.ar);
		};
		this.inc = (readAddrFn) => {
			const addr = readAddrFn({ inc: true });
			const oldVal = this.readByte(addr);
			this.workCycle(addr, oldVal);
			const val = this.increment(oldVal);
			this.writeByte(addr, val);
		};
		this.inx = () => {
			this.readByte(this.pc);
			this.xr = this.increment(this.xr);
		};
		this.iny = () => {
			this.readByte(this.pc);
			this.yr = this.increment(this.yr);
		};
		this.decA = () => {
			this.readByte(this.pc);
			this.ar = this.decrement(this.ar);
		};
		this.dec = (readAddrFn) => {
			const addr = readAddrFn({ inc: true });
			const oldVal = this.readByte(addr);
			this.workCycle(addr, oldVal);
			const val = this.decrement(oldVal);
			this.writeByte(addr, val);
		};
		this.dex = () => {
			this.readByte(this.pc);
			this.xr = this.decrement(this.xr);
		};
		this.dey = () => {
			this.readByte(this.pc);
			this.yr = this.decrement(this.yr);
		};
		this.shiftLeft = (val) => {
			this.setFlag(flags.C, !!(val & 128));
			return this.testNZ(val << 1 & 255);
		};
		this.aslA = () => {
			this.readByte(this.pc);
			this.ar = this.shiftLeft(this.ar);
		};
		this.asl = (readAddrFn) => {
			const addr = readAddrFn();
			const oldVal = this.readByte(addr);
			this.workCycle(addr, oldVal);
			const val = this.shiftLeft(oldVal);
			this.writeByte(addr, val);
		};
		this.shiftRight = (val) => {
			this.setFlag(flags.C, !!(val & 1));
			return this.testNZ(val >> 1);
		};
		this.lsrA = () => {
			this.readByte(this.pc);
			this.ar = this.shiftRight(this.ar);
		};
		this.lsr = (readAddrFn) => {
			const addr = readAddrFn();
			const oldVal = this.readByte(addr);
			this.workCycle(addr, oldVal);
			const val = this.shiftRight(oldVal);
			this.writeByte(addr, val);
		};
		this.rotateLeft = (val) => {
			const c = this.sr & flags.C;
			this.setFlag(flags.C, !!(val & 128));
			return this.testNZ((val << 1 | (c ? 1 : 0)) & 255);
		};
		this.rolA = () => {
			this.readByte(this.pc);
			this.ar = this.rotateLeft(this.ar);
		};
		this.rol = (readAddrFn) => {
			const addr = readAddrFn();
			const oldVal = this.readByte(addr);
			this.workCycle(addr, oldVal);
			const val = this.rotateLeft(oldVal);
			this.writeByte(addr, val);
		};
		this.rorA = () => {
			this.readByte(this.pc);
			this.ar = this.rotateRight(this.ar);
		};
		this.ror = (readAddrFn) => {
			const addr = readAddrFn();
			const oldVal = this.readByte(addr);
			this.workCycle(addr, oldVal);
			const val = this.rotateRight(oldVal);
			this.writeByte(addr, val);
		};
		this.and = (readFn) => {
			this.ar = this.testNZ(this.ar & readFn());
		};
		this.ora = (readFn) => {
			this.ar = this.testNZ(this.ar | readFn());
		};
		this.eor = (readFn) => {
			this.ar = this.testNZ(this.ar ^ readFn());
		};
		this.rmb = (b) => {
			const bit = 1 << b ^ 255;
			const addr = this.readBytePC();
			let val = this.readByte(addr);
			this.readByte(addr);
			val &= bit;
			this.writeByte(addr, val);
		};
		this.smb = (b) => {
			const bit = 1 << b;
			const addr = this.readBytePC();
			let val = this.readByte(addr);
			this.readByte(addr);
			val |= bit;
			this.writeByte(addr, val);
		};
		this.trb = (readAddrFn) => {
			const addr = readAddrFn();
			const val = this.readByte(addr);
			this.testZ(val & this.ar);
			this.readByte(addr);
			this.writeByte(addr, val & ~this.ar);
		};
		this.tsb = (readAddrFn) => {
			const addr = readAddrFn();
			const val = this.readByte(addr);
			this.testZ(val & this.ar);
			this.readByte(addr);
			this.writeByte(addr, val | this.ar);
		};
		this.bit = (readFn) => {
			const val = readFn();
			this.setFlag(flags.Z, (val & this.ar) === 0);
			this.setFlag(flags.N, !!(val & 128));
			this.setFlag(flags.V, !!(val & 64));
		};
		this.bitI = (readFn) => {
			const val = readFn();
			this.setFlag(flags.Z, (val & this.ar) === 0);
		};
		this.cmp = (readFn) => {
			this.compare(this.ar, readFn());
		};
		this.cpx = (readFn) => {
			this.compare(this.xr, readFn());
		};
		this.cpy = (readFn) => {
			this.compare(this.yr, readFn());
		};
		this.brs = (f) => {
			const off = this.readBytePC();
			if ((f & this.sr) !== 0) {
				this.readByte(this.pc);
				const oldPage = this.pc & 65280;
				this.pc += off > 127 ? off - 256 : off;
				this.pc &= 65535;
				const newPage = this.pc & 65280;
				const newOff = this.pc & 255;
				if (newPage !== oldPage) this.readByte(oldPage | newOff);
			}
		};
		this.brc = (f) => {
			const off = this.readBytePC();
			if ((f & this.sr) === 0) {
				this.readByte(this.pc);
				const oldPage = this.pc & 65280;
				this.pc += off > 127 ? off - 256 : off;
				this.pc &= 65535;
				const newPage = this.pc & 65280;
				const newOff = this.pc & 255;
				if (newPage !== oldPage) this.readByte(oldPage | newOff);
			}
		};
		this.bbr = (b) => {
			const zpAddr = this.readBytePC();
			const val = this.readByte(zpAddr);
			this.writeByte(zpAddr, val);
			const off = this.readBytePC();
			const oldPage = this.pc & 65280;
			let newPC = this.pc + (off > 127 ? off - 256 : off);
			newPC &= 65535;
			const newOff = newPC & 255;
			this.readByte(oldPage | newOff);
			if ((1 << b & val) === 0) this.pc = newPC;
		};
		this.bbs = (b) => {
			const zpAddr = this.readBytePC();
			const val = this.readByte(zpAddr);
			this.writeByte(zpAddr, val);
			const off = this.readBytePC();
			const oldPage = this.pc & 65280;
			let newPC = this.pc + (off > 127 ? off - 256 : off);
			newPC &= 65535;
			const newOff = newPC & 255;
			this.readByte(oldPage | newOff);
			if ((1 << b & val) !== 0) this.pc = newPC;
		};
		this.tax = () => {
			this.readByte(this.pc);
			this.testNZ(this.xr = this.ar);
		};
		this.txa = () => {
			this.readByte(this.pc);
			this.testNZ(this.ar = this.xr);
		};
		this.tay = () => {
			this.readByte(this.pc);
			this.testNZ(this.yr = this.ar);
		};
		this.tya = () => {
			this.readByte(this.pc);
			this.testNZ(this.ar = this.yr);
		};
		this.tsx = () => {
			this.readByte(this.pc);
			this.testNZ(this.xr = this.sp);
		};
		this.txs = () => {
			this.readByte(this.pc);
			this.sp = this.xr;
		};
		this.pha = () => {
			this.readByte(this.pc);
			this.pushByte(this.ar);
		};
		this.pla = () => {
			this.readByte(this.pc);
			this.readByte(256 | this.sp);
			this.testNZ(this.ar = this.pullByte());
		};
		this.phx = () => {
			this.readByte(this.pc);
			this.pushByte(this.xr);
		};
		this.plx = () => {
			this.readByte(this.pc);
			this.readByte(256 | this.sp);
			this.testNZ(this.xr = this.pullByte());
		};
		this.phy = () => {
			this.readByte(this.pc);
			this.pushByte(this.yr);
		};
		this.ply = () => {
			this.readByte(this.pc);
			this.readByte(256 | this.sp);
			this.testNZ(this.yr = this.pullByte());
		};
		this.php = () => {
			this.readByte(this.pc);
			this.pushByte(this.sr | flags.B);
		};
		this.plp = () => {
			this.readByte(this.pc);
			this.readByte(256 | this.sp);
			this.sr = this.pullByte() & ~flags.B | flags.X;
		};
		this.jmp = (readAddrFn) => {
			this.pc = readAddrFn();
		};
		this.jsr = () => {
			const lsb = this.readBytePC();
			this.readByte(256 | this.sp);
			this.pushWord(this.pc);
			const msb = this.readBytePC();
			this.pc = (msb << 8 | lsb) & 65535;
		};
		this.rts = () => {
			this.readByte(this.pc);
			this.readByte(256 | this.sp);
			const addr = this.pullWordRaw();
			this.readByte(addr);
			this.pc = addr + 1 & 65535;
		};
		this.rti = () => {
			this.readByte(this.pc);
			this.readByte(256 | this.sp);
			this.sr = this.pullByte() & ~flags.B | flags.X;
			this.pc = this.pullWordRaw();
		};
		this.set = (flag) => {
			this.readByte(this.pc);
			this.sr |= flag;
		};
		this.clr = (flag) => {
			this.readByte(this.pc);
			this.sr &= ~flag;
		};
		this.nop = (readFn) => {
			readFn();
		};
		this.aso = (readAddrFn) => {
			const addr = readAddrFn();
			const oldVal = this.readByte(addr);
			this.workCycle(addr, oldVal);
			const val = this.shiftLeft(oldVal);
			this.writeByte(addr, val);
			this.ar |= val;
			this.testNZ(this.ar);
		};
		this.rla = (readAddrFn) => {
			const addr = readAddrFn();
			const oldVal = this.readByte(addr);
			this.workCycle(addr, oldVal);
			const val = this.rotateLeft(oldVal);
			this.writeByte(addr, val);
			this.ar &= val;
			this.testNZ(this.ar);
		};
		this.lse = (readAddrFn) => {
			const addr = readAddrFn();
			const oldVal = this.readByte(addr);
			this.workCycle(addr, oldVal);
			const val = this.shiftRight(oldVal);
			this.writeByte(addr, val);
			this.ar ^= val;
			this.testNZ(this.ar);
		};
		this.rra = (readAddrFn) => {
			const addr = readAddrFn();
			const oldVal = this.readByte(addr);
			this.workCycle(addr, oldVal);
			const val = this.rotateRight(oldVal);
			this.writeByte(addr, val);
			this.ar = this.add(this.ar, val, false);
		};
		this.axs = (writeFn) => {
			writeFn(this.ar & this.xr);
		};
		this.lax = (readFn) => {
			const val = readFn();
			this.ar = val;
			this.xr = val;
			this.testNZ(val);
		};
		this.dcm = (readAddrFn) => {
			const addr = readAddrFn({ inc: true });
			const oldVal = this.readByte(addr);
			this.workCycle(addr, oldVal);
			const val = this.decrement(oldVal);
			this.writeByte(addr, val);
			this.compare(this.ar, val);
		};
		this.ins = (readAddrFn) => {
			const addr = readAddrFn({ inc: true });
			const oldVal = this.readByte(addr);
			this.workCycle(addr, oldVal);
			const val = this.increment(oldVal);
			this.writeByte(addr, val);
			this.ar = this.add(this.ar, val ^ 255, true);
		};
		this.alr = (readFn) => {
			const val = readFn() & this.ar;
			this.ar = this.shiftRight(val);
		};
		this.arr = (readFn) => {
			const val = readFn() & this.ar;
			const ah = val >> 4;
			const al = val & 15;
			const b7 = val >> 7;
			const b6 = val >> 6 & 1;
			this.ar = this.rotateRight(val);
			let c = !!b7;
			const v = !!(b7 ^ b6);
			if (this.sr & flags.D) {
				if (al + (al & 1) > 5) this.ar = this.ar & 240 | this.ar + 6 & 15;
				if (ah + (ah & 1) > 5) {
					c = true;
					this.ar = this.ar + 96 & 255;
				}
			}
			this.setFlag(flags.V, v);
			this.setFlag(flags.C, c);
		};
		this.xaa = (readFn) => {
			const val = readFn();
			this.ar = this.xr & 238 | this.xr & this.ar & 17;
			this.ar = this.testNZ(this.ar & val);
		};
		this.oal = (readFn) => {
			this.ar |= 238;
			const val = this.testNZ(this.ar & readFn());
			this.ar = val;
			this.xr = val;
		};
		this.sax = (readFn) => {
			const a = this.xr & this.ar;
			let b = readFn();
			b = b ^ 255;
			const c = a + b + 1;
			this.setFlag(flags.C, c > 255);
			this.xr = this.testNZ(c & 255);
		};
		this.tas = (readAddrFn) => {
			const addr = readAddrFn();
			let val = this.xr & this.ar;
			this.sp = val;
			const msb = addr >> 8;
			val = val & (msb + 1 & 255);
			this.writeByte(addr, val);
		};
		this.say = (readAddrFn) => {
			const addr = readAddrFn();
			const msb = addr >> 8;
			const val = this.yr & (msb + 1 & 255);
			this.writeByte(addr, val);
		};
		this.xas = (readAddrFn) => {
			const addr = readAddrFn();
			const msb = addr >> 8;
			const val = this.xr & (msb + 1 & 255);
			this.writeByte(addr, val);
		};
		this.axa = (readAddrFn) => {
			const addr = readAddrFn();
			let val = this.xr & this.ar;
			const msb = addr >> 8;
			val = val & (msb + 1 & 255);
			this.writeByte(addr, val);
		};
		this.anc = (readFn) => {
			this.ar = this.testNZ(this.ar & readFn());
			const c = !!(this.ar & 128);
			this.setFlag(flags.C, c);
		};
		this.las = (readFn) => {
			const val = this.sp & readFn();
			this.sp = val;
			this.xr = val;
			this.ar = this.testNZ(val);
		};
		this.skp = (readFn) => {
			readFn();
		};
		this.hlt = (_impliedFn) => {
			this.readByte(this.pc);
			this.readByte(this.pc);
			this.pc = --this.pc & 65535;
			this.stop = true;
		};
		this.OPS_6502 = {
			169: {
				name: "LDA",
				fn: () => this.lda(this.readImmediate),
				mode: "immediate"
			},
			165: {
				name: "LDA",
				fn: () => this.lda(this.readZeroPage),
				mode: "zeroPage"
			},
			181: {
				name: "LDA",
				fn: () => this.lda(this.readZeroPageX),
				mode: "zeroPageX"
			},
			173: {
				name: "LDA",
				fn: () => this.lda(this.readAbsolute),
				mode: "absolute"
			},
			189: {
				name: "LDA",
				fn: () => this.lda(this.readAbsoluteX),
				mode: "absoluteX"
			},
			185: {
				name: "LDA",
				fn: () => this.lda(this.readAbsoluteY),
				mode: "absoluteY"
			},
			161: {
				name: "LDA",
				fn: () => this.lda(this.readZeroPageXIndirect),
				mode: "zeroPageXIndirect"
			},
			177: {
				name: "LDA",
				fn: () => this.lda(this.readZeroPageIndirectY),
				mode: "zeroPageIndirectY"
			},
			162: {
				name: "LDX",
				fn: () => this.ldx(this.readImmediate),
				mode: "immediate"
			},
			166: {
				name: "LDX",
				fn: () => this.ldx(this.readZeroPage),
				mode: "zeroPage"
			},
			182: {
				name: "LDX",
				fn: () => this.ldx(this.readZeroPageY),
				mode: "zeroPageY"
			},
			174: {
				name: "LDX",
				fn: () => this.ldx(this.readAbsolute),
				mode: "absolute"
			},
			190: {
				name: "LDX",
				fn: () => this.ldx(this.readAbsoluteY),
				mode: "absoluteY"
			},
			160: {
				name: "LDY",
				fn: () => this.ldy(this.readImmediate),
				mode: "immediate"
			},
			164: {
				name: "LDY",
				fn: () => this.ldy(this.readZeroPage),
				mode: "zeroPage"
			},
			180: {
				name: "LDY",
				fn: () => this.ldy(this.readZeroPageX),
				mode: "zeroPageX"
			},
			172: {
				name: "LDY",
				fn: () => this.ldy(this.readAbsolute),
				mode: "absolute"
			},
			188: {
				name: "LDY",
				fn: () => this.ldy(this.readAbsoluteX),
				mode: "absoluteX"
			},
			133: {
				name: "STA",
				fn: () => this.sta(this.writeZeroPage),
				mode: "zeroPage"
			},
			149: {
				name: "STA",
				fn: () => this.sta(this.writeZeroPageX),
				mode: "zeroPageX"
			},
			141: {
				name: "STA",
				fn: () => this.sta(this.writeAbsolute),
				mode: "absolute"
			},
			157: {
				name: "STA",
				fn: () => this.sta(this.writeAbsoluteX),
				mode: "absoluteX"
			},
			153: {
				name: "STA",
				fn: () => this.sta(this.writeAbsoluteY),
				mode: "absoluteY"
			},
			129: {
				name: "STA",
				fn: () => this.sta(this.writeZeroPageXIndirect),
				mode: "zeroPageXIndirect"
			},
			145: {
				name: "STA",
				fn: () => this.sta(this.writeZeroPageIndirectY),
				mode: "zeroPageIndirectY"
			},
			134: {
				name: "STX",
				fn: () => this.stx(this.writeZeroPage),
				mode: "zeroPage"
			},
			150: {
				name: "STX",
				fn: () => this.stx(this.writeZeroPageY),
				mode: "zeroPageY"
			},
			142: {
				name: "STX",
				fn: () => this.stx(this.writeAbsolute),
				mode: "absolute"
			},
			132: {
				name: "STY",
				fn: () => this.sty(this.writeZeroPage),
				mode: "zeroPage"
			},
			148: {
				name: "STY",
				fn: () => this.sty(this.writeZeroPageX),
				mode: "zeroPageX"
			},
			140: {
				name: "STY",
				fn: () => this.sty(this.writeAbsolute),
				mode: "absolute"
			},
			105: {
				name: "ADC",
				fn: () => this.adc(this.readImmediate),
				mode: "immediate"
			},
			101: {
				name: "ADC",
				fn: () => this.adc(this.readZeroPage),
				mode: "zeroPage"
			},
			117: {
				name: "ADC",
				fn: () => this.adc(this.readZeroPageX),
				mode: "zeroPageX"
			},
			109: {
				name: "ADC",
				fn: () => this.adc(this.readAbsolute),
				mode: "absolute"
			},
			125: {
				name: "ADC",
				fn: () => this.adc(this.readAbsoluteX),
				mode: "absoluteX"
			},
			121: {
				name: "ADC",
				fn: () => this.adc(this.readAbsoluteY),
				mode: "absoluteY"
			},
			97: {
				name: "ADC",
				fn: () => this.adc(this.readZeroPageXIndirect),
				mode: "zeroPageXIndirect"
			},
			113: {
				name: "ADC",
				fn: () => this.adc(this.readZeroPageIndirectY),
				mode: "zeroPageIndirectY"
			},
			233: {
				name: "SBC",
				fn: () => this.sbc(this.readImmediate),
				mode: "immediate"
			},
			229: {
				name: "SBC",
				fn: () => this.sbc(this.readZeroPage),
				mode: "zeroPage"
			},
			245: {
				name: "SBC",
				fn: () => this.sbc(this.readZeroPageX),
				mode: "zeroPageX"
			},
			237: {
				name: "SBC",
				fn: () => this.sbc(this.readAbsolute),
				mode: "absolute"
			},
			253: {
				name: "SBC",
				fn: () => this.sbc(this.readAbsoluteX),
				mode: "absoluteX"
			},
			249: {
				name: "SBC",
				fn: () => this.sbc(this.readAbsoluteY),
				mode: "absoluteY"
			},
			225: {
				name: "SBC",
				fn: () => this.sbc(this.readZeroPageXIndirect),
				mode: "zeroPageXIndirect"
			},
			241: {
				name: "SBC",
				fn: () => this.sbc(this.readZeroPageIndirectY),
				mode: "zeroPageIndirectY"
			},
			230: {
				name: "INC",
				fn: () => this.inc(this.readAddrZeroPage),
				mode: "zeroPage"
			},
			246: {
				name: "INC",
				fn: () => this.inc(this.readAddrZeroPageX),
				mode: "zeroPageX"
			},
			238: {
				name: "INC",
				fn: () => this.inc(this.readAddrAbsolute),
				mode: "absolute"
			},
			254: {
				name: "INC",
				fn: () => this.inc(this.readAddrAbsoluteX),
				mode: "absoluteX"
			},
			232: {
				name: "INX",
				fn: () => this.inx(),
				mode: "implied"
			},
			200: {
				name: "INY",
				fn: () => this.iny(),
				mode: "implied"
			},
			198: {
				name: "DEC",
				fn: () => this.dec(this.readAddrZeroPage),
				mode: "zeroPage"
			},
			214: {
				name: "DEC",
				fn: () => this.dec(this.readAddrZeroPageX),
				mode: "zeroPageX"
			},
			206: {
				name: "DEC",
				fn: () => this.dec(this.readAddrAbsolute),
				mode: "absolute"
			},
			222: {
				name: "DEC",
				fn: () => this.dec(this.readAddrAbsoluteX),
				mode: "absoluteX"
			},
			202: {
				name: "DEX",
				fn: () => this.dex(),
				mode: "implied"
			},
			136: {
				name: "DEY",
				fn: () => this.dey(),
				mode: "implied"
			},
			10: {
				name: "ASL",
				fn: () => this.aslA(),
				mode: "accumulator"
			},
			6: {
				name: "ASL",
				fn: () => this.asl(this.readAddrZeroPage),
				mode: "zeroPage"
			},
			22: {
				name: "ASL",
				fn: () => this.asl(this.readAddrZeroPageX),
				mode: "zeroPageX"
			},
			14: {
				name: "ASL",
				fn: () => this.asl(this.readAddrAbsolute),
				mode: "absolute"
			},
			30: {
				name: "ASL",
				fn: () => this.asl(this.readAddrAbsoluteX),
				mode: "absoluteX"
			},
			74: {
				name: "LSR",
				fn: () => this.lsrA(),
				mode: "accumulator"
			},
			70: {
				name: "LSR",
				fn: () => this.lsr(this.readAddrZeroPage),
				mode: "zeroPage"
			},
			86: {
				name: "LSR",
				fn: () => this.lsr(this.readAddrZeroPageX),
				mode: "zeroPageX"
			},
			78: {
				name: "LSR",
				fn: () => this.lsr(this.readAddrAbsolute),
				mode: "absolute"
			},
			94: {
				name: "LSR",
				fn: () => this.lsr(this.readAddrAbsoluteX),
				mode: "absoluteX"
			},
			42: {
				name: "ROL",
				fn: () => this.rolA(),
				mode: "accumulator"
			},
			38: {
				name: "ROL",
				fn: () => this.rol(this.readAddrZeroPage),
				mode: "zeroPage"
			},
			54: {
				name: "ROL",
				fn: () => this.rol(this.readAddrZeroPageX),
				mode: "zeroPageX"
			},
			46: {
				name: "ROL",
				fn: () => this.rol(this.readAddrAbsolute),
				mode: "absolute"
			},
			62: {
				name: "ROL",
				fn: () => this.rol(this.readAddrAbsoluteX),
				mode: "absoluteX"
			},
			106: {
				name: "ROR",
				fn: () => this.rorA(),
				mode: "accumulator"
			},
			102: {
				name: "ROR",
				fn: () => this.ror(this.readAddrZeroPage),
				mode: "zeroPage"
			},
			118: {
				name: "ROR",
				fn: () => this.ror(this.readAddrZeroPageX),
				mode: "zeroPageX"
			},
			110: {
				name: "ROR",
				fn: () => this.ror(this.readAddrAbsolute),
				mode: "absolute"
			},
			126: {
				name: "ROR",
				fn: () => this.ror(this.readAddrAbsoluteX),
				mode: "absoluteX"
			},
			41: {
				name: "AND",
				fn: () => this.and(this.readImmediate),
				mode: "immediate"
			},
			37: {
				name: "AND",
				fn: () => this.and(this.readZeroPage),
				mode: "zeroPage"
			},
			53: {
				name: "AND",
				fn: () => this.and(this.readZeroPageX),
				mode: "zeroPageX"
			},
			45: {
				name: "AND",
				fn: () => this.and(this.readAbsolute),
				mode: "absolute"
			},
			61: {
				name: "AND",
				fn: () => this.and(this.readAbsoluteX),
				mode: "absoluteX"
			},
			57: {
				name: "AND",
				fn: () => this.and(this.readAbsoluteY),
				mode: "absoluteY"
			},
			33: {
				name: "AND",
				fn: () => this.and(this.readZeroPageXIndirect),
				mode: "zeroPageXIndirect"
			},
			49: {
				name: "AND",
				fn: () => this.and(this.readZeroPageIndirectY),
				mode: "zeroPageIndirectY"
			},
			9: {
				name: "ORA",
				fn: () => this.ora(this.readImmediate),
				mode: "immediate"
			},
			5: {
				name: "ORA",
				fn: () => this.ora(this.readZeroPage),
				mode: "zeroPage"
			},
			21: {
				name: "ORA",
				fn: () => this.ora(this.readZeroPageX),
				mode: "zeroPageX"
			},
			13: {
				name: "ORA",
				fn: () => this.ora(this.readAbsolute),
				mode: "absolute"
			},
			29: {
				name: "ORA",
				fn: () => this.ora(this.readAbsoluteX),
				mode: "absoluteX"
			},
			25: {
				name: "ORA",
				fn: () => this.ora(this.readAbsoluteY),
				mode: "absoluteY"
			},
			1: {
				name: "ORA",
				fn: () => this.ora(this.readZeroPageXIndirect),
				mode: "zeroPageXIndirect"
			},
			17: {
				name: "ORA",
				fn: () => this.ora(this.readZeroPageIndirectY),
				mode: "zeroPageIndirectY"
			},
			73: {
				name: "EOR",
				fn: () => this.eor(this.readImmediate),
				mode: "immediate"
			},
			69: {
				name: "EOR",
				fn: () => this.eor(this.readZeroPage),
				mode: "zeroPage"
			},
			85: {
				name: "EOR",
				fn: () => this.eor(this.readZeroPageX),
				mode: "zeroPageX"
			},
			77: {
				name: "EOR",
				fn: () => this.eor(this.readAbsolute),
				mode: "absolute"
			},
			93: {
				name: "EOR",
				fn: () => this.eor(this.readAbsoluteX),
				mode: "absoluteX"
			},
			89: {
				name: "EOR",
				fn: () => this.eor(this.readAbsoluteY),
				mode: "absoluteY"
			},
			65: {
				name: "EOR",
				fn: () => this.eor(this.readZeroPageXIndirect),
				mode: "zeroPageXIndirect"
			},
			81: {
				name: "EOR",
				fn: () => this.eor(this.readZeroPageIndirectY),
				mode: "zeroPageIndirectY"
			},
			201: {
				name: "CMP",
				fn: () => this.cmp(this.readImmediate),
				mode: "immediate"
			},
			197: {
				name: "CMP",
				fn: () => this.cmp(this.readZeroPage),
				mode: "zeroPage"
			},
			213: {
				name: "CMP",
				fn: () => this.cmp(this.readZeroPageX),
				mode: "zeroPageX"
			},
			205: {
				name: "CMP",
				fn: () => this.cmp(this.readAbsolute),
				mode: "absolute"
			},
			221: {
				name: "CMP",
				fn: () => this.cmp(this.readAbsoluteX),
				mode: "absoluteX"
			},
			217: {
				name: "CMP",
				fn: () => this.cmp(this.readAbsoluteY),
				mode: "absoluteY"
			},
			193: {
				name: "CMP",
				fn: () => this.cmp(this.readZeroPageXIndirect),
				mode: "zeroPageXIndirect"
			},
			209: {
				name: "CMP",
				fn: () => this.cmp(this.readZeroPageIndirectY),
				mode: "zeroPageIndirectY"
			},
			224: {
				name: "CPX",
				fn: () => this.cpx(this.readImmediate),
				mode: "immediate"
			},
			228: {
				name: "CPX",
				fn: () => this.cpx(this.readZeroPage),
				mode: "zeroPage"
			},
			236: {
				name: "CPX",
				fn: () => this.cpx(this.readAbsolute),
				mode: "absolute"
			},
			192: {
				name: "CPY",
				fn: () => this.cpy(this.readImmediate),
				mode: "immediate"
			},
			196: {
				name: "CPY",
				fn: () => this.cpy(this.readZeroPage),
				mode: "zeroPage"
			},
			204: {
				name: "CPY",
				fn: () => this.cpy(this.readAbsolute),
				mode: "absolute"
			},
			36: {
				name: "BIT",
				fn: () => this.bit(this.readZeroPage),
				mode: "zeroPage"
			},
			44: {
				name: "BIT",
				fn: () => this.bit(this.readAbsolute),
				mode: "absolute"
			},
			144: {
				name: "BCC",
				fn: () => this.brc(flags.C),
				mode: "relative"
			},
			176: {
				name: "BCS",
				fn: () => this.brs(flags.C),
				mode: "relative"
			},
			240: {
				name: "BEQ",
				fn: () => this.brs(flags.Z),
				mode: "relative"
			},
			48: {
				name: "BMI",
				fn: () => this.brs(flags.N),
				mode: "relative"
			},
			208: {
				name: "BNE",
				fn: () => this.brc(flags.Z),
				mode: "relative"
			},
			16: {
				name: "BPL",
				fn: () => this.brc(flags.N),
				mode: "relative"
			},
			80: {
				name: "BVC",
				fn: () => this.brc(flags.V),
				mode: "relative"
			},
			112: {
				name: "BVS",
				fn: () => this.brs(flags.V),
				mode: "relative"
			},
			170: {
				name: "TAX",
				fn: () => this.tax(),
				mode: "implied"
			},
			138: {
				name: "TXA",
				fn: () => this.txa(),
				mode: "implied"
			},
			168: {
				name: "TAY",
				fn: () => this.tay(),
				mode: "implied"
			},
			152: {
				name: "TYA",
				fn: () => this.tya(),
				mode: "implied"
			},
			186: {
				name: "TSX",
				fn: () => this.tsx(),
				mode: "implied"
			},
			154: {
				name: "TXS",
				fn: () => this.txs(),
				mode: "implied"
			},
			72: {
				name: "PHA",
				fn: () => this.pha(),
				mode: "implied"
			},
			104: {
				name: "PLA",
				fn: () => this.pla(),
				mode: "implied"
			},
			8: {
				name: "PHP",
				fn: () => this.php(),
				mode: "implied"
			},
			40: {
				name: "PLP",
				fn: () => this.plp(),
				mode: "implied"
			},
			76: {
				name: "JMP",
				fn: () => this.jmp(this.readAddrAbsolute),
				mode: "absolute"
			},
			108: {
				name: "JMP",
				fn: () => this.jmp(this.readAddrAbsoluteIndirectBug),
				mode: "absoluteIndirect"
			},
			32: {
				name: "JSR",
				fn: () => this.jsr(),
				mode: "absolute"
			},
			96: {
				name: "RTS",
				fn: () => this.rts(),
				mode: "implied"
			},
			64: {
				name: "RTI",
				fn: () => this.rti(),
				mode: "implied"
			},
			56: {
				name: "SEC",
				fn: () => this.set(flags.C),
				mode: "implied"
			},
			248: {
				name: "SED",
				fn: () => this.set(flags.D),
				mode: "implied"
			},
			120: {
				name: "SEI",
				fn: () => this.set(flags.I),
				mode: "implied"
			},
			24: {
				name: "CLC",
				fn: () => this.clr(flags.C),
				mode: "implied"
			},
			216: {
				name: "CLD",
				fn: () => this.clr(flags.D),
				mode: "implied"
			},
			88: {
				name: "CLI",
				fn: () => this.clr(flags.I),
				mode: "implied"
			},
			184: {
				name: "CLV",
				fn: () => this.clr(flags.V),
				mode: "implied"
			},
			234: {
				name: "NOP",
				fn: () => this.nop(this.implied),
				mode: "implied"
			},
			0: {
				name: "BRK",
				fn: () => this.brk(this.readImmediate),
				mode: "immediate"
			}
		};
		this.OPS_65C02 = {
			26: {
				name: "INC",
				fn: () => this.incA(),
				mode: "accumulator"
			},
			58: {
				name: "DEC",
				fn: () => this.decA(),
				mode: "accumulator"
			},
			18: {
				name: "ORA",
				fn: () => this.ora(this.readZeroPageIndirect),
				mode: "zeroPageIndirect"
			},
			50: {
				name: "AND",
				fn: () => this.and(this.readZeroPageIndirect),
				mode: "zeroPageIndirect"
			},
			82: {
				name: "EOR",
				fn: () => this.eor(this.readZeroPageIndirect),
				mode: "zeroPageIndirect"
			},
			114: {
				name: "ADC",
				fn: () => this.adc(this.readZeroPageIndirect),
				mode: "zeroPageIndirect"
			},
			146: {
				name: "STA",
				fn: () => this.sta(this.writeZeroPageIndirect),
				mode: "zeroPageIndirect"
			},
			178: {
				name: "LDA",
				fn: () => this.lda(this.readZeroPageIndirect),
				mode: "zeroPageIndirect"
			},
			210: {
				name: "CMP",
				fn: () => this.cmp(this.readZeroPageIndirect),
				mode: "zeroPageIndirect"
			},
			242: {
				name: "SBC",
				fn: () => this.sbc(this.readZeroPageIndirect),
				mode: "zeroPageIndirect"
			},
			52: {
				name: "BIT",
				fn: () => this.bit(this.readZeroPageX),
				mode: "zeroPageX"
			},
			60: {
				name: "BIT",
				fn: () => this.bit(this.readAbsoluteX),
				mode: "absoluteX"
			},
			137: {
				name: "BIT",
				fn: () => this.bitI(this.readImmediate),
				mode: "immediate"
			},
			108: {
				name: "JMP",
				fn: () => this.jmp(this.readAddrAbsoluteIndirect),
				mode: "absoluteIndirect"
			},
			124: {
				name: "JMP",
				fn: () => this.jmp(this.readAddrAbsoluteXIndirect),
				mode: "absoluteXIndirect"
			},
			15: {
				name: "BBR0",
				fn: () => this.bbr(0),
				mode: "zeroPage_relative"
			},
			31: {
				name: "BBR1",
				fn: () => this.bbr(1),
				mode: "zeroPage_relative"
			},
			47: {
				name: "BBR2",
				fn: () => this.bbr(2),
				mode: "zeroPage_relative"
			},
			63: {
				name: "BBR3",
				fn: () => this.bbr(3),
				mode: "zeroPage_relative"
			},
			79: {
				name: "BBR4",
				fn: () => this.bbr(4),
				mode: "zeroPage_relative"
			},
			95: {
				name: "BBR5",
				fn: () => this.bbr(5),
				mode: "zeroPage_relative"
			},
			111: {
				name: "BBR6",
				fn: () => this.bbr(6),
				mode: "zeroPage_relative"
			},
			127: {
				name: "BBR7",
				fn: () => this.bbr(7),
				mode: "zeroPage_relative"
			},
			143: {
				name: "BBS0",
				fn: () => this.bbs(0),
				mode: "zeroPage_relative"
			},
			159: {
				name: "BBS1",
				fn: () => this.bbs(1),
				mode: "zeroPage_relative"
			},
			175: {
				name: "BBS2",
				fn: () => this.bbs(2),
				mode: "zeroPage_relative"
			},
			191: {
				name: "BBS3",
				fn: () => this.bbs(3),
				mode: "zeroPage_relative"
			},
			207: {
				name: "BBS4",
				fn: () => this.bbs(4),
				mode: "zeroPage_relative"
			},
			223: {
				name: "BBS5",
				fn: () => this.bbs(5),
				mode: "zeroPage_relative"
			},
			239: {
				name: "BBS6",
				fn: () => this.bbs(6),
				mode: "zeroPage_relative"
			},
			255: {
				name: "BBS7",
				fn: () => this.bbs(7),
				mode: "zeroPage_relative"
			},
			128: {
				name: "BRA",
				fn: () => this.brc(0),
				mode: "relative"
			},
			2: {
				name: "NOP",
				fn: () => this.nop(this.readImmediate),
				mode: "immediate"
			},
			34: {
				name: "NOP",
				fn: () => this.nop(this.readImmediate),
				mode: "immediate"
			},
			66: {
				name: "NOP",
				fn: () => this.nop(this.readImmediate),
				mode: "immediate"
			},
			68: {
				name: "NOP",
				fn: () => this.nop(this.readZeroPage),
				mode: "immediate"
			},
			84: {
				name: "NOP",
				fn: () => this.nop(this.readZeroPageX),
				mode: "immediate"
			},
			98: {
				name: "NOP",
				fn: () => this.nop(this.readImmediate),
				mode: "immediate"
			},
			130: {
				name: "NOP",
				fn: () => this.nop(this.readImmediate),
				mode: "immediate"
			},
			194: {
				name: "NOP",
				fn: () => this.nop(this.readImmediate),
				mode: "immediate"
			},
			212: {
				name: "NOP",
				fn: () => this.nop(this.readZeroPageX),
				mode: "immediate"
			},
			226: {
				name: "NOP",
				fn: () => this.nop(this.readImmediate),
				mode: "immediate"
			},
			244: {
				name: "NOP",
				fn: () => this.nop(this.readZeroPageX),
				mode: "immediate"
			},
			92: {
				name: "NOP",
				fn: () => this.nop(this.readNop),
				mode: "absolute"
			},
			220: {
				name: "NOP",
				fn: () => this.nop(this.readNop),
				mode: "absolute"
			},
			252: {
				name: "NOP",
				fn: () => this.nop(this.readNop),
				mode: "absolute"
			},
			218: {
				name: "PHX",
				fn: () => this.phx(),
				mode: "implied"
			},
			90: {
				name: "PHY",
				fn: () => this.phy(),
				mode: "implied"
			},
			250: {
				name: "PLX",
				fn: () => this.plx(),
				mode: "implied"
			},
			122: {
				name: "PLY",
				fn: () => this.ply(),
				mode: "implied"
			},
			7: {
				name: "RMB0",
				fn: () => this.rmb(0),
				mode: "zeroPage"
			},
			23: {
				name: "RMB1",
				fn: () => this.rmb(1),
				mode: "zeroPage"
			},
			39: {
				name: "RMB2",
				fn: () => this.rmb(2),
				mode: "zeroPage"
			},
			55: {
				name: "RMB3",
				fn: () => this.rmb(3),
				mode: "zeroPage"
			},
			71: {
				name: "RMB4",
				fn: () => this.rmb(4),
				mode: "zeroPage"
			},
			87: {
				name: "RMB5",
				fn: () => this.rmb(5),
				mode: "zeroPage"
			},
			103: {
				name: "RMB6",
				fn: () => this.rmb(6),
				mode: "zeroPage"
			},
			119: {
				name: "RMB7",
				fn: () => this.rmb(7),
				mode: "zeroPage"
			},
			135: {
				name: "SMB0",
				fn: () => this.smb(0),
				mode: "zeroPage"
			},
			151: {
				name: "SMB1",
				fn: () => this.smb(1),
				mode: "zeroPage"
			},
			167: {
				name: "SMB2",
				fn: () => this.smb(2),
				mode: "zeroPage"
			},
			183: {
				name: "SMB3",
				fn: () => this.smb(3),
				mode: "zeroPage"
			},
			199: {
				name: "SMB4",
				fn: () => this.smb(4),
				mode: "zeroPage"
			},
			215: {
				name: "SMB5",
				fn: () => this.smb(5),
				mode: "zeroPage"
			},
			231: {
				name: "SMB6",
				fn: () => this.smb(6),
				mode: "zeroPage"
			},
			247: {
				name: "SMB7",
				fn: () => this.smb(7),
				mode: "zeroPage"
			},
			100: {
				name: "STZ",
				fn: () => this.stz(this.writeZeroPage),
				mode: "zeroPage"
			},
			116: {
				name: "STZ",
				fn: () => this.stz(this.writeZeroPageX),
				mode: "zeroPageX"
			},
			156: {
				name: "STZ",
				fn: () => this.stz(this.writeAbsolute),
				mode: "absolute"
			},
			158: {
				name: "STZ",
				fn: () => this.stz(this.writeAbsoluteX),
				mode: "absoluteX"
			},
			20: {
				name: "TRB",
				fn: () => this.trb(this.readAddrZeroPage),
				mode: "zeroPage"
			},
			28: {
				name: "TRB",
				fn: () => this.trb(this.readAddrAbsolute),
				mode: "absolute"
			},
			4: {
				name: "TSB",
				fn: () => this.tsb(this.readAddrZeroPage),
				mode: "zeroPage"
			},
			12: {
				name: "TSB",
				fn: () => this.tsb(this.readAddrAbsolute),
				mode: "absolute"
			}
		};
		this.OPS_NMOS_6502 = {
			15: {
				name: "ASO",
				fn: () => this.aso(this.readAddrAbsolute),
				mode: "absolute"
			},
			31: {
				name: "ASO",
				fn: () => this.aso(this.readAddrAbsoluteX),
				mode: "absoluteX"
			},
			27: {
				name: "ASO",
				fn: () => this.aso(this.readAddrAbsoluteY),
				mode: "absoluteY"
			},
			7: {
				name: "ASO",
				fn: () => this.aso(this.readAddrZeroPage),
				mode: "zeroPage"
			},
			23: {
				name: "ASO",
				fn: () => this.aso(this.readAddrZeroPageX),
				mode: "zeroPageX"
			},
			3: {
				name: "ASO",
				fn: () => this.aso(this.readAddrZeroPageXIndirect),
				mode: "zeroPageXIndirect"
			},
			19: {
				name: "ASO",
				fn: () => this.aso(this.readAddrZeroPageIndirectY),
				mode: "zeroPageIndirectY"
			},
			47: {
				name: "RLA",
				fn: () => this.rla(this.readAddrAbsolute),
				mode: "absolute"
			},
			63: {
				name: "RLA",
				fn: () => this.rla(this.readAddrAbsoluteX),
				mode: "absoluteX"
			},
			59: {
				name: "RLA",
				fn: () => this.rla(this.readAddrAbsoluteY),
				mode: "absoluteY"
			},
			39: {
				name: "RLA",
				fn: () => this.rla(this.readAddrZeroPage),
				mode: "zeroPage"
			},
			55: {
				name: "RLA",
				fn: () => this.rla(this.readAddrZeroPageX),
				mode: "zeroPageX"
			},
			35: {
				name: "RLA",
				fn: () => this.rla(this.readAddrZeroPageXIndirect),
				mode: "zeroPageXIndirect"
			},
			51: {
				name: "RLA",
				fn: () => this.rla(this.readAddrZeroPageIndirectY),
				mode: "zeroPageIndirectY"
			},
			79: {
				name: "LSE",
				fn: () => this.lse(this.readAddrAbsolute),
				mode: "absolute"
			},
			95: {
				name: "LSE",
				fn: () => this.lse(this.readAddrAbsoluteX),
				mode: "absoluteX"
			},
			91: {
				name: "LSE",
				fn: () => this.lse(this.readAddrAbsoluteY),
				mode: "absoluteY"
			},
			71: {
				name: "LSE",
				fn: () => this.lse(this.readAddrZeroPage),
				mode: "zeroPage"
			},
			87: {
				name: "LSE",
				fn: () => this.lse(this.readAddrZeroPageX),
				mode: "zeroPageX"
			},
			67: {
				name: "LSE",
				fn: () => this.lse(this.readAddrZeroPageXIndirect),
				mode: "zeroPageXIndirect"
			},
			83: {
				name: "LSE",
				fn: () => this.lse(this.readAddrZeroPageIndirectY),
				mode: "zeroPageIndirectY"
			},
			111: {
				name: "RRA",
				fn: () => this.rra(this.readAddrAbsolute),
				mode: "absolute"
			},
			127: {
				name: "RRA",
				fn: () => this.rra(this.readAddrAbsoluteX),
				mode: "absoluteX"
			},
			123: {
				name: "RRA",
				fn: () => this.rra(this.readAddrAbsoluteY),
				mode: "absoluteY"
			},
			103: {
				name: "RRA",
				fn: () => this.rra(this.readAddrZeroPage),
				mode: "zeroPage"
			},
			119: {
				name: "RRA",
				fn: () => this.rra(this.readAddrZeroPageX),
				mode: "zeroPageX"
			},
			99: {
				name: "RRA",
				fn: () => this.rra(this.readAddrZeroPageXIndirect),
				mode: "zeroPageXIndirect"
			},
			115: {
				name: "RRA",
				fn: () => this.rra(this.readAddrZeroPageIndirectY),
				mode: "zeroPageIndirectY"
			},
			143: {
				name: "AXS",
				fn: () => this.axs(this.writeAbsolute),
				mode: "absolute"
			},
			135: {
				name: "AXS",
				fn: () => this.axs(this.writeZeroPage),
				mode: "zeroPage"
			},
			151: {
				name: "AXS",
				fn: () => this.axs(this.writeZeroPageY),
				mode: "zeroPageY"
			},
			131: {
				name: "AXS",
				fn: () => this.axs(this.writeZeroPageXIndirect),
				mode: "zeroPageXIndirect"
			},
			175: {
				name: "LAX",
				fn: () => this.lax(this.readAbsolute),
				mode: "absolute"
			},
			191: {
				name: "LAX",
				fn: () => this.lax(this.readAbsoluteY),
				mode: "absoluteY"
			},
			167: {
				name: "LAX",
				fn: () => this.lax(this.readZeroPage),
				mode: "zeroPage"
			},
			183: {
				name: "LAX",
				fn: () => this.lax(this.readZeroPageY),
				mode: "zeroPageY"
			},
			163: {
				name: "LAX",
				fn: () => this.lax(this.readZeroPageXIndirect),
				mode: "zeroPageXIndirect"
			},
			179: {
				name: "LAX",
				fn: () => this.lax(this.readZeroPageIndirectY),
				mode: "zeroPageIndirectY"
			},
			207: {
				name: "DCM",
				fn: () => this.dcm(this.readAddrAbsolute),
				mode: "absolute"
			},
			223: {
				name: "DCM",
				fn: () => this.dcm(this.readAddrAbsoluteX),
				mode: "absoluteX"
			},
			219: {
				name: "DCM",
				fn: () => this.dcm(this.readAddrAbsoluteY),
				mode: "absoluteY"
			},
			199: {
				name: "DCM",
				fn: () => this.dcm(this.readAddrZeroPage),
				mode: "zeroPage"
			},
			215: {
				name: "DCM",
				fn: () => this.dcm(this.readAddrZeroPageX),
				mode: "zeroPageX"
			},
			195: {
				name: "DCM",
				fn: () => this.dcm(this.readAddrZeroPageXIndirect),
				mode: "zeroPageXIndirect"
			},
			211: {
				name: "DCM",
				fn: () => this.dcm(this.readAddrZeroPageIndirectY),
				mode: "zeroPageIndirectY"
			},
			239: {
				name: "INS",
				fn: () => this.ins(this.readAddrAbsolute),
				mode: "absolute"
			},
			255: {
				name: "INS",
				fn: () => this.ins(this.readAddrAbsoluteX),
				mode: "absoluteX"
			},
			251: {
				name: "INS",
				fn: () => this.ins(this.readAddrAbsoluteY),
				mode: "absoluteY"
			},
			231: {
				name: "INS",
				fn: () => this.ins(this.readAddrZeroPage),
				mode: "zeroPage"
			},
			247: {
				name: "INS",
				fn: () => this.ins(this.readAddrZeroPageX),
				mode: "zeroPageX"
			},
			227: {
				name: "INS",
				fn: () => this.ins(this.readAddrZeroPageXIndirect),
				mode: "zeroPageXIndirect"
			},
			243: {
				name: "INS",
				fn: () => this.ins(this.readAddrZeroPageIndirectY),
				mode: "zeroPageIndirectY"
			},
			75: {
				name: "ALR",
				fn: () => this.alr(this.readImmediate),
				mode: "immediate"
			},
			107: {
				name: "ARR",
				fn: () => this.arr(this.readImmediate),
				mode: "immediate"
			},
			139: {
				name: "XAA",
				fn: () => this.xaa(this.readImmediate),
				mode: "immediate"
			},
			171: {
				name: "OAL",
				fn: () => this.oal(this.readImmediate),
				mode: "immediate"
			},
			203: {
				name: "SAX",
				fn: () => this.sax(this.readImmediate),
				mode: "immediate"
			},
			26: {
				name: "NOP",
				fn: () => this.nop(this.implied),
				mode: "implied"
			},
			58: {
				name: "NOP",
				fn: () => this.nop(this.implied),
				mode: "implied"
			},
			90: {
				name: "NOP",
				fn: () => this.nop(this.implied),
				mode: "implied"
			},
			122: {
				name: "NOP",
				fn: () => this.nop(this.implied),
				mode: "implied"
			},
			218: {
				name: "NOP",
				fn: () => this.nop(this.implied),
				mode: "implied"
			},
			250: {
				name: "NOP",
				fn: () => this.nop(this.implied),
				mode: "implied"
			},
			128: {
				name: "SKB",
				fn: () => this.skp(this.readImmediate),
				mode: "immediate"
			},
			130: {
				name: "SKB",
				fn: () => this.skp(this.readImmediate),
				mode: "immediate"
			},
			137: {
				name: "SKB",
				fn: () => this.skp(this.readImmediate),
				mode: "immediate"
			},
			194: {
				name: "SKB",
				fn: () => this.skp(this.readImmediate),
				mode: "immediate"
			},
			226: {
				name: "SKB",
				fn: () => this.skp(this.readImmediate),
				mode: "immediate"
			},
			4: {
				name: "SKB",
				fn: () => this.skp(this.readZeroPage),
				mode: "zeroPage"
			},
			20: {
				name: "SKB",
				fn: () => this.skp(this.readZeroPageX),
				mode: "zeroPageX"
			},
			52: {
				name: "SKB",
				fn: () => this.skp(this.readZeroPageX),
				mode: "zeroPageX"
			},
			68: {
				name: "SKB",
				fn: () => this.skp(this.readZeroPage),
				mode: "zeroPage"
			},
			84: {
				name: "SKB",
				fn: () => this.skp(this.readZeroPageX),
				mode: "zeroPageX"
			},
			100: {
				name: "SKB",
				fn: () => this.skp(this.readZeroPage),
				mode: "zeroPage"
			},
			116: {
				name: "SKB",
				fn: () => this.skp(this.readZeroPageX),
				mode: "zeroPageX"
			},
			212: {
				name: "SKB",
				fn: () => this.skp(this.readZeroPageX),
				mode: "zeroPageX"
			},
			244: {
				name: "SKB",
				fn: () => this.skp(this.readZeroPageX),
				mode: "zeroPageX"
			},
			12: {
				name: "SKW",
				fn: () => this.skp(this.readAddrAbsolute),
				mode: "absolute"
			},
			28: {
				name: "SKW",
				fn: () => this.skp(this.readAddrAbsoluteX),
				mode: "absoluteX"
			},
			60: {
				name: "SKW",
				fn: () => this.skp(this.readAddrAbsoluteX),
				mode: "absoluteX"
			},
			92: {
				name: "SKW",
				fn: () => this.skp(this.readAddrAbsoluteX),
				mode: "absoluteX"
			},
			124: {
				name: "SKW",
				fn: () => this.skp(this.readAddrAbsoluteX),
				mode: "absoluteX"
			},
			220: {
				name: "SKW",
				fn: () => this.skp(this.readAddrAbsoluteX),
				mode: "absoluteX"
			},
			252: {
				name: "SKW",
				fn: () => this.skp(this.readAddrAbsoluteX),
				mode: "absoluteX"
			},
			2: {
				name: "HLT",
				fn: () => this.hlt(this.readNopImplied),
				mode: "implied"
			},
			18: {
				name: "HLT",
				fn: () => this.hlt(this.readNopImplied),
				mode: "implied"
			},
			34: {
				name: "HLT",
				fn: () => this.hlt(this.readNopImplied),
				mode: "implied"
			},
			50: {
				name: "HLT",
				fn: () => this.hlt(this.readNopImplied),
				mode: "implied"
			},
			66: {
				name: "HLT",
				fn: () => this.hlt(this.readNopImplied),
				mode: "implied"
			},
			82: {
				name: "HLT",
				fn: () => this.hlt(this.readNopImplied),
				mode: "implied"
			},
			98: {
				name: "HLT",
				fn: () => this.hlt(this.readNopImplied),
				mode: "implied"
			},
			114: {
				name: "HLT",
				fn: () => this.hlt(this.readNopImplied),
				mode: "implied"
			},
			146: {
				name: "HLT",
				fn: () => this.hlt(this.readNopImplied),
				mode: "implied"
			},
			178: {
				name: "HLT",
				fn: () => this.hlt(this.readNopImplied),
				mode: "implied"
			},
			210: {
				name: "HLT",
				fn: () => this.hlt(this.readNopImplied),
				mode: "implied"
			},
			242: {
				name: "HLT",
				fn: () => this.hlt(this.readNopImplied),
				mode: "implied"
			},
			155: {
				name: "TAS",
				fn: () => this.tas(this.readAddrAbsoluteY),
				mode: "absoluteY"
			},
			156: {
				name: "SAY",
				fn: () => this.say(this.readAddrAbsoluteX),
				mode: "absoluteX"
			},
			158: {
				name: "XAS",
				fn: () => this.xas(this.readAddrAbsoluteY),
				mode: "absoluteY"
			},
			159: {
				name: "AXA",
				fn: () => this.axa(this.readAddrAbsoluteY),
				mode: "absoluteY"
			},
			147: {
				name: "AXA",
				fn: () => this.axa(this.readAddrZeroPageIndirectY),
				mode: "zeroPageIndirectY"
			},
			43: {
				name: "ANC",
				fn: () => this.anc(this.readImmediate),
				mode: "immediate"
			},
			11: {
				name: "ANC",
				fn: () => this.anc(this.readImmediate),
				mode: "immediate"
			},
			187: {
				name: "LAS",
				fn: () => this.las(this.readAbsoluteY),
				mode: "absoluteY"
			},
			235: {
				name: "SBC",
				fn: () => this.sbc(this.readImmediate),
				mode: "immediate"
			}
		};
		this.OPS_ROCKWELL_65C02 = {
			203: {
				name: "NOP",
				fn: () => this.nop(this.implied),
				mode: "implied"
			},
			219: {
				name: "NOP",
				fn: () => this.nop(this.readZeroPageX),
				mode: "immediate"
			}
		};
		this.OPS_WDC_65C02 = {
			203: {
				name: "WAI",
				fn: () => this.wai(),
				mode: "implied"
			},
			219: {
				name: "STP",
				fn: () => this.stp(),
				mode: "implied"
			}
		};
		this.flavor = flavor ?? "6502";
		this.is65C02 = !!flavor && FLAVORS_65C02.includes(flavor);
		this.memPages.fill(BLANK_PAGE);
		this.memPages.fill(BLANK_PAGE);
		let ops = { ...this.OPS_6502 };
		switch (this.flavor) {
			case FLAVOR_WDC_65C02:
				ops = {
					...ops,
					...this.OPS_65C02,
					...this.OPS_WDC_65C02
				};
				break;
			case FLAVOR_ROCKWELL_65C02:
				ops = {
					...ops,
					...this.OPS_65C02,
					...this.OPS_ROCKWELL_65C02
				};
				break;
			default: ops = {
				...ops,
				...this.OPS_NMOS_6502
			};
		}
		this.opary = new Array(256);
		for (let idx = 0; idx < 256; idx++) this.opary[idx] = ops[idx] || this.unknown(idx);
	}
	/**
	* Set or clears `f` in the status register. `f` must be a byte with a
	* single bit set.
	*/
	setFlag(f, on) {
		this.sr = on ? this.sr | f : this.sr & ~f;
	}
	/** Updates the status register's zero flag and negative flag. */
	testNZ(val) {
		this.sr = val === 0 ? this.sr | flags.Z : this.sr & ~flags.Z;
		this.sr = val & 128 ? this.sr | flags.N : this.sr & ~flags.N;
		return val;
	}
	/** Updates the status register's zero flag. */
	testZ(val) {
		this.sr = val === 0 ? this.sr | flags.Z : this.sr & ~flags.Z;
		return val;
	}
	/**
	* Returns `a + b`, unless `sub` is true, in which case it performs
	* `a - b`. The status register is updated according to the result.
	*/
	add(a, b, sub) {
		const a7 = a >> 7;
		const b7 = b >> 7;
		const ci = this.sr & flags.C;
		let c;
		let co;
		let v;
		let n;
		let z;
		const updateFlags = (c) => {
			n = (c & 255) >> 7;
			co = c >> 8;
			z = !(a + b + ci & 255);
			v = a7 ^ b7 ^ n ^ co;
		};
		const updateBCDFlags = (c) => {
			if (this.is65C02) {
				const bin = c & 255;
				n = bin >> 7;
				z = !bin;
				if (this.op?.mode === "immediate") {
					if (this.flavor === "wdc65c02") this.readByte(sub ? 184 : 127);
					else this.readByte(sub ? 177 : 89);
				} else this.readByte(this.addr);
			}
			if (!sub) co = c >> 8;
		};
		c = (a & 15) + (b & 15) + ci;
		if ((this.sr & flags.D) !== 0) {
			if (sub) {
				if (c < 16) c = c - 6 & 15;
				c += (a & 240) + (b & 240);
				updateFlags(c);
				if (c < 256) c += 160;
			} else {
				if (c > 9) c = 16 + (c + 6 & 15);
				c += (a & 240) + (b & 240);
				updateFlags(c);
				if (c >= 160) c += 96;
			}
			updateBCDFlags(c);
		} else {
			c += (a & 240) + (b & 240);
			updateFlags(c);
		}
		c = c & 255;
		this.setFlag(flags.N, !!n);
		this.setFlag(flags.V, !!v);
		this.setFlag(flags.Z, !!z);
		this.setFlag(flags.C, !!co);
		return c;
	}
	/** Increments `a` and returns the value, setting the status register. */
	increment(a) {
		return this.testNZ(a + 1 & 255);
	}
	decrement(a) {
		return this.testNZ(a + 255 & 255);
	}
	readBytePC() {
		const result = this.readByte(this.pc);
		this.pc = this.pc + 1 & 65535;
		return result;
	}
	readByte(addr) {
		this.addr = addr;
		const page = addr >> 8, off = addr & 255;
		const result = this.memPages[page].read(page, off);
		this.cycles++;
		return result;
	}
	writeByte(addr, val) {
		this.addr = addr;
		const page = addr >> 8, off = addr & 255;
		this.memPages[page].write(page, off, val);
		this.cycles++;
	}
	readWord(addr) {
		return this.readByte(addr) | this.readByte(addr + 1) << 8;
	}
	readWordPC() {
		return this.readBytePC() | this.readBytePC() << 8;
	}
	readZPWord(addr) {
		const lsb = this.readByte(addr & 255);
		return this.readByte(addr + 1 & 255) << 8 | lsb;
	}
	pushByte(val) {
		this.writeByte(loc.STACK | this.sp, val);
		this.sp = this.sp + 255 & 255;
	}
	pushWord(val) {
		this.pushByte(val >> 8);
		this.pushByte(val & 255);
	}
	pullByte() {
		this.sp = this.sp + 1 & 255;
		return this.readByte(loc.STACK | this.sp);
	}
	pullWordRaw() {
		const lsb = this.pullByte();
		return this.pullByte() << 8 | lsb;
	}
	workCycle(addr, val) {
		if (this.is65C02) this.readByte(addr);
		else this.writeByte(addr, val);
	}
	workCycleIndexedWrite(pc, addr, addrIdx) {
		const oldPage = addr & 65280;
		if (this.is65C02) this.readByte(pc);
		else {
			const off = addrIdx & 255;
			this.readByte(oldPage | off);
		}
	}
	workCycleIndexedRead(pc, addr, addrIdx) {
		const oldPage = addr & 65280;
		if ((addrIdx & 65280) !== oldPage) {
			if (this.is65C02) this.readByte(pc);
			else {
				const off = addrIdx & 255;
				this.readByte(oldPage | off);
			}
		}
	}
	rotateRight(a) {
		const c = this.sr & flags.C;
		this.setFlag(flags.C, !!(a & 1));
		return this.testNZ(a >> 1 | (c ? 128 : 0));
	}
	compare(a, b) {
		b = b ^ 255;
		const c = a + b + 1;
		this.setFlag(flags.C, c > 255);
		this.testNZ(c & 255);
	}
	unknown(b) {
		let unk;
		if (this.is65C02) unk = {
			name: "NOP",
			fn: () => this.nop(this.readNopImplied),
			mode: "implied"
		};
		else throw new Error(`Missing ${toHex(b)}`);
		return unk;
	}
	/**
	* Execute a single instruction at the program counter address.
	*
	* @param cb Callback after instruction is executed
	*/
	step(cb) {
		this.sync = true;
		this.op = this.opary[this.readBytePC()];
		this.sync = false;
		this.op.fn();
		cb?.(this);
	}
	/**
	* Execute n instructions, starting at the program counter address.
	*
	* @param cb Callback after each instruction is executed
	*/
	stepN(n, cb) {
		for (let idx = 0; idx < n; idx++) {
			this.sync = true;
			this.op = this.opary[this.readBytePC()];
			this.sync = false;
			this.op.fn();
			if (cb?.(this)) return;
		}
	}
	/**
	* Execute c cycles worth instructions, starting at the program
	* counter address.
	*/
	stepCycles(c) {
		const end = this.cycles + c;
		while (this.cycles < end) {
			this.sync = true;
			this.op = this.opary[this.readBytePC()];
			this.sync = false;
			this.op.fn();
		}
	}
	/**
	* Execute c cycles worth instructions, starting at the program
	* counter address.
	*
	* @param cb Callback after each instruction is executed
	*/
	stepCyclesDebug(c, cb) {
		const end = this.cycles + c;
		while (this.cycles < end) {
			this.sync = true;
			this.op = this.opary[this.readBytePC()];
			this.sync = false;
			this.op.fn();
			if (cb?.(this)) return;
		}
	}
	/**
	* Add a page handler. Page handlers cover specific pages in the
	* 6502 address space. The page handler defines its own memory range.
	* If multiple page handlers cover the same page range, the last
	* added will be used.
	*
	* @param pageHandler The page handler to add.
	*/
	addPageHandler(pageHandler) {
		for (let idx = pageHandler.start(); idx <= pageHandler.end(); idx++) this.memPages[idx] = pageHandler;
		if (isResettablePageHandler(pageHandler)) this.resetHandlers.push(pageHandler);
	}
	/**
	* Simulate a RESET signal. The CPU will update its register states
	* as appropriate and jump to the RESET vector.
	*/
	reset() {
		this.sr = flags.X;
		this.sp = 255;
		this.ar = 0;
		this.yr = 0;
		this.xr = 0;
		this.pc = this.readWord(loc.RESET);
		this.wait = false;
		this.stop = false;
		for (let idx = 0; idx < this.resetHandlers.length; idx++) this.resetHandlers[idx].reset();
	}
	/**
	* Interrupt Request. Simulates a IRQ signal. If interrupts
	* are enabled, will jump to the interrupt vector with the
	* stack populated as expected.
	*/
	irq() {
		if ((this.sr & flags.I) === 0) {
			this.pushWord(this.pc);
			this.pushByte(this.sr & ~flags.B);
			if (this.is65C02) this.setFlag(flags.D, false);
			this.setFlag(flags.I, true);
			this.pc = this.readWord(loc.BRK);
			this.wait = false;
		}
	}
	/**
	* Non-maskable Interrupt. Simulates a NMI signal. Will
	* jump to the interrupt vector with the stack populated as expected.
	*/
	nmi() {
		this.pushWord(this.pc);
		this.pushByte(this.sr & ~flags.B);
		if (this.is65C02) this.setFlag(flags.D, false);
		this.setFlag(flags.I, true);
		this.pc = this.readWord(loc.NMI);
		this.wait = false;
	}
	/**
	* Returns the current program counter register.
	*/
	getPC() {
		return this.pc;
	}
	/**
	* Set the current program counter register.
	*/
	setPC(pc) {
		this.pc = pc;
	}
	getDebugInfo() {
		const b = this.read(this.pc);
		const size = sizes[this.opary[b].mode];
		const cmd = new Array(size);
		cmd[0] = b;
		for (let idx = 1; idx < size; idx++) cmd[idx] = this.read(this.pc + idx);
		return {
			pc: this.pc,
			ar: this.ar,
			xr: this.xr,
			yr: this.yr,
			sr: this.sr,
			sp: this.sp,
			cmd
		};
	}
	/**
	* Returns the state of the SYNC signal. Indicates that the CPU
	* is fetching an instruction.
	*/
	getSync() {
		return this.sync;
	}
	/**
	* Returns the state of the STOP signal. True after a 65C02 `STP`
	* instruction is encountered. Cleared by reset.
	*/
	getStop() {
		return this.stop;
	}
	/**
	* Returns the state of the WAIT signal. True after a 65C02 `WAI`
	* instruction is encountered. Cleared by reset.
	*/
	getWait() {
		return this.wait;
	}
	/**
	* Returns the number of cycles processed since the CPU was instantiated.
	* Could potentially overflow.
	*/
	getCycles() {
		return this.cycles;
	}
	/**
	* Return the Instruction for the given byte value for the current
	* CPU flavor.
	*/
	getOpInfo(opcode) {
		return this.opary[opcode];
	}
	/**
	*
	* @returns The register state of the cpu.
	*/
	getState() {
		return {
			a: this.ar,
			x: this.xr,
			y: this.yr,
			s: this.sr,
			pc: this.pc,
			sp: this.sp,
			cycles: this.cycles
		};
	}
	setState(state) {
		this.ar = state.a;
		this.xr = state.x;
		this.yr = state.y;
		this.sr = state.s;
		this.pc = state.pc;
		this.sp = state.sp;
		this.cycles = state.cycles;
	}
	read(a, b) {
		let page, off;
		if (b !== void 0) {
			page = a & 255;
			off = b & 255;
		} else {
			page = a >> 8 & 255;
			off = a & 255;
		}
		return this.memPages[page].read(page, off);
	}
	write(a, b, c) {
		let page, off, val;
		if (c !== void 0) {
			page = a & 255;
			off = b & 255;
			val = c & 255;
		} else {
			page = a >> 8 & 255;
			off = a & 255;
			val = b & 255;
		}
		this.memPages[page].write(page, off, val);
	}
};
var alwaysBreak = (_info) => {
	return true;
};
/**
* Converts a status register value into the well known string version
* of the status register.
*
* @param sr Status register value
* @returns Status register value as a string
*/
var dumpStatusRegister = (sr) => [
	sr & flags.N ? "N" : "-",
	sr & flags.V ? "V" : "-",
	sr & flags.X ? "X" : "-",
	sr & flags.B ? "B" : "-",
	sr & flags.D ? "D" : "-",
	sr & flags.I ? "I" : "-",
	sr & flags.Z ? "Z" : "-",
	sr & flags.C ? "C" : "-"
].join("");
/**
* Class that can be used to wrap the CPU6502 object to provide
* additional support for stepping, tracing and setting breakpoints.
*/
var Debugger = class {
	constructor(cpu, container) {
		this.cpu = cpu;
		this.container = container;
		this.verbose = false;
		this.maxTrace = 256;
		this.trace = [];
		this.breakpoints = /* @__PURE__ */ new Map();
		this.symbols = {};
		this.break = () => {
			this.container.stop();
		};
		this.step = () => {
			this.cpu.step(() => {
				const info = this.cpu.getDebugInfo();
				debug(this.printDebugInfo(info));
				this.updateTrace(info);
			});
		};
		this.continue = () => {
			this.container.run();
		};
		this.runAt = (address) => {
			this.cpu.reset();
			this.cpu.setPC(address);
		};
		this.isRunning = () => this.container.isRunning();
		this.setVerbose = (verbose) => {
			this.verbose = verbose;
		};
		this.setMaxTrace = (maxTrace) => {
			this.maxTrace = maxTrace;
		};
		this.getTrace = (count) => {
			return this.trace.slice(count ? -count : void 0).map(this.printDebugInfo).join("\n");
		};
		this.printTrace = (count) => {
			debug(this.getTrace(count));
		};
		this.getStack = (size) => {
			const { sp } = this.cpu.getDebugInfo();
			const stack = [];
			let max = 255;
			let min = 0;
			if (size) {
				if (sp - 3 >= 255 - size) min = Math.max(255 - size + 1, 0);
				else {
					max = Math.min(sp + size - 4, 255);
					min = Math.max(sp - 3, 0);
				}
			}
			for (let addr = max; addr >= min; addr--) {
				const isSP = addr === sp ? "*" : " ";
				const addrStr = `$${toHex(256 + addr)}`;
				const valStr = toHex(this.cpu.read(1, addr));
				if (!size || sp + size > addr && addr > sp - size) stack.push(`${isSP} ${addrStr} ${valStr}`);
			}
			return stack.join("\n");
		};
		this.setBreakpoint = (addr, exp) => {
			this.breakpoints.set(addr, exp || alwaysBreak);
		};
		this.clearBreakpoint = (addr) => {
			this.breakpoints.delete(addr);
		};
		this.listBreakpoints = () => {
			for (const [addr, fn] of this.breakpoints.entries()) debug(toHex(addr, 4), fn);
		};
		this.addSymbols = (symbols) => {
			this.symbols = {
				...this.symbols,
				...symbols
			};
		};
		this.printDebugInfo = (info) => {
			const { pc, cmd } = info;
			const symbol = this.padWithSymbol(pc);
			return [
				toHex(pc, 4),
				"- ",
				symbol,
				this.dumpRegisters(info),
				" ",
				this.dumpRawOp(cmd),
				" ",
				this.dumpOp(pc, cmd)
			].join("");
		};
		this.dumpPC = (pc) => {
			const b = this.cpu.read(pc);
			const size = sizes[this.cpu.getOpInfo(b).mode];
			let result = toHex(pc, 4) + "- ";
			result += this.padWithSymbol(pc);
			const cmd = new Array(size);
			for (let idx = 0, jdx = pc; idx < size; idx++, jdx++) cmd[idx] = this.cpu.read(jdx);
			result += this.dumpRawOp(cmd) + " " + this.dumpOp(pc, cmd);
			return result;
		};
		this.dumpRegisters = (debugInfo) => {
			if (debugInfo === void 0) debugInfo = this.cpu.getDebugInfo();
			const { ar, xr, yr, sr, sp } = debugInfo;
			return [
				"A=" + toHex(ar),
				" X=" + toHex(xr),
				" Y=" + toHex(yr),
				" P=" + toHex(sr),
				" S=" + toHex(sp),
				" ",
				dumpStatusRegister(sr)
			].join("");
		};
		this.dumpPage = (start, end) => {
			let result = "";
			if (end === void 0) end = start;
			for (let page = start; page <= end; page++) for (let idx = 0; idx < 16; idx++) {
				result += toHex(page) + toHex(idx << 4) + ": ";
				for (let jdx = 0; jdx < 16; jdx++) {
					const b = this.cpu.read(page, idx * 16 + jdx);
					result += toHex(b) + " ";
				}
				result += "        ";
				for (let jdx = 0; jdx < 16; jdx++) {
					const b = this.cpu.read(page, idx * 16 + jdx) & 127;
					if (b >= 32 && b < 127) result += String.fromCharCode(b);
					else result += ".";
				}
				result += "\n";
			}
			return result;
		};
		this.list = (pc) => {
			const results = [];
			for (let idx = 0; idx < 20; idx++) {
				const b = this.cpu.read(pc);
				const op = this.cpu.getOpInfo(b);
				results.push(this.dumpPC(pc));
				pc += sizes[op.mode];
			}
			return results;
		};
	}
	stepCycles(cycles) {
		this.cpu.stepCyclesDebug(this.verbose ? 1 : cycles, () => {
			const info = this.cpu.getDebugInfo();
			if (this.breakpoints.get(info.pc)?.(info)) {
				debug("breakpoint", this.printDebugInfo(info));
				this.container.stop();
				return true;
			}
			if (this.verbose) debug(this.printDebugInfo(info));
			else this.updateTrace(info);
		});
	}
	/**
	* Reads a range of memory. Will wrap at memory limit.
	*
	* @param address Starting address to read memory
	* @param length Length of memory to read.
	* @returns Byte array containing memory
	*/
	getMemory(address, length) {
		const bytes = new Uint8Array(length);
		for (let idx = 0; idx < length; idx++) {
			address &= 65535;
			bytes[idx] = this.cpu.read(address++);
		}
		return bytes;
	}
	/**
	* Writes a range of memory. Will wrap at memory limit.
	*
	* @param address Starting address to write memory
	* @param bytes Data to write
	*/
	setMemory(address, bytes) {
		for (const byte of bytes) {
			address &= 65535;
			this.cpu.write(address++, byte);
		}
	}
	updateTrace(info) {
		this.trace.push(info);
		if (this.trace.length > this.maxTrace) this.trace.shift();
	}
	padWithSymbol(pc) {
		const padding = "          ";
		const symbol = this.symbols[pc];
		let result = padding;
		if (symbol) result = `${symbol}${padding.substring(symbol.length)}`;
		return result;
	}
	dumpRawOp(parts) {
		const result = new Array(4);
		for (let idx = 0; idx < 4; idx++) if (idx < parts.length) result[idx] = toHex(parts[idx]);
		else result[idx] = "  ";
		return result.join(" ");
	}
	dumpOp(pc, parts) {
		const op = this.cpu.getOpInfo(parts[0]);
		const lsb = parts[1];
		const msb = parts[2];
		const addr = msb << 8 | lsb;
		let val;
		let off;
		const toHexOrSymbol = (v, n) => this.symbols[v] || "$" + toHex(v, n);
		let result = op.name + " ";
		switch (op.mode) {
			case "implied": break;
			case "immediate":
				result += `#${toHexOrSymbol(lsb)}`;
				break;
			case "absolute":
				result += `${toHexOrSymbol(addr, 4)}`;
				break;
			case "zeroPage":
				result += `${toHexOrSymbol(lsb)}`;
				break;
			case "relative":
				off = lsb;
				if (off > 127) off -= 256;
				pc += off + 2;
				result += `${toHexOrSymbol(pc, 4)} (${off})`;
				break;
			case "absoluteX":
				result += `${toHexOrSymbol(addr, 4)},X`;
				break;
			case "absoluteY":
				result += `${toHexOrSymbol(addr, 4)},Y`;
				break;
			case "zeroPageX":
				result += `${toHexOrSymbol(lsb)},X`;
				break;
			case "zeroPageY":
				result += `${toHexOrSymbol(lsb)},Y`;
				break;
			case "absoluteIndirect":
				result += `(${toHexOrSymbol(addr, 4)})`;
				break;
			case "zeroPageXIndirect":
				result += `(${toHexOrSymbol(lsb)},X)`;
				break;
			case "zeroPageIndirectY":
				result += `(${toHexOrSymbol(lsb)},),Y`;
				break;
			case "accumulator":
				result += "A";
				break;
			case "zeroPageIndirect":
				result += `(${toHexOrSymbol(lsb)})`;
				break;
			case "absoluteXIndirect":
				result += `(${toHexOrSymbol(addr, 4)},X)`;
				break;
			case "zeroPage_relative":
				val = lsb;
				off = msb;
				if (off > 127) off -= 256;
				pc += off + 2;
				result += `${toHexOrSymbol(val)},${toHexOrSymbol(pc, 4)} (${off})`;
		}
		return result;
	}
};
//#endregion
export { flags as a, FLAVOR_ROCKWELL_65C02 as i, Debugger as n, FLAVOR_6502 as r, CPU6502 as t };
