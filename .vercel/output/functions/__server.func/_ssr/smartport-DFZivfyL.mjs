import { i as debug, o as toHex } from "./util-CcAkGmGv.mjs";
import { a as flags } from "./js-CtkL2_CI.mjs";
import { O as read2MGHeader, a as MemoryBlockDisk, g as create2MGFromBlockDisk, n as DRIVE_NUMBERS } from "./2mg-BRz4dUVv.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/smartport-DFZivfyL.js
var rom = new Uint8Array([
	162,
	32,
	162,
	0,
	162,
	3,
	162,
	0,
	32,
	88,
	255,
	186,
	189,
	0,
	1,
	141,
	248,
	7,
	10,
	10,
	10,
	10,
	168,
	185,
	128,
	192,
	74,
	176,
	17,
	165,
	0,
	208,
	10,
	165,
	1,
	205,
	248,
	7,
	208,
	3,
	76,
	186,
	250,
	76,
	0,
	224,
	162,
	1,
	134,
	66,
	202,
	134,
	70,
	134,
	71,
	134,
	68,
	162,
	8,
	134,
	69,
	173,
	248,
	7,
	72,
	72,
	169,
	71,
	72,
	184,
	80,
	11,
	104,
	10,
	10,
	10,
	10,
	170,
	76,
	1,
	8,
	0,
	0,
	76,
	89,
	199,
	76,
	89,
	199,
	165,
	0,
	72,
	169,
	96,
	133,
	0,
	32,
	0,
	0,
	186,
	189,
	0,
	1,
	10,
	10,
	10,
	10,
	170,
	104,
	133,
	0,
	189,
	129,
	192,
	48,
	251,
	72,
	189,
	130,
	192,
	72,
	189,
	131,
	192,
	72,
	189,
	132,
	192,
	106,
	122,
	250,
	104,
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
	215,
	83
]);
/**
* Returns a `Disk` object for a block volume with block-ordered data.
* @param options the disk image and options
*/
function createBlockDisk(fmt, options) {
	const { rawData, readOnly, name } = options;
	if (!rawData) throw new Error("Requires rawData");
	const blocks = [];
	let offset = 0;
	while (offset < rawData.byteLength) {
		blocks.push(new Uint8Array(rawData.slice(offset, offset + 512)));
		offset += 512;
	}
	return new MemoryBlockDisk(fmt, { name }, readOnly, blocks);
}
function readFileName(block, offset, nameLength, caseBits) {
	let name = "";
	if (!(caseBits & 32768)) caseBits = 0;
	if (nameLength === 0) nameLength = 15;
	for (let idx = 0; idx < nameLength; idx++) {
		caseBits <<= 1;
		const char = String.fromCharCode(block.getUint8(offset + idx) & 127);
		name += caseBits & 32768 ? char.toLowerCase() : char;
	}
	return name;
}
var VDH_OFFSETS = {
	PREV: 0,
	NEXT: 2,
	STORAGE_TYPE: 4,
	NAME_LENGTH: 4,
	VOLUME_NAME: 5,
	RESERVED_1: 20,
	CASE_BITS: 26,
	CREATION: 28,
	VERSION: 32,
	MIN_VERSION: 33,
	ACCESS: 34,
	ENTRY_LENGTH: 35,
	ENTRIES_PER_BLOCK: 36,
	FILE_COUNT: 37,
	BIT_MAP_POINTER: 39,
	TOTAL_BLOCKS: 41
};
var ID = "SMARTPORT.J.S";
var Address = class Address {
	cpu;
	lo;
	hi;
	constructor(cpu, a, b) {
		this.cpu = cpu;
		if (b === void 0) {
			this.lo = a & 255;
			this.hi = a >> 8;
		} else {
			this.lo = a;
			this.hi = b;
		}
	}
	loByte() {
		return this.lo;
	}
	hiByte() {
		return this.hi;
	}
	inc(val) {
		return new Address(this.cpu, (this.hi << 8 | this.lo) + val & 65535);
	}
	readByte() {
		return this.cpu.read(this.hi, this.lo);
	}
	readWord() {
		const readLo = this.readByte();
		return this.inc(1).readByte() << 8 | readLo;
	}
	readAddress() {
		const readLo = this.readByte();
		const readHi = this.inc(1).readByte();
		return new Address(this.cpu, readLo, readHi);
	}
	writeByte(val) {
		this.cpu.write(this.hi, this.lo, val);
	}
	writeWord(val) {
		this.writeByte(val & 255);
		this.inc(1).writeByte(val >> 8);
	}
	writeAddress(val) {
		this.writeByte(val.loByte());
		this.inc(1).writeByte(val.hiByte());
	}
	toString() {
		return "$" + toHex(this.hi) + toHex(this.lo);
	}
};
var COMMAND = 66;
var UNIT = 67;
var ADDRESS_LO = 68;
var BLOCK_LO = 70;
var OK = 0;
var NO_DEVICE_CONNECTED = 40;
var WRITE_PROTECTED = 43;
var DEVICE_OFFLINE = 47;
var BUSY = 128;
function asMemoryDisk(disk) {
	if (disk && typeof disk.readSync === "function") return disk;
	return null;
}
var DEVICE_TYPE_SCSI_HD = 7;
var SmartPort = class {
	cpu;
	callbacks;
	rom;
	disks = [];
	busy = [];
	busyTimeout = [];
	ext = [];
	metadata = [];
	statusByte = 128;
	xReg = 0;
	yReg = 0;
	constructor(cpu, callbacks, options) {
		this.cpu = cpu;
		this.callbacks = callbacks;
		if (options?.block) {
			const dumbPortRom = new Uint8Array(rom);
			dumbPortRom[7] = 60;
			this.rom = dumbPortRom;
			debug("DumbPort card");
		} else {
			debug("SmartPort card");
			this.rom = rom;
		}
	}
	debug(..._args) {}
	driveLight(driveNo) {
		if (!this.busy[driveNo]) {
			this.busy[driveNo] = true;
			this.callbacks?.driveLight(driveNo, true);
		}
		clearTimeout(this.busyTimeout[driveNo]);
		this.busyTimeout[driveNo] = setTimeout(() => {
			this.busy[driveNo] = false;
			this.callbacks?.driveLight(driveNo, false);
		}, 100);
	}
	async dumpBlock(driveNo, blockNumber) {
		let result = "";
		let b;
		let jdx;
		const block = await this.disks[driveNo].read(blockNumber);
		for (let idx = 0; idx < 32; idx++) {
			result += toHex(idx << 4, 4) + ": ";
			for (jdx = 0; jdx < 16; jdx++) {
				b = block[idx * 16 + jdx];
				if (jdx === 8) result += " ";
				result += toHex(b) + " ";
			}
			result += "        ";
			for (jdx = 0; jdx < 16; jdx++) {
				b = block[idx * 16 + jdx] & 127;
				if (jdx === 8) result += " ";
				if (b >= 32 && b < 127) result += String.fromCharCode(b);
				else result += ".";
			}
			result += "\n";
		}
		return result;
	}
	async getDeviceInfo(driveNo) {
		return this.getDeviceInfoSync(driveNo);
	}
	getDeviceInfoSync(driveNo) {
		const disk = this.disks[driveNo];
		const mem = asMemoryDisk(disk);
		if (mem) {
			const blocks = mem.blockCountSync();
			this.xReg = blocks & 255;
			this.yReg = blocks >> 8;
			return OK;
		}
		if (disk) return OK;
		return NO_DEVICE_CONNECTED;
	}
	async readBlock(driveNo, blockNUmber, buffer) {
		return this.readBlockSync(driveNo, blockNUmber, buffer);
	}
	readBlockSync(driveNo, blockNUmber, buffer) {
		this.debug(`read drive=${driveNo}`);
		this.debug(`read buffer=${buffer.toString()}`);
		this.debug(`read block=$${toHex(blockNUmber)}`);
		const mem = asMemoryDisk(this.disks[driveNo]);
		if (!mem) {
			debug("Drive", driveNo, "is empty");
			return DEVICE_OFFLINE;
		}
		if (!mem.blockCountSync()) {
			debug("Drive", driveNo, "is empty");
			return DEVICE_OFFLINE;
		}
		this.driveLight(driveNo);
		const block = mem.readSync(blockNUmber);
		if (!block) return DEVICE_OFFLINE;
		for (let idx = 0; idx < 512; idx++) {
			buffer.writeByte(block[idx] ?? 0);
			buffer = buffer.inc(1);
		}
		return OK;
	}
	async writeBlock(driveNo, blockNUmber, buffer) {
		return this.writeBlockSync(driveNo, blockNUmber, buffer);
	}
	writeBlockSync(driveNo, blockNUmber, buffer) {
		this.debug(`write drive=${driveNo}`);
		this.debug(`write buffer=${buffer.toString()}`);
		this.debug(`write block=$${toHex(blockNUmber)}`);
		const mem = asMemoryDisk(this.disks[driveNo]);
		if (!mem) {
			debug("Drive", driveNo, "is empty");
			return DEVICE_OFFLINE;
		}
		if (mem.readOnly) {
			debug("Drive", driveNo, "is write protected");
			return WRITE_PROTECTED;
		}
		this.driveLight(driveNo);
		const block = /* @__PURE__ */ new Uint8Array(512);
		for (let idx = 0; idx < 512; idx++) {
			block[idx] = buffer.readByte();
			buffer = buffer.inc(1);
		}
		mem.writeSync(blockNUmber, block);
		return 0;
	}
	async formatDevice(driveNo) {
		return this.formatDeviceSync(driveNo);
	}
	formatDeviceSync(driveNo) {
		const mem = asMemoryDisk(this.disks[driveNo]);
		if (!mem) {
			debug("Drive", driveNo, "is empty");
			return DEVICE_OFFLINE;
		}
		if (mem.readOnly) {
			debug("Drive", driveNo, "is write protected");
			return WRITE_PROTECTED;
		}
		const blockCount = mem.blockCountSync();
		for (let idx = 0; idx < blockCount; idx++) mem.writeSync(idx, /* @__PURE__ */ new Uint8Array(512));
		return 0;
	}
	handleAsync(fn) {
		this.xReg = 0;
		this.yReg = 0;
		try {
			const result = fn();
			if (typeof result === "number") {
				this.statusByte = result;
				return;
			}
			this.statusByte = BUSY;
			result.then((statusByte) => {
				this.statusByte = statusByte;
			}).catch((error) => {
				console.error(error);
				this.statusByte = DEVICE_OFFLINE;
			});
		} catch (error) {
			console.error(error);
			this.statusByte = DEVICE_OFFLINE;
		}
	}
	access(off, val) {
		let result = 0;
		const readMode = val === void 0;
		switch (off & 143) {
			case 128:
				if (readMode) {
					result = 0;
					for (let idx = 0; idx < this.disks.length; idx++) {
						result <<= 1;
						if (this.disks[idx]) result |= 1;
					}
				}
				break;
			case 129:
				result = this.statusByte;
				break;
			case 130:
				result = this.xReg;
				break;
			case 131:
				result = this.yReg;
				break;
			case 132: result = this.statusByte ? 1 : 0;
		}
		return result;
	}
	ioSwitch(off, val) {
		return this.access(off, val);
	}
	read(_page, off) {
		const state = this.cpu.getState();
		let cmd;
		let unit;
		let buffer;
		let block;
		const blockOff = this.rom[255];
		const smartOff = blockOff + 3;
		if (off === blockOff && this.cpu.getSync()) {
			this.debug("block device entry");
			cmd = this.cpu.read(0, COMMAND);
			unit = this.cpu.read(0, UNIT);
			const bufferAddr = new Address(this.cpu, ADDRESS_LO);
			const blockAddr = new Address(this.cpu, BLOCK_LO);
			const driveRaw = unit & 128 ? 2 : 1;
			const drive = this.disks[driveRaw] ? driveRaw : 1;
			const driveSlot = (unit & 112) >> 4;
			buffer = bufferAddr.readAddress();
			block = blockAddr.readWord();
			this.debug(`cmd=${cmd}`);
			this.debug("unit=$" + toHex(unit));
			this.debug(`slot=${driveSlot} drive=${drive}`);
			this.debug(`buffer=${buffer.toString()} block=$${toHex(block)}`);
			switch (cmd) {
				case 0:
					this.handleAsync(() => this.getDeviceInfoSync(drive));
					break;
				case 1:
					this.handleAsync(() => this.readBlockSync(drive, block, buffer));
					break;
				case 2:
					this.handleAsync(() => this.writeBlockSync(drive, block, buffer));
					break;
				case 3: this.handleAsync(() => this.formatDeviceSync(drive));
			}
		} else if (off === smartOff && this.cpu.getSync()) {
			this.debug("smartport entry");
			const stackAddr = new Address(this.cpu, state.sp + 1, 1);
			let blocks;
			const retVal = stackAddr.readAddress();
			this.debug(`return=${retVal.toString()}`);
			const cmdBlockAddr = retVal.inc(1);
			cmd = cmdBlockAddr.readByte();
			const cmdListAddr = cmdBlockAddr.inc(1).readAddress();
			this.debug(`cmd=${cmd}`);
			this.debug(`cmdListAddr=${cmdListAddr.toString()}`);
			stackAddr.writeAddress(retVal.inc(3));
			const parameterCount = cmdListAddr.readByte();
			unit = cmdListAddr.inc(1).readByte();
			const drive = unit ? 2 : 1;
			buffer = cmdListAddr.inc(2).readAddress();
			let status;
			this.debug(`parameterCount=${parameterCount}`);
			switch (cmd) {
				case 0:
					status = cmdListAddr.inc(4).readByte();
					this.debug(`info unit=${unit}`);
					this.debug(`info buffer=${buffer.toString()}`);
					this.debug(`info status=${status}`);
					switch (unit) {
						case 0:
							switch (status) {
								case 0: this.handleAsync(() => {
									buffer.writeByte(2);
									buffer.inc(1).writeByte(64);
									buffer.inc(2).writeByte(2);
									buffer.inc(3).writeByte(0);
									buffer.inc(4).writeByte(0);
									buffer.inc(5).writeByte(0);
									buffer.inc(6).writeByte(0);
									buffer.inc(7).writeByte(0);
									this.xReg = 8;
									this.yReg = 0;
									return 0;
								});
							}
							break;
						default: switch (status) {
							case 0:
								this.handleAsync(() => {
									const mem = asMemoryDisk(this.disks[unit]);
									blocks = mem ? mem.blockCountSync() : 0;
									buffer.writeByte(240);
									buffer.inc(1).writeByte(blocks & 255);
									buffer.inc(2).writeByte((blocks & 65280) >> 8);
									buffer.inc(3).writeByte((blocks & 16711680) >> 16);
									this.xReg = 4;
									this.yReg = 0;
									return 0;
								});
								break;
							case 3: this.handleAsync(() => {
								const mem = asMemoryDisk(this.disks[unit]);
								blocks = mem ? mem.blockCountSync() : 0;
								buffer.writeByte(240);
								buffer.inc(1).writeByte(blocks & 255);
								buffer.inc(2).writeByte((blocks & 65280) >> 8);
								buffer.inc(3).writeByte((blocks & 16711680) >> 16);
								buffer.inc(4).writeByte(13);
								for (let idx = 0; idx < 13; idx++) buffer.inc(5 + idx).writeByte(ID.charCodeAt(idx));
								buffer.inc(21).writeByte(DEVICE_TYPE_SCSI_HD);
								buffer.inc(22).writeByte(0);
								buffer.inc(23).writeWord(257);
								this.xReg = 24;
								this.yReg = 0;
								return OK;
							});
						}
					}
					state.a = 0;
					state.s &= ~flags.C;
					break;
				case 1:
					block = cmdListAddr.inc(4).readWord();
					this.handleAsync(() => this.readBlockSync(drive, block, buffer));
					break;
				case 2:
					block = cmdListAddr.inc(4).readWord();
					this.handleAsync(() => this.writeBlockSync(drive, block, buffer));
					break;
				case 3: this.handleAsync(() => this.formatDeviceSync(drive));
			}
		}
		this.cpu.setState(state);
		return this.rom[off];
	}
	write() {}
	async getState() {
		const disks = [];
		for (let diskNo = 0; diskNo < 2; diskNo++) {
			const diskState = async (disk) => {
				let result = null;
				if (disk) {
					const blocks = [];
					const blockCount = await disk.blockCount();
					for (let idx = 0; idx < blockCount; idx++) blocks.push(await disk.read(idx));
					result = {
						blocks,
						format: disk.format,
						disk: {
							readOnly: disk.readOnly,
							metadata: { ...disk.metadata }
						}
					};
				}
				return result;
			};
			const disk = this.disks[diskNo];
			disks[diskNo] = await diskState(disk);
		}
		return { disks };
	}
	async setState(state) {
		for (const idx of DRIVE_NUMBERS) {
			const diskState = state.disks[idx];
			if (diskState) {
				const disk = new MemoryBlockDisk(diskState.format, diskState.disk.metadata, diskState.disk.readOnly, diskState.blocks);
				await this.setBlockDisk(idx, disk);
			} else this.resetBlockDisk(idx);
		}
	}
	async setBlockDisk(driveNo, disk) {
		this.disks[driveNo] = disk;
		this.ext[driveNo] = disk.format;
		const name = await this.getVolumeName(driveNo) || disk.metadata.name;
		this.callbacks?.label(driveNo, name);
	}
	async getBlockDisk(driveNo) {
		return this.disks[driveNo];
	}
	resetBlockDisk(driveNo) {
		delete this.disks[driveNo];
	}
	async setBinary(driveNo, name, fmt, rawData) {
		let volume = 254;
		let readOnly = false;
		if (fmt === "2mg") {
			const header = read2MGHeader(rawData);
			this.metadata[driveNo] = header;
			const { bytes, offset } = header;
			volume = header.volume;
			readOnly = header.readOnly;
			rawData = rawData.slice(offset, offset + bytes);
		} else this.metadata[driveNo] = null;
		const options = {
			rawData,
			name,
			readOnly,
			volume
		};
		this.ext[driveNo] = fmt;
		this.disks[driveNo] = createBlockDisk(fmt, options);
		name = await this.getVolumeName(driveNo) || name;
		this.callbacks?.label(driveNo, name);
	}
	async getBinary(drive) {
		if (!this.disks[drive]) return null;
		const disk = this.disks[drive];
		const ext = this.disks[drive].format;
		const { readOnly } = disk;
		const { name } = disk.metadata;
		let data;
		if (ext === "2mg") data = await create2MGFromBlockDisk(this.metadata[drive], disk);
		else {
			const blockCount = await disk.blockCount();
			const byteArray = new Uint8Array(blockCount * 512);
			for (let idx = 0; idx < blockCount; idx++) {
				const block = await disk.read(idx);
				byteArray.set(block, idx * 512);
			}
			data = byteArray.buffer;
		}
		return {
			metadata: { name },
			ext,
			data,
			readOnly
		};
	}
	async getVolumeName(driveNo) {
		const vdhBlock = await this.disks[driveNo]?.read(2);
		if (!vdhBlock?.buffer) return null;
		const dataView = new DataView(vdhBlock.buffer);
		const nameLength = dataView.getUint8(VDH_OFFSETS.NAME_LENGTH) & 15;
		const caseBits = dataView.getUint16(VDH_OFFSETS.CASE_BITS, true);
		return readFileName(dataView, VDH_OFFSETS.VOLUME_NAME, nameLength, caseBits);
	}
};
//#endregion
export { SmartPort as default };
