import { i as debug, o as toHex } from "./util-CcAkGmGv.mjs";
import { C as isNibbleDisk, D as jsonEncode, E as jsonDecode, S as grabNibble, T as isWozDisk, _ as createDiskFrom2MG, b as createDiskFromProDOS, c as PROCESS_BINARY, d as _D13O, f as _DO, h as base64_encode, i as ENCODING_NIBBLE, k as readSector, l as PROCESS_JSON, m as base64_decode, n as DRIVE_NUMBERS, o as NIBBLE_FORMATS, p as _PO, r as ENCODING_BITSTREAM, s as NO_DISK, t as D13O, u as PROCESS_JSON_DISK, v as createDiskFromDOS, w as isNoFloppyDisk, x as explodeSector13, y as createDiskFromNibble } from "./2mg-BRz4dUVv.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/disk2-ZXrAwPxo.js
/**
* Replacement for `includes` on constant types that is also a type assertion.
*
* @example
* const SOME_VALUES = [1, 2, 'a'] as const;
* let n: number = 1;
* let r = includes(SOME_VALUES, n); // r === true, n is 1 | 2 | 'a'
* n = 5;
* r = includes(SOME_VALUES, n); // r === false, n is number
*/
function includes(a, v) {
	return a.includes(v);
}
/**
* Returns a `Disk` object from DOS 3.2-ordered image data.
* @param options the disk image and options
* @returns A nibblized disk
*/
function createDiskFromDOS13(options) {
	const { data, name, side, rawData, volume, readOnly } = options;
	const disk = {
		format: "d13",
		encoding: ENCODING_NIBBLE,
		metadata: {
			name,
			side
		},
		volume,
		readOnly,
		tracks: []
	};
	if (!data && !rawData) throw new Error("data or rawData required");
	for (let t = 0; t < 35; t++) {
		let track = [];
		for (let disk_sector = 0; disk_sector < 13; disk_sector++) {
			const physical_sector = D13O[disk_sector];
			let sector;
			if (rawData) {
				const off = (13 * t + physical_sector) * 256;
				sector = new Uint8Array(rawData.slice(off, off + 256));
			} else if (data) sector = data[t][physical_sector];
			else throw new Error("Requires data or rawData");
			track = track.concat(explodeSector13(volume, t, physical_sector, sector));
		}
		disk.tracks.push(new Uint8Array(track));
	}
	return disk;
}
var WOZ_HEADER_SIZE = 12;
var WOZ1_SIGNATURE = 828002135;
var WOZ2_SIGNATURE = 844779351;
var WOZ_INTEGRITY_CHECK = 168626943;
/**
* Converts a range of bytes from a DataView into an ASCII string
*
* @param data DataView containing string
* @param start start index of string
* @param end end index of string
* @returns ASCII string
*/
function stringFromBytes(data, start, end) {
	const byteArray = new Uint8Array(data.buffer.slice(data.byteOffset + start, data.byteOffset + end));
	return String.fromCharCode(...byteArray);
}
var InfoChunk = class {
	version;
	diskType;
	writeProtected;
	synchronized;
	cleaned;
	creator;
	sides = 0;
	bootSector = 0;
	bitTiming = 0;
	compatibleHardware = 0;
	requiredRAM = 0;
	largestTrack = 0;
	constructor(data) {
		this.version = data.getUint8(0);
		this.diskType = data.getUint8(1);
		this.writeProtected = data.getUint8(2);
		this.synchronized = data.getUint8(3);
		this.cleaned = data.getUint8(4);
		this.creator = stringFromBytes(data, 5, 37);
		if (this.version > 1) {
			this.sides = data.getUint8(37);
			this.bootSector = data.getUint8(38);
			this.bitTiming = data.getUint8(39);
			this.compatibleHardware = data.getUint16(40, true);
			this.requiredRAM = data.getUint16(42, true);
			this.largestTrack = data.getUint16(44, true);
		}
	}
};
var TMapChunk = class {
	trackMap;
	constructor(data) {
		this.trackMap = [];
		for (let idx = 0; idx < 160; idx++) this.trackMap.push(data.getUint8(idx));
	}
};
var WOZ_TRACK_SIZE = 6656;
var WOZ_TRACK_INFO_BITS = 6648;
var TrksChunk = class {
	rawTracks;
	tracks;
};
var TrksChunk1 = class extends TrksChunk {
	constructor(data) {
		super();
		this.rawTracks = [];
		this.tracks = [];
		for (let trackNo = 0, idx = 0; idx < data.byteLength; idx += WOZ_TRACK_SIZE, trackNo++) {
			let track = [];
			const rawTrack = [];
			const slice = data.buffer.slice(data.byteOffset + idx, data.byteOffset + idx + WOZ_TRACK_SIZE);
			const trackData = new Uint8Array(slice);
			const trackBitCount = new DataView(slice).getUint16(WOZ_TRACK_INFO_BITS, true);
			for (let jdx = 0; jdx < trackBitCount; jdx++) {
				const byteIndex = jdx >> 3;
				const bitIndex = 7 - (jdx & 7);
				rawTrack[jdx] = trackData[byteIndex] >> bitIndex & 1 ? 1 : 0;
			}
			track = [];
			let offset = 0;
			while (offset < rawTrack.length) {
				const result = grabNibble(rawTrack, offset);
				if (!result.nibble) break;
				track.push(result.nibble);
				offset = result.offset + 1;
			}
			this.tracks[trackNo] = new Uint8Array(track);
			this.rawTracks[trackNo] = new Uint8Array(rawTrack);
		}
	}
};
var TrksChunk2 = class extends TrksChunk {
	trks;
	constructor(data) {
		super();
		let trackNo;
		this.trks = [];
		for (trackNo = 0; trackNo < 160; trackNo++) {
			const startBlock = data.getUint16(trackNo * 8, true);
			const blockCount = data.getUint16(trackNo * 8 + 2, true);
			const bitCount = data.getUint32(trackNo * 8 + 4, true);
			if (bitCount === 0) break;
			this.trks.push({
				startBlock,
				blockCount,
				bitCount
			});
		}
		this.tracks = [];
		this.rawTracks = [];
		const bits = data.buffer;
		for (trackNo = 0; trackNo < this.trks.length; trackNo++) {
			const trk = this.trks[trackNo];
			let track = [];
			const rawTrack = [];
			const start = trk.startBlock * 512;
			const end = start + trk.blockCount * 512;
			const slice = bits.slice(start, end);
			const trackData = new Uint8Array(slice);
			if (trackNo === 0) {}
			for (let jdx = 0; jdx < trk.bitCount; jdx++) {
				const byteIndex = jdx >> 3;
				const bitIndex = 7 - (jdx & 7);
				rawTrack[jdx] = trackData[byteIndex] >> bitIndex & 1 ? 1 : 0;
			}
			track = [];
			let offset = 0;
			while (offset < rawTrack.length) {
				const result = grabNibble(rawTrack, offset);
				if (!result.nibble) break;
				track.push(result.nibble);
				offset = result.offset + 1;
			}
			this.tracks[trackNo] = new Uint8Array(track);
			this.rawTracks[trackNo] = new Uint8Array(rawTrack);
		}
	}
};
var MetaChunk = class {
	values;
	constructor(data) {
		const parts = stringFromBytes(data, 0, data.byteLength).split("\n");
		this.values = parts.reduce(function(acc, part) {
			const subParts = part.split("	");
			acc[subParts[0]] = subParts[1];
			return acc;
		}, {});
	}
};
/**
* Returns a `Disk` object from Woz image data.
* @param options the disk image and options
* @returns A bitstream disk
*/
function createDiskFromWoz(options) {
	const { rawData } = options;
	if (!rawData) throw new Error("Requires rawData");
	const dv = new DataView(rawData, 0);
	let dvOffset = 0;
	let wozVersion;
	const chunks = {};
	function readHeader() {
		switch (dv.getUint32(0, true)) {
			case WOZ1_SIGNATURE:
				wozVersion = 1;
				break;
			case WOZ2_SIGNATURE:
				wozVersion = 2;
				break;
			default: return false;
		}
		if (dv.getUint32(4, true) !== WOZ_INTEGRITY_CHECK) return false;
		return true;
	}
	function readChunk() {
		if (dvOffset >= dv.byteLength) return null;
		const type = dv.getUint32(dvOffset, true);
		const size = dv.getUint32(dvOffset + 4, true);
		const data = new DataView(dv.buffer, dvOffset + 8, size);
		dvOffset += size + 8;
		return {
			type,
			size,
			data
		};
	}
	if (readHeader()) {
		dvOffset = WOZ_HEADER_SIZE;
		let chunk = readChunk();
		while (chunk) {
			switch (chunk.type) {
				case 1330007625:
					chunks.info = new InfoChunk(chunk.data);
					break;
				case 1346456916:
					chunks.tmap = new TMapChunk(chunk.data);
					break;
				case 1397445204:
					if (wozVersion === 1) chunks.trks = new TrksChunk1(chunk.data);
					else chunks.trks = new TrksChunk2(chunk.data);
					break;
				case 1096041805:
					chunks.meta = new MetaChunk(chunk.data);
					break;
				case 1414091351: break;
				default: debug("Unsupported chunk", toHex(chunk.type, 8));
			}
			chunk = readChunk();
		}
	} else debug("Invalid woz header");
	const { meta, tmap, trks, info } = chunks;
	return {
		encoding: ENCODING_BITSTREAM,
		format: "woz",
		trackMap: tmap?.trackMap || [],
		rawTracks: trks?.rawTracks || [],
		readOnly: true,
		metadata: {
			name: meta?.values["title"] || options.name,
			side: meta?.values["side_name"] || meta?.values["side"]
		},
		info
	};
}
function createDisk(fmt, options) {
	let disk = null;
	switch (fmt) {
		case "2mg":
			disk = createDiskFrom2MG(options);
			break;
		case "d13":
			disk = createDiskFromDOS13(options);
			break;
		case "do":
		case "dsk":
			disk = createDiskFromDOS(options);
			break;
		case "nib":
			disk = createDiskFromNibble(options);
			break;
		case "po":
			disk = createDiskFromProDOS(options);
			break;
		case "woz": disk = createDiskFromWoz(options);
	}
	return disk;
}
/** Creates a NibbleDisk from JSON */
function createDiskFromJsonDisk(disk) {
	const fmt = disk.type;
	const readOnly = disk.readOnly;
	const name = disk.name;
	const side = disk.disk;
	if (includes(NIBBLE_FORMATS, fmt)) {
		let trackData;
		if (disk.encoding === "base64") {
			trackData = [];
			for (let t = 0; t < disk.data.length; t++) {
				trackData[t] = [];
				if (disk.type === "nib") trackData[t][0] = base64_decode(disk.data[t]);
				else for (let s = 0; s < disk.data[t].length; s++) trackData[t][s] = base64_decode(disk.data[t][s]);
			}
		} else trackData = disk.data;
		return createDisk(fmt, {
			volume: disk.volume || 254,
			readOnly,
			name,
			side,
			data: trackData
		});
	} else return null;
}
var BOOTSTRAP_ROM_16 = new Uint8Array([
	162,
	32,
	160,
	0,
	162,
	3,
	134,
	60,
	138,
	10,
	36,
	60,
	240,
	16,
	5,
	60,
	73,
	255,
	41,
	126,
	176,
	8,
	74,
	208,
	251,
	152,
	157,
	86,
	3,
	200,
	232,
	16,
	229,
	32,
	88,
	255,
	186,
	189,
	0,
	1,
	10,
	10,
	10,
	10,
	133,
	43,
	170,
	189,
	142,
	192,
	189,
	140,
	192,
	189,
	138,
	192,
	189,
	137,
	192,
	160,
	80,
	189,
	128,
	192,
	152,
	41,
	3,
	10,
	5,
	43,
	170,
	189,
	129,
	192,
	169,
	86,
	32,
	168,
	252,
	136,
	16,
	235,
	133,
	38,
	133,
	61,
	133,
	65,
	169,
	8,
	133,
	39,
	24,
	8,
	189,
	140,
	192,
	16,
	251,
	73,
	213,
	208,
	247,
	189,
	140,
	192,
	16,
	251,
	201,
	170,
	208,
	243,
	234,
	189,
	140,
	192,
	16,
	251,
	201,
	150,
	240,
	9,
	40,
	144,
	223,
	73,
	173,
	240,
	37,
	208,
	217,
	160,
	3,
	133,
	64,
	189,
	140,
	192,
	16,
	251,
	42,
	133,
	60,
	189,
	140,
	192,
	16,
	251,
	37,
	60,
	136,
	208,
	236,
	40,
	197,
	61,
	208,
	190,
	165,
	64,
	197,
	65,
	208,
	184,
	176,
	183,
	160,
	86,
	132,
	60,
	188,
	140,
	192,
	16,
	251,
	89,
	214,
	2,
	164,
	60,
	136,
	153,
	0,
	3,
	208,
	238,
	132,
	60,
	188,
	140,
	192,
	16,
	251,
	89,
	214,
	2,
	164,
	60,
	145,
	38,
	200,
	208,
	239,
	188,
	140,
	192,
	16,
	251,
	89,
	214,
	2,
	208,
	135,
	160,
	0,
	162,
	86,
	202,
	48,
	251,
	177,
	38,
	94,
	0,
	3,
	42,
	94,
	0,
	3,
	42,
	145,
	38,
	200,
	208,
	238,
	230,
	39,
	230,
	61,
	165,
	61,
	205,
	0,
	8,
	166,
	43,
	144,
	219,
	76,
	1,
	8,
	0,
	0,
	0,
	0,
	0
]);
var BOOTSTRAP_ROM_13 = new Uint8Array([
	162,
	32,
	160,
	0,
	169,
	3,
	133,
	60,
	24,
	136,
	152,
	36,
	60,
	240,
	245,
	38,
	60,
	144,
	248,
	192,
	213,
	240,
	237,
	202,
	138,
	153,
	0,
	8,
	208,
	230,
	32,
	88,
	255,
	186,
	189,
	0,
	1,
	72,
	10,
	10,
	10,
	10,
	133,
	43,
	170,
	169,
	208,
	72,
	189,
	142,
	192,
	189,
	140,
	192,
	189,
	138,
	192,
	189,
	137,
	192,
	160,
	80,
	189,
	128,
	192,
	152,
	41,
	3,
	10,
	5,
	43,
	170,
	189,
	129,
	192,
	169,
	86,
	32,
	168,
	252,
	136,
	16,
	235,
	169,
	3,
	133,
	39,
	169,
	0,
	133,
	38,
	133,
	61,
	24,
	8,
	189,
	140,
	192,
	16,
	251,
	73,
	213,
	208,
	247,
	189,
	140,
	192,
	16,
	251,
	201,
	170,
	208,
	243,
	234,
	189,
	140,
	192,
	16,
	251,
	201,
	181,
	240,
	9,
	40,
	144,
	223,
	73,
	173,
	240,
	31,
	208,
	217,
	160,
	3,
	132,
	42,
	189,
	140,
	192,
	16,
	251,
	42,
	133,
	60,
	189,
	140,
	192,
	16,
	251,
	37,
	60,
	136,
	208,
	238,
	40,
	197,
	61,
	208,
	190,
	176,
	189,
	160,
	154,
	132,
	60,
	188,
	140,
	192,
	16,
	251,
	89,
	0,
	8,
	164,
	60,
	136,
	153,
	0,
	8,
	208,
	238,
	132,
	60,
	188,
	140,
	192,
	16,
	251,
	89,
	0,
	8,
	164,
	60,
	145,
	38,
	200,
	208,
	239,
	188,
	140,
	192,
	16,
	251,
	89,
	0,
	8,
	208,
	141,
	96,
	168,
	162,
	0,
	185,
	0,
	8,
	74,
	62,
	204,
	3,
	74,
	62,
	153,
	3,
	133,
	60,
	177,
	38,
	10,
	10,
	10,
	5,
	60,
	145,
	38,
	200,
	232,
	224,
	51,
	208,
	228,
	198,
	42,
	208,
	222,
	204,
	0,
	3,
	208,
	3,
	76,
	1,
	3,
	76,
	45,
	255,
	255
]);
/**
* Driver for empty drives. This implementation does nothing except keep
* the head clamped between tracks 0 and 34.
*/
var EmptyDriver = class {
	drive;
	constructor(drive) {
		this.drive = drive;
	}
	tick() {}
	onQ6Low() {}
	onQ6High(_readMode) {}
	onDriveOn() {}
	onDriveOff() {}
	clampTrack() {
		if (this.drive.track < 0) this.drive.track = 0;
		if (this.drive.track > 34) this.drive.track = 34;
	}
	getState() {
		return {};
	}
	setState(_state) {}
};
/**
* Common logic for both `NibbleDiskDriver` and `WozDiskDriver`.
*/
var BaseDiskDriver = class {
	driveNo;
	drive;
	disk;
	controller;
	constructor(driveNo, drive, disk, controller) {
		this.driveNo = driveNo;
		this.drive = drive;
		this.disk = disk;
		this.controller = controller;
	}
	debug(..._args) {}
	/** Returns `true` if the controller is on and this drive is selected. */
	isOn() {
		return this.controller.on && this.controller.driveNo === this.driveNo;
	}
	/** Returns `true` if the drive's write protect switch is enabled. */
	isWriteProtected() {
		return this.drive.readOnly;
	}
};
var NibbleDiskDriver = class extends BaseDiskDriver {
	disk;
	onDirty;
	/**
	* When `1`, the next nibble will be available for read; when `0`,
	* the card is pretending to wait for data to be shifted in by the
	* sequencer.
	*/
	skip = 0;
	/** Number of nibbles reads since the drive was turned on. */
	nibbleCount = 0;
	constructor(driveNo, drive, disk, controller, onDirty) {
		super(driveNo, drive, disk, controller);
		this.disk = disk;
		this.onDirty = onDirty;
	}
	tick() {}
	onQ6Low() {
		const drive = this.drive;
		const disk = this.disk;
		if (this.isOn() && (this.skip || this.controller.q7)) {
			const track = disk.tracks[drive.track >> 2];
			if (track && track.length) {
				if (drive.head >= track.length) drive.head = 0;
				if (this.controller.q7) {
					if (!disk.readOnly) {
						track[drive.head] = this.controller.bus;
						drive.dirty = true;
						this.onDirty();
					}
				} else {
					this.controller.latch = track[drive.head];
					this.nibbleCount++;
				}
				++drive.head;
			}
		} else this.controller.latch = 0;
		this.skip = ++this.skip % 2;
	}
	onQ6High(readMode) {
		const drive = this.drive;
		if (readMode && !this.controller.q7) {
			if (drive.readOnly) {
				this.controller.latch = 255;
				this.debug("Setting readOnly");
			} else {
				this.controller.latch >>= 1;
				this.debug("Clearing readOnly");
			}
		}
	}
	onDriveOn() {
		this.nibbleCount = 0;
	}
	onDriveOff() {
		this.debug("nibbles read", this.nibbleCount);
	}
	clampTrack() {
		if (this.drive.track < 0) this.drive.track = 0;
		const lastTrack = 139;
		if (this.drive.track > lastTrack) this.drive.track = lastTrack;
	}
	getState() {
		const { skip, nibbleCount } = this;
		return {
			skip,
			nibbleCount
		};
	}
	setState(state) {
		this.skip = state.skip;
		this.nibbleCount = state.nibbleCount;
	}
};
var WozDiskDriver = class extends BaseDiskDriver {
	disk;
	onDirty;
	io;
	/** Logic state sequencer clock cycle. */
	clock;
	/** Logic state sequencer state. */
	state;
	/** Current CPU cycle count. */
	lastCycles = 0;
	/**
	* Number of zeros read in a row. The Disk ][ can only read two zeros in a
	* row reliably; above that and the drive starts reporting garbage.  See
	* "Freaking Out Like a MC3470" in the WOZ spec.
	*/
	zeros = 0;
	constructor(driveNo, drive, disk, controller, onDirty, io) {
		super(driveNo, drive, disk, controller);
		this.disk = disk;
		this.onDirty = onDirty;
		this.io = io;
		this.state = 2;
		this.clock = 0;
	}
	onDriveOn() {
		this.lastCycles = this.io.cycles();
	}
	onDriveOff() {}
	/**
	* Spin the disk under the read/write head for WOZ images.
	*
	* This implementation emulates every clock cycle of the 2 MHz
	* sequencer since the last time it was called in order to
	* determine the current state. Because this is called on
	* every access to the softswitches, the data in the latch
	* will be correct on every read.
	*
	* The emulation of the disk makes a few simplifying assumptions:
	*
	* *   The motor turns on instantly.
	* *   The head moves tracks instantly.
	* *   The length (in bits) of each track of the WOZ image
	*     represents one full rotation of the disk and that each
	*     bit is evenly spaced.
	* *   Writing will not change the track length. This means
	*     that short tracks stay short.
	* *   The read head picks up the next bit when the sequencer
	*     clock === 4.
	* *   Head position X on track T is equivalent to head position
	*     X on track T′. (This is not the recommendation in the WOZ
	*     spec.)
	* *   Unspecified tracks contain a single zero bit. (A very
	*     short track, indeed!)
	* *   Two zero bits are sufficient to cause the MC3470 to freak
	*     out. When freaking out, it returns 0 and 1 with equal
	*     probability.
	* *   Any softswitch changes happen before `moveHead`. This is
	*     important because it means that if the clock is ever
	*     advanced more than one cycle between calls, the
	*     softswitch changes will appear to happen at the very
	*     beginning, not just before the last cycle.
	*/
	moveHead() {
		const cycles = this.io.cycles();
		let workCycles = (cycles - this.lastCycles) * 2;
		this.lastCycles = cycles;
		const drive = this.drive;
		const disk = this.disk;
		const controller = this.controller;
		const track = disk.rawTracks[disk.trackMap[drive.track]] || [0];
		while (workCycles-- > 0) {
			let pulse = 0;
			if (this.clock === 4) {
				pulse = track[drive.head];
				if (!pulse) {
					if (++this.zeros > 2) pulse = Math.random() >= .5 ? 1 : 0;
				} else this.zeros = 0;
			}
			let idx = 0;
			idx |= pulse ? 0 : 1;
			idx |= controller.latch & 128 ? 2 : 0;
			idx |= controller.q6 ? 4 : 0;
			idx |= controller.q7 ? 8 : 0;
			idx |= this.state << 4;
			const command = SEQUENCER_ROM[controller.sectors][idx];
			this.debug(`clock: ${this.clock} state: ${toHex(this.state)} pulse: ${pulse} command: ${toHex(command)} q6: ${controller.q6} latch: ${toHex(controller.latch)}`);
			switch (command & 15) {
				case 0:
					controller.latch = 0;
					break;
				case 8: break;
				case 9:
					controller.latch = controller.latch << 1 & 255;
					break;
				case 10:
					controller.latch >>= 1;
					if (this.isWriteProtected()) controller.latch |= 128;
					break;
				case 11:
					controller.latch = controller.bus;
					this.debug("Loading", toHex(controller.latch), "from bus");
					break;
				case 13:
					controller.latch = (controller.latch << 1 | 1) & 255;
					break;
				default: this.debug(`unknown command: ${toHex(command & 15)}`);
			}
			this.state = command >> 4 & 15;
			if (this.clock === 4) {
				if (this.isOn()) {
					if (controller.q7) {
						track[drive.head] = this.state & 8 ? 1 : 0;
						this.debug("Wrote", this.state & 8 ? 1 : 0);
						drive.dirty = true;
						this.onDirty();
					}
					if (++drive.head >= track.length) drive.head = 0;
				}
			}
			if (++this.clock > 7) this.clock = 0;
		}
	}
	tick() {
		this.moveHead();
	}
	onQ6High(_readMode) {}
	onQ6Low() {}
	clampTrack() {
		if (this.drive.track < 0) this.drive.track = 0;
		const lastTrack = this.disk.trackMap.length - 1;
		if (this.drive.track > lastTrack) this.drive.track = lastTrack;
	}
	getState() {
		const { clock, state, lastCycles, zeros } = this;
		return {
			clock,
			state,
			lastCycles,
			zeros
		};
	}
	setState(state) {
		this.clock = state.clock;
		this.state = state.state;
		this.lastCycles = state.lastCycles;
		this.zeros = state.zeros;
	}
};
/** Softswitch locations */
var LOC = {
	PHASE0OFF: 128,
	PHASE0ON: 129,
	PHASE1OFF: 130,
	PHASE1ON: 131,
	PHASE2OFF: 132,
	PHASE2ON: 133,
	PHASE3OFF: 134,
	PHASE3ON: 135,
	DRIVEOFF: 136,
	DRIVEON: 137,
	DRIVE1: 138,
	DRIVE2: 139,
	DRIVEREAD: 140,
	DRIVEWRITE: 141,
	DRIVEREADMODE: 142,
	DRIVEWRITEMODE: 143
};
/** Contents of the P6 sequencer ROM. */
var SEQUENCER_ROM = {
	13: [
		216,
		24,
		24,
		8,
		10,
		10,
		10,
		10,
		24,
		24,
		24,
		24,
		24,
		24,
		24,
		24,
		216,
		45,
		40,
		40,
		10,
		10,
		10,
		10,
		40,
		40,
		40,
		40,
		40,
		40,
		40,
		40,
		216,
		56,
		56,
		56,
		10,
		10,
		10,
		10,
		57,
		57,
		57,
		57,
		59,
		59,
		59,
		59,
		216,
		72,
		216,
		72,
		10,
		10,
		10,
		10,
		72,
		72,
		72,
		72,
		72,
		72,
		72,
		72,
		216,
		88,
		216,
		88,
		10,
		10,
		10,
		10,
		88,
		88,
		88,
		88,
		88,
		88,
		88,
		88,
		216,
		104,
		216,
		104,
		10,
		10,
		10,
		10,
		104,
		104,
		104,
		104,
		104,
		104,
		104,
		104,
		216,
		120,
		216,
		120,
		10,
		10,
		10,
		10,
		120,
		120,
		120,
		120,
		120,
		120,
		120,
		120,
		216,
		136,
		216,
		136,
		10,
		10,
		10,
		10,
		8,
		8,
		136,
		136,
		8,
		8,
		136,
		136,
		216,
		152,
		216,
		152,
		10,
		10,
		10,
		10,
		152,
		152,
		152,
		152,
		152,
		152,
		152,
		152,
		216,
		9,
		216,
		168,
		10,
		10,
		10,
		10,
		168,
		168,
		168,
		168,
		168,
		168,
		168,
		168,
		205,
		189,
		216,
		184,
		10,
		10,
		10,
		10,
		185,
		185,
		185,
		185,
		187,
		187,
		187,
		187,
		217,
		57,
		216,
		200,
		10,
		10,
		10,
		10,
		200,
		200,
		200,
		200,
		200,
		200,
		200,
		200,
		217,
		217,
		216,
		160,
		10,
		10,
		10,
		10,
		216,
		216,
		216,
		216,
		216,
		216,
		216,
		216,
		29,
		13,
		232,
		232,
		10,
		10,
		10,
		10,
		232,
		232,
		232,
		232,
		232,
		232,
		232,
		232,
		253,
		253,
		248,
		248,
		10,
		10,
		10,
		10,
		248,
		248,
		248,
		248,
		248,
		248,
		248,
		248,
		221,
		77,
		224,
		224,
		10,
		10,
		10,
		10,
		136,
		136,
		8,
		8,
		136,
		136,
		8,
		8
	],
	16: [
		24,
		24,
		24,
		24,
		10,
		10,
		10,
		10,
		24,
		24,
		24,
		24,
		24,
		24,
		24,
		24,
		45,
		45,
		56,
		56,
		10,
		10,
		10,
		10,
		40,
		40,
		40,
		40,
		40,
		40,
		40,
		40,
		216,
		56,
		8,
		40,
		10,
		10,
		10,
		10,
		57,
		57,
		57,
		57,
		59,
		59,
		59,
		59,
		216,
		72,
		72,
		72,
		10,
		10,
		10,
		10,
		72,
		72,
		72,
		72,
		72,
		72,
		72,
		72,
		216,
		88,
		216,
		88,
		10,
		10,
		10,
		10,
		88,
		88,
		88,
		88,
		88,
		88,
		88,
		88,
		216,
		104,
		216,
		104,
		10,
		10,
		10,
		10,
		104,
		104,
		104,
		104,
		104,
		104,
		104,
		104,
		216,
		120,
		216,
		120,
		10,
		10,
		10,
		10,
		120,
		120,
		120,
		120,
		120,
		120,
		120,
		120,
		216,
		136,
		216,
		136,
		10,
		10,
		10,
		10,
		8,
		8,
		136,
		136,
		8,
		8,
		136,
		136,
		216,
		152,
		216,
		152,
		10,
		10,
		10,
		10,
		152,
		152,
		152,
		152,
		152,
		152,
		152,
		152,
		216,
		41,
		216,
		168,
		10,
		10,
		10,
		10,
		168,
		168,
		168,
		168,
		168,
		168,
		168,
		168,
		205,
		189,
		216,
		184,
		10,
		10,
		10,
		10,
		185,
		185,
		185,
		185,
		187,
		187,
		187,
		187,
		217,
		89,
		216,
		200,
		10,
		10,
		10,
		10,
		200,
		200,
		200,
		200,
		200,
		200,
		200,
		200,
		217,
		217,
		216,
		160,
		10,
		10,
		10,
		10,
		216,
		216,
		216,
		216,
		216,
		216,
		216,
		216,
		216,
		8,
		232,
		232,
		10,
		10,
		10,
		10,
		232,
		232,
		232,
		232,
		232,
		232,
		232,
		232,
		253,
		253,
		248,
		248,
		10,
		10,
		10,
		10,
		248,
		248,
		248,
		248,
		248,
		248,
		248,
		248,
		221,
		77,
		224,
		224,
		10,
		10,
		10,
		10,
		136,
		136,
		8,
		8,
		136,
		136,
		8,
		8
	]
};
/** Contents of the P5 ROM at 0xCnXX. */
var BOOTSTRAP_ROM = {
	13: BOOTSTRAP_ROM_13,
	16: BOOTSTRAP_ROM_16
};
/**
* How far the head moves, in quarter tracks, when in phase X and phase Y is
* activated. For example, if in phase 0 (top row), turning on phase 3 would
* step backwards a quarter track while turning on phase 2 would step forwards
* a half track.
*
* Note that this emulation is highly simplified as it only takes into account
* the order that coils are powered on and ignores when they are powered off.
* The actual hardware allows for multiple coils to be powered at the same time
* providing different levels of torque on the head arm. Along with that, the
* RWTS uses a complex delay system to drive the coils faster based on expected
* head momentum.
*
* Examining the https://computerhistory.org/blog/apple-ii-dos-source-code/,
* one finds the SEEK routine on line 4831 of `appdos31.lst`. It uses `ONTABLE`
* and `OFFTABLE` (each 12 bytes) to know exactly how many microseconds to
* power on/off each coil as the head accelerates. At the end, the final coil
* is left powered on 9.5 milliseconds to ensure the head has settled.
*
* https://embeddedmicro.weebly.com/apple-2iie.html shows traces of the boot
* seek (which is slightly different) and a regular seek.
*/
var PHASE_DELTA = [
	[
		0,
		1,
		2,
		-1
	],
	[
		-1,
		0,
		1,
		2
	],
	[
		-2,
		-1,
		0,
		1
	],
	[
		1,
		-2,
		-1,
		0
	]
];
function getDiskState(disk) {
	if (isNoFloppyDisk(disk)) {
		const { encoding, metadata, readOnly } = disk;
		return {
			encoding,
			metadata: { ...metadata },
			readOnly
		};
	}
	if (isNibbleDisk(disk)) {
		const { format, encoding, metadata, readOnly, volume, tracks } = disk;
		const result = {
			format,
			encoding,
			volume,
			tracks: [],
			readOnly,
			metadata: { ...metadata }
		};
		for (let idx = 0; idx < tracks.length; idx++) result.tracks.push(new Uint8Array(tracks[idx]));
		return result;
	}
	if (isWozDisk(disk)) {
		const { format, encoding, metadata, readOnly, trackMap, rawTracks } = disk;
		const result = {
			format,
			encoding,
			readOnly,
			trackMap: [],
			rawTracks: [],
			metadata: { ...metadata },
			info: disk.info
		};
		result.trackMap = [...trackMap];
		for (let idx = 0; idx < rawTracks.length; idx++) result.rawTracks.push(new Uint8Array(rawTracks[idx]));
		return result;
	}
	throw new Error("Unknown drive state");
}
/**
* Emulates the 16-sector and 13-sector versions of the Disk ][ drive and controller.
*/
var DiskII = class {
	io;
	callbacks;
	sectors;
	drives = {
		1: {
			track: 0,
			head: 0,
			phase: 0,
			readOnly: false,
			dirty: false
		},
		2: {
			track: 0,
			head: 0,
			phase: 0,
			readOnly: false,
			dirty: false
		}
	};
	disks = {
		1: {
			encoding: NO_DISK,
			readOnly: false,
			metadata: { name: "Disk 1" }
		},
		2: {
			encoding: NO_DISK,
			readOnly: false,
			metadata: { name: "Disk 2" }
		}
	};
	driver = {
		1: new EmptyDriver(this.drives[1]),
		2: new EmptyDriver(this.drives[2])
	};
	state;
	/** Drive off timeout id or null. */
	offTimeout = null;
	/** Current drive object. Must only be set by `updateActiveDrive()`. */
	curDrive;
	/** Current driver object. Must only be set by `updateAcivetDrive()`. */
	curDriver;
	worker;
	/** Builds a new Disk ][ card. */
	constructor(io, callbacks, sectors = 16) {
		this.io = io;
		this.callbacks = callbacks;
		this.sectors = sectors;
		this.debug("Disk ][");
		this.state = {
			sectors,
			bus: 0,
			latch: 0,
			driveNo: 1,
			on: false,
			q6: false,
			q7: false,
			clock: 0,
			state: 2
		};
		this.updateActiveDrive();
		this.initWorker();
	}
	/** Updates the active drive based on the controller state. */
	updateActiveDrive() {
		this.curDrive = this.drives[this.state.driveNo];
		this.curDriver = this.driver[this.state.driveNo];
	}
	debug(..._args) {}
	head() {
		return this.curDrive.head;
	}
	/**
	* Sets whether the head positioning stepper motor coil for the given
	* phase is on or off. Normally, the motor must be stepped two phases
	* per track. Half tracks can be written by stepping only once; quarter
	* tracks by activating two neighboring coils at once.
	*/
	setPhase(phase, on) {
		if (!this.state.on) {
			this.debug(`ignoring phase ${phase}${on ? " on" : " off"}`);
			return;
		}
		this.debug(`phase ${phase}${on ? " on" : " off"}`);
		if (on) {
			this.curDrive.track += PHASE_DELTA[this.curDrive.phase][phase] * 2;
			this.curDrive.phase = phase;
		}
		this.curDriver.clampTrack();
	}
	access(off, val) {
		const state = this.state;
		let result = 0;
		const readMode = val === void 0;
		switch (off & 143) {
			case LOC.PHASE0OFF:
				this.setPhase(0, false);
				break;
			case LOC.PHASE0ON:
				this.setPhase(0, true);
				break;
			case LOC.PHASE1OFF:
				this.setPhase(1, false);
				break;
			case LOC.PHASE1ON:
				this.setPhase(1, true);
				break;
			case LOC.PHASE2OFF:
				this.setPhase(2, false);
				break;
			case LOC.PHASE2ON:
				this.setPhase(2, true);
				break;
			case LOC.PHASE3OFF:
				this.setPhase(3, false);
				break;
			case LOC.PHASE3ON:
				this.setPhase(3, true);
				break;
			case LOC.DRIVEOFF:
				if (!this.offTimeout) {
					if (state.on) this.offTimeout = window.setTimeout(() => {
						this.debug("Drive Off");
						state.on = false;
						this.callbacks.driveLight(state.driveNo, false);
						this.curDriver.onDriveOff();
					}, 1e3);
				}
				break;
			case LOC.DRIVEON:
				if (this.offTimeout) {
					window.clearTimeout(this.offTimeout);
					this.offTimeout = null;
				}
				if (!state.on) {
					this.debug("Drive On");
					state.on = true;
					this.callbacks.driveLight(state.driveNo, true);
					this.curDriver.onDriveOn();
				}
				break;
			case LOC.DRIVE1:
				this.debug("Disk 1");
				state.driveNo = 1;
				this.updateActiveDrive();
				if (state.on) {
					this.callbacks.driveLight(2, false);
					this.callbacks.driveLight(1, true);
				}
				break;
			case LOC.DRIVE2:
				this.debug("Disk 2");
				state.driveNo = 2;
				this.updateActiveDrive();
				if (state.on) {
					this.callbacks.driveLight(1, false);
					this.callbacks.driveLight(2, true);
				}
				break;
			case LOC.DRIVEREAD:
				state.q6 = false;
				this.curDriver.onQ6Low();
				break;
			case LOC.DRIVEWRITE:
				state.q6 = true;
				this.curDriver.onQ6High(readMode);
				break;
			case LOC.DRIVEREADMODE:
				this.debug("Read Mode");
				state.q7 = false;
				break;
			case LOC.DRIVEWRITEMODE:
				this.debug("Write Mode");
				state.q7 = true;
		}
		this.tick();
		if (readMode) {
			if ((off & 1) === 0) result = state.latch;
			else result = 0;
		} else state.bus = val;
		return result;
	}
	updateDirty(driveNo, dirty) {
		this.drives[driveNo].dirty = dirty;
		if (this.callbacks.dirty) this.callbacks.dirty(driveNo, dirty);
	}
	ioSwitch(off, val) {
		return this.access(off, val);
	}
	read(_page, off) {
		return BOOTSTRAP_ROM[this.sectors][off];
	}
	write() {}
	reset() {
		const state = this.state;
		if (state.on) {
			this.callbacks.driveLight(state.driveNo, false);
			state.q7 = false;
			state.on = false;
			state.driveNo = 1;
		}
		this.updateActiveDrive();
	}
	tick() {
		this.curDriver.tick();
	}
	getDriveState(driveNo) {
		const curDrive = this.drives[driveNo];
		const curDisk = this.disks[driveNo];
		const curDriver = this.driver[driveNo];
		const { readOnly, track, head, phase, dirty } = curDrive;
		return {
			disk: getDiskState(curDisk),
			driver: curDriver.getState(),
			readOnly,
			track,
			head,
			phase,
			dirty
		};
	}
	getState() {
		const result = {
			drives: [],
			controllerState: { ...this.state }
		};
		result.drives[1] = this.getDriveState(1);
		result.drives[2] = this.getDriveState(2);
		return result;
	}
	setDriveState(driveNo, state) {
		const { track, head, phase, readOnly, dirty } = state;
		this.drives[driveNo] = {
			track,
			head,
			phase,
			readOnly,
			dirty
		};
		const disk = getDiskState(state.disk);
		this.setDiskInternal(driveNo, disk);
		this.driver[driveNo].setState(state.driver);
	}
	setState(state) {
		this.state = { ...state.controllerState };
		for (const d of DRIVE_NUMBERS) {
			this.setDriveState(d, state.drives[d]);
			const { name, side } = state.drives[d].disk.metadata;
			const { dirty } = state.drives[d];
			this.callbacks.label(d, name, side);
			this.callbacks.driveLight(d, this.state.on);
			this.callbacks.dirty(d, dirty);
		}
		this.updateActiveDrive();
	}
	getMetadata(driveNo) {
		const { track, head, phase, readOnly, dirty } = this.drives[driveNo];
		return {
			track,
			head,
			phase,
			readOnly,
			dirty
		};
	}
	/** Reads the given track and physical sector. */
	rwts(driveNo, track, sector) {
		const curDisk = this.disks[driveNo];
		if (!isNibbleDisk(curDisk)) throw new Error("Can't read WOZ disks");
		return readSector(curDisk, track, sector);
	}
	/** Sets the data for `drive` from `disk`, which is expected to be JSON. */
	setDisk(driveNo, jsonDisk) {
		if (this.worker) {
			const message = {
				type: PROCESS_JSON_DISK,
				payload: {
					driveNo,
					jsonDisk
				}
			};
			this.worker.postMessage(message);
			return true;
		} else {
			const disk = createDiskFromJsonDisk(jsonDisk);
			if (disk) {
				this.insertDisk(driveNo, disk);
				return true;
			}
		}
		return false;
	}
	getJSON(driveNo, pretty = false) {
		const curDisk = this.disks[driveNo];
		if (!isNibbleDisk(curDisk)) throw new Error("Can't save WOZ disks to JSON");
		return jsonEncode(curDisk, pretty);
	}
	setJSON(driveNo, json) {
		if (this.worker) {
			const message = {
				type: PROCESS_JSON,
				payload: {
					driveNo,
					json
				}
			};
			this.worker.postMessage(message);
		} else {
			const disk = jsonDecode(json);
			this.insertDisk(driveNo, disk);
		}
		return true;
	}
	async setBinary(driveNo, name, fmt, rawData) {
		const options = {
			name,
			rawData,
			readOnly: false,
			volume: 254
		};
		if (this.worker) {
			const message = {
				type: PROCESS_BINARY,
				payload: {
					driveNo,
					fmt,
					options
				}
			};
			this.worker.postMessage(message);
			return;
		} else {
			const disk = createDisk(fmt, options);
			if (disk) {
				this.insertDisk(driveNo, disk);
				return;
			}
		}
		throw new Error("Unable to load disk");
	}
	initWorker() {}
	setDiskInternal(driveNo, disk) {
		this.disks[driveNo] = disk;
		if (isNoFloppyDisk(disk)) this.driver[driveNo] = new EmptyDriver(this.drives[driveNo]);
		else if (isNibbleDisk(disk)) this.driver[driveNo] = new NibbleDiskDriver(driveNo, this.drives[driveNo], disk, this.state, () => this.updateDirty(driveNo, true));
		else if (isWozDisk(disk)) this.driver[driveNo] = new WozDiskDriver(driveNo, this.drives[driveNo], disk, this.state, () => this.updateDirty(driveNo, true), this.io);
		else throw new Error(`Unknown disk format ${disk.encoding}`);
		this.updateActiveDrive();
	}
	insertDisk(driveNo, disk) {
		this.setDiskInternal(driveNo, disk);
		this.drives[driveNo].head = 0;
		const { name, side } = disk.metadata;
		this.updateDirty(driveNo, this.drives[driveNo].dirty);
		this.callbacks.label(driveNo, name, side);
	}
	/**
	* Returns the binary image of the non-WOZ disk in the given drive.
	* For WOZ disks, this method returns `null`. If the `ext` parameter
	* is supplied, the returned data will match that format or an error
	* will be thrown. If the `ext` parameter is not supplied, the
	* original image format for the disk in the drive will be used. If
	* the current data on the disk is no longer readable in that format,
	* an error will be thrown. Using `ext == 'nib'` will always return
	* an image.
	*/
	async getBinary(driveNo, ext) {
		const curDisk = this.disks[driveNo];
		if (!isNibbleDisk(curDisk)) return null;
		const { format, readOnly, tracks, volume } = curDisk;
		const { name } = curDisk.metadata;
		const len = format === "nib" ? tracks.reduce((acc, track) => acc + track.length, 0) : this.sectors * tracks.length * 256;
		const data = new Uint8Array(len);
		ext = ext ?? format;
		let idx = 0;
		for (let t = 0; t < tracks.length; t++) if (ext === "nib") {
			data.set(tracks[t], idx);
			idx += tracks[t].length;
		} else {
			let maxSector;
			let sectorMap;
			if (ext === "d13") {
				maxSector = 13;
				sectorMap = _D13O;
			} else {
				maxSector = 16;
				sectorMap = format === "po" ? _PO : _DO;
			}
			for (let s = 0; s < maxSector; s++) {
				const _s = sectorMap[s];
				const sector = readSector({
					...curDisk,
					format: ext
				}, t, _s);
				data.set(sector, idx);
				idx += sector.length;
			}
		}
		return {
			ext,
			metadata: { name },
			data: data.buffer,
			readOnly,
			volume
		};
	}
	getBase64(driveNo) {
		const curDisk = this.disks[driveNo];
		if (!isNibbleDisk(curDisk)) return null;
		const data = [];
		for (let t = 0; t < curDisk.tracks.length; t++) if (isNibbleDisk(curDisk)) data[t] = base64_encode(curDisk.tracks[t]);
		else {
			const track = [];
			for (let s = 0; s < 16; s++) track[s] = base64_encode(readSector(curDisk, t, s));
			data[t] = track;
		}
		return data;
	}
};
//#endregion
export { SEQUENCER_ROM, DiskII as default };
