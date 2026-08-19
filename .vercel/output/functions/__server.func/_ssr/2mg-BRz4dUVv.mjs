import { i as debug, o as toHex, r as bytify } from "./util-CcAkGmGv.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/2mg-BRz4dUVv.js
var B64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
function base64_encode(data) {
	let o1, o2, o3, h1, h2, h3, h4, bits, i = 0, ac = 0, enc = "";
	const tmp_arr = [];
	if (!data) return;
	do {
		o1 = data[i++];
		o2 = data[i++];
		o3 = data[i++];
		bits = o1 << 16 | o2 << 8 | o3;
		h1 = bits >> 18 & 63;
		h2 = bits >> 12 & 63;
		h3 = bits >> 6 & 63;
		h4 = bits & 63;
		tmp_arr[ac++] = B64.charAt(h1) + B64.charAt(h2) + B64.charAt(h3) + B64.charAt(h4);
	} while (i < data.length);
	enc = tmp_arr.join("");
	switch (data.length % 3) {
		case 1:
			enc = enc.slice(0, -2) + "==";
			break;
		case 2: enc = enc.slice(0, -1) + "=";
	}
	return enc;
}
/** Returns an array of bytes from the given base64-encoded string. */
function base64_decode(data) {
	let o1, o2, o3, h1, h2, h3, h4, bits, i = 0, ac = 0;
	const tmp_arr = [];
	if (!data) return;
	do {
		h1 = B64.indexOf(data.charAt(i++));
		h2 = B64.indexOf(data.charAt(i++));
		h3 = B64.indexOf(data.charAt(i++));
		h4 = B64.indexOf(data.charAt(i++));
		bits = h1 << 18 | h2 << 12 | h3 << 6 | h4;
		o1 = bits >> 16 & 255;
		o2 = bits >> 8 & 255;
		o3 = bits & 255;
		tmp_arr[ac++] = o1;
		if (h3 !== 64) tmp_arr[ac++] = o2;
		if (h4 !== 64) tmp_arr[ac++] = o3;
	} while (i < data.length);
	return new Uint8Array(tmp_arr);
}
var DRIVE_NUMBERS = [1, 2];
var NO_DISK = "empty";
var ENCODING_NIBBLE = "nibble";
var ENCODING_BITSTREAM = "bitstream";
var ENCODING_BLOCK = "block";
var MemoryBlockDisk = class {
	format;
	metadata;
	readOnly;
	blocks;
	encoding = ENCODING_BLOCK;
	constructor(format, metadata, readOnly = false, blocks) {
		this.format = format;
		this.metadata = metadata;
		this.readOnly = readOnly;
		this.blocks = blocks;
	}
	async blockCount() {
		return this.blocks.length;
	}
	async read(block) {
		return this.blocks[block];
	}
	async write(block, data) {
		this.blocks[block] = data;
	}
	blockCountSync() {
		return this.blocks.length;
	}
	readSync(block) {
		return this.blocks[block];
	}
	writeSync(block, data) {
		this.blocks[block] = data;
	}
};
/**
* File types supported by floppy devices in nibble mode.
*/
var NIBBLE_FORMATS = [
	"2mg",
	"d13",
	"do",
	"dsk",
	"po",
	"nib"
];
/**
* File types supported by floppy devices in bitstream mode.
*/
var BITSTREAM_FORMATS = ["woz"];
/**
* All file types supported by floppy devices.
*/
var FLOPPY_FORMATS = [...NIBBLE_FORMATS, ...BITSTREAM_FORMATS];
/**
* File types supported by block devices.
*/
var BLOCK_FORMATS = [
	"2mg",
	"hdv",
	"po"
];
[...FLOPPY_FORMATS, ...BLOCK_FORMATS];
/** Type guard for nibble disk formats. */
function isNibbleDiskFormat(f) {
	return NIBBLE_FORMATS.includes(f);
}
function isNoFloppyDisk(disk) {
	return disk?.encoding === NO_DISK;
}
/** Type guard for NibbleDisks */
function isNibbleDisk(disk) {
	return disk?.encoding === ENCODING_NIBBLE;
}
/** Type guard for NibbleDisks */
function isWozDisk(disk) {
	return disk?.encoding === ENCODING_BITSTREAM;
}
/**
* Process Disk message payloads for worker
*/
var PROCESS_BINARY = "PROCESS_BINARY";
var PROCESS_JSON_DISK = "PROCESS_JSON_DISK";
var PROCESS_JSON = "PROCESS_JSON";
/**
* DOS 3.3 Physical sector order (index is physical sector, value is DOS sector).
*/
var DO = [
	0,
	7,
	14,
	6,
	13,
	5,
	12,
	4,
	11,
	3,
	10,
	2,
	9,
	1,
	8,
	15
];
/**
* DOS 3.3 Logical sector order (index is DOS sector, value is physical sector).
*/
var _DO = [
	0,
	13,
	11,
	9,
	7,
	5,
	3,
	1,
	14,
	12,
	10,
	8,
	6,
	4,
	2,
	15
];
/**
* ProDOS Physical sector order (index is physical sector, value is ProDOS sector).
*/
var PO = [
	0,
	8,
	1,
	9,
	2,
	10,
	3,
	11,
	4,
	12,
	5,
	13,
	6,
	14,
	7,
	15
];
/**
* ProDOS Logical sector order (index is ProDOS sector, value is physical sector).
*/
var _PO = [
	0,
	2,
	4,
	6,
	8,
	10,
	12,
	14,
	1,
	3,
	5,
	7,
	9,
	11,
	13,
	15
];
/**
* DOS 13-sector disk physical sector order (index is disk sector, value is
* physical sector).
*/
var D13O = [
	0,
	10,
	7,
	4,
	1,
	11,
	8,
	5,
	2,
	12,
	9,
	6,
	3
];
var _D13O = [
	0,
	1,
	2,
	3,
	4,
	5,
	6,
	7,
	8,
	9,
	10,
	11,
	12
];
var TRANS53 = [
	171,
	173,
	174,
	175,
	181,
	182,
	183,
	186,
	187,
	189,
	190,
	191,
	214,
	215,
	218,
	219,
	221,
	222,
	223,
	234,
	235,
	237,
	238,
	239,
	245,
	246,
	247,
	250,
	251,
	253,
	254,
	255
];
var DETRANS53 = [
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	1,
	2,
	3,
	0,
	0,
	0,
	0,
	0,
	4,
	5,
	6,
	0,
	0,
	7,
	8,
	0,
	9,
	10,
	11,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	12,
	13,
	0,
	0,
	14,
	15,
	0,
	16,
	17,
	18,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	19,
	20,
	0,
	21,
	22,
	23,
	0,
	0,
	0,
	0,
	0,
	24,
	25,
	26,
	0,
	0,
	27,
	28,
	0,
	29,
	30,
	31
];
var TRANS62 = [
	150,
	151,
	154,
	155,
	157,
	158,
	159,
	166,
	167,
	171,
	172,
	173,
	174,
	175,
	178,
	179,
	180,
	181,
	182,
	183,
	185,
	186,
	187,
	188,
	189,
	190,
	191,
	203,
	205,
	206,
	207,
	211,
	214,
	215,
	217,
	218,
	219,
	220,
	221,
	222,
	223,
	229,
	230,
	231,
	233,
	234,
	235,
	236,
	237,
	238,
	239,
	242,
	243,
	244,
	245,
	246,
	247,
	249,
	250,
	251,
	252,
	253,
	254,
	255
];
var DETRANS62 = [
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	1,
	0,
	0,
	2,
	3,
	0,
	4,
	5,
	6,
	0,
	0,
	0,
	0,
	0,
	0,
	7,
	8,
	0,
	0,
	0,
	9,
	10,
	11,
	12,
	13,
	0,
	0,
	14,
	15,
	16,
	17,
	18,
	19,
	0,
	20,
	21,
	22,
	23,
	24,
	25,
	26,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	27,
	0,
	28,
	29,
	30,
	0,
	0,
	0,
	31,
	0,
	0,
	32,
	33,
	0,
	34,
	35,
	36,
	37,
	38,
	39,
	40,
	0,
	0,
	0,
	0,
	0,
	41,
	42,
	43,
	0,
	44,
	45,
	46,
	47,
	48,
	49,
	50,
	0,
	0,
	51,
	52,
	53,
	54,
	55,
	56,
	0,
	57,
	58,
	59,
	60,
	61,
	62,
	63
];
/**
* Converts a byte into its 4x4 encoded representation
*
* @param val byte to encode.
* @returns A two byte array of representing the 4x4 encoding.
*/
function fourXfour(val) {
	let xx = val & 170;
	let yy = val & 85;
	xx >>= 1;
	xx |= 170;
	yy |= 170;
	return [xx, yy];
}
/**
* Converts 2 4x4 encoded bytes into a byte value
*
* @param xx First encoded byte.
* @param yy Second encoded byte.
* @returns The decoded value.
*/
function defourXfour(xx, yy) {
	return (xx << 1 | 1) & yy;
}
/**
* Converts a raw sector into a nibblized representation to be combined into a
* nibblized 16 sector track.
*
* @param volume volume number
* @param track track number
* @param sector sector number
* @param data sector data
* @returns a nibblized representation of the sector data
*/
function explodeSector16(volume, track, sector, data) {
	let buf = [];
	let gap;
	if (sector === 0) gap = 128;
	else gap = track === 0 ? 40 : 38;
	for (let idx = 0; idx < gap; idx++) buf.push(255);
	const checksum = volume ^ track ^ sector;
	buf = buf.concat([
		213,
		170,
		150
	]);
	buf = buf.concat(fourXfour(volume));
	buf = buf.concat(fourXfour(track));
	buf = buf.concat(fourXfour(sector));
	buf = buf.concat(fourXfour(checksum));
	buf = buf.concat([
		222,
		170,
		235
	]);
	for (let idx = 0; idx < 5; idx++) buf.push(255);
	buf = buf.concat([
		213,
		170,
		173
	]);
	const nibbles = [];
	const ptr2 = 0;
	const ptr6 = 86;
	for (let idx = 0; idx < 342; idx++) nibbles[idx] = 0;
	let idx2 = 85;
	for (let idx6 = 257; idx6 >= 0; idx6--) {
		let val6 = data[idx6 % 256];
		let val2 = nibbles[ptr2 + idx2];
		val2 = val2 << 1 | val6 & 1;
		val6 >>= 1;
		val2 = val2 << 1 | val6 & 1;
		val6 >>= 1;
		nibbles[ptr6 + idx6] = val6;
		nibbles[ptr2 + idx2] = val2;
		if (--idx2 < 0) idx2 = 85;
	}
	let last = 0;
	for (let idx = 0; idx < 342; idx++) {
		const val = nibbles[idx];
		buf.push(TRANS62[last ^ val]);
		last = val;
	}
	buf.push(TRANS62[last]);
	buf = buf.concat([
		222,
		170,
		235
	]);
	buf.push(255);
	return buf;
}
/**
* Converts a raw sector into a nibblized representation to be combined into
* a nibblized 13 sector track.
*
* @param volume volume number
* @param track track number
* @param sector sector number
* @param data sector data
* @returns a nibblized representation of the sector data
*/
function explodeSector13(volume, track, sector, data) {
	let buf = [];
	let gap;
	if (sector === 0) gap = 128;
	else gap = track === 0 ? 40 : 38;
	for (let idx = 0; idx < gap; idx++) buf.push(255);
	const checksum = volume ^ track ^ sector;
	buf = buf.concat([
		213,
		170,
		181
	]);
	buf = buf.concat(fourXfour(volume));
	buf = buf.concat(fourXfour(track));
	buf = buf.concat(fourXfour(sector));
	buf = buf.concat(fourXfour(checksum));
	buf = buf.concat([
		222,
		170,
		235
	]);
	for (let idx = 0; idx < 5; idx++) buf.push(255);
	buf = buf.concat([
		213,
		170,
		173
	]);
	const nibbles = [];
	let jdx = 0;
	for (let idx = 50; idx >= 0; idx--) {
		const a5 = data[jdx] >> 3;
		const a3 = data[jdx] & 7;
		jdx++;
		const b5 = data[jdx] >> 3;
		const b3 = data[jdx] & 7;
		jdx++;
		const c5 = data[jdx] >> 3;
		const c3 = data[jdx] & 7;
		jdx++;
		const d5 = data[jdx] >> 3;
		const d3 = data[jdx] & 7;
		jdx++;
		const e5 = data[jdx] >> 3;
		const e3 = data[jdx] & 7;
		jdx++;
		nibbles[idx + 0] = a5;
		nibbles[idx + 51] = b5;
		nibbles[idx + 102] = c5;
		nibbles[idx + 153] = d5;
		nibbles[idx + 204] = e5;
		nibbles[idx + 256] = a3 << 2 | (d3 & 4) >> 1 | (e3 & 4) >> 2;
		nibbles[idx + 307] = b3 << 2 | d3 & 2 | (e3 & 2) >> 1;
		nibbles[idx + 358] = c3 << 2 | (d3 & 1) << 1 | e3 & 1;
	}
	nibbles[255] = data[jdx] >> 3;
	nibbles[409] = data[jdx] & 7;
	let last = 0;
	for (let idx = 409; idx >= 256; idx--) {
		const val = nibbles[idx];
		buf.push(TRANS53[last ^ val]);
		last = val;
	}
	for (let idx = 0; idx < 256; idx++) {
		const val = nibbles[idx];
		buf.push(TRANS53[last ^ val]);
		last = val;
	}
	buf.push(TRANS53[last]);
	buf = buf.concat([
		222,
		170,
		235
	]);
	buf.push(255);
	return buf;
}
var LookingFor = /* @__PURE__ */ function(LookingFor) {
	LookingFor[LookingFor["START_OF_FIELD_MARKER_FIRST_NIBBLE"] = 0] = "START_OF_FIELD_MARKER_FIRST_NIBBLE";
	LookingFor[LookingFor["START_OF_FIELD_MARKER_SECOND_NIBBLE"] = 1] = "START_OF_FIELD_MARKER_SECOND_NIBBLE";
	LookingFor[LookingFor["FIELD_TYPE_MARKER"] = 2] = "FIELD_TYPE_MARKER";
	LookingFor[LookingFor["ADDRESS_FIELD"] = 3] = "ADDRESS_FIELD";
	LookingFor[LookingFor["ADDRESS_FIELD_13"] = 4] = "ADDRESS_FIELD_13";
	LookingFor[LookingFor["DATA_FIELD_6AND2"] = 5] = "DATA_FIELD_6AND2";
	LookingFor[LookingFor["DATA_FIELD_5AND3"] = 6] = "DATA_FIELD_5AND3";
	return LookingFor;
}(LookingFor || {});
var FindSectorError = class extends Error {
	constructor(track, sector, e) {
		super(`Error finding track ${track} (${toHex(track)}), sector ${sector} (${toHex(sector)}): ` + (e instanceof Error ? `${e.message}` : `${String(e)}`));
	}
};
/**
* Finds a sector of data from a nibblized disk. The sector given should be the
* "physical" sector number, meaning the one that appears in the address field.
* The first sector with the right sector number and data whose checksum matches
* is returned. This means that for a dual-boot disk (DOS 3.2 and DOS 3.3),
* whichever sector is found first wins.
*
* @param disk Nibble disk
* @param track track number to read
* @param sector sector number to read
* @returns the track, sector, nibble offset, and detected sectors
*/
function findSector(disk, track, sector) {
	const cur = disk.tracks[track];
	let sectors = 16;
	let state = LookingFor.START_OF_FIELD_MARKER_FIRST_NIBBLE;
	let idx = 0;
	let retry = 0;
	function _readNext() {
		const result = cur[idx++];
		if (idx >= cur.length) {
			idx = 0;
			retry++;
		}
		return result;
	}
	function _skipBytes(count) {
		idx += count;
		if (idx >= cur.length) {
			idx %= cur.length;
			retry++;
		}
	}
	let t = 0, s = 0, v = 0, checkSum;
	while (retry < 4) {
		let val;
		switch (state) {
			case LookingFor.START_OF_FIELD_MARKER_FIRST_NIBBLE:
				val = _readNext();
				state = val === 213 ? LookingFor.START_OF_FIELD_MARKER_SECOND_NIBBLE : LookingFor.START_OF_FIELD_MARKER_FIRST_NIBBLE;
				break;
			case LookingFor.START_OF_FIELD_MARKER_SECOND_NIBBLE:
				val = _readNext();
				state = val === 170 ? LookingFor.FIELD_TYPE_MARKER : LookingFor.START_OF_FIELD_MARKER_FIRST_NIBBLE;
				break;
			case LookingFor.FIELD_TYPE_MARKER:
				val = _readNext();
				switch (val) {
					case 150:
						state = LookingFor.ADDRESS_FIELD;
						sectors = 16;
						break;
					case 181:
						state = LookingFor.ADDRESS_FIELD;
						sectors = 13;
						break;
					case 173:
						state = sectors === 16 ? LookingFor.DATA_FIELD_6AND2 : LookingFor.DATA_FIELD_5AND3;
						break;
					default: state = LookingFor.START_OF_FIELD_MARKER_FIRST_NIBBLE;
				}
				break;
			case LookingFor.ADDRESS_FIELD:
				v = defourXfour(_readNext(), _readNext());
				t = defourXfour(_readNext(), _readNext());
				s = defourXfour(_readNext(), _readNext());
				checkSum = defourXfour(_readNext(), _readNext());
				if (checkSum !== (v ^ t ^ s)) debug("Invalid header checksum:", toHex(v), toHex(t), toHex(s), toHex(checkSum));
				_skipBytes(3);
				state = 0;
				break;
			case LookingFor.DATA_FIELD_6AND2:
				if (s === sector && t === track) {
					const nibble = idx;
					let last = 0;
					for (let jdx = 0; jdx < 342; jdx++) last = DETRANS62[_readNext() - 128] ^ last;
					const checkSum = DETRANS62[_readNext() - 128] ^ last;
					if (!checkSum) return {
						track,
						sector,
						nibble,
						sectors
					};
					else debug("Invalid data checksum:", toHex(last), toHex(track), toHex(sector), toHex(checkSum));
					_skipBytes(3);
				} else _skipBytes(345);
				state = LookingFor.START_OF_FIELD_MARKER_FIRST_NIBBLE;
				break;
			case LookingFor.DATA_FIELD_5AND3:
				if (s === sector && t === track) {
					const nibble = idx;
					let last = 0;
					for (let jdx = 0; jdx < 410; jdx++) last = DETRANS53[_readNext() - 160] ^ last;
					const checkSum = DETRANS53[_readNext() - 160] ^ last;
					if (!checkSum) return {
						track,
						sector,
						nibble,
						sectors
					};
					else debug("Invalid data checksum:", toHex(last), toHex(track), toHex(sector), toHex(checkSum));
					_skipBytes(3);
				} else _skipBytes(410);
				state = LookingFor.START_OF_FIELD_MARKER_FIRST_NIBBLE;
				break;
			default: state = LookingFor.START_OF_FIELD_MARKER_FIRST_NIBBLE;
		}
	}
	throw new FindSectorError(track, sector, `too many retries (${retry})`);
}
var InvalidChecksum = class extends Error {
	constructor(expected, received) {
		super(`Expected: ${toHex(expected)}, received: ${toHex(received)}`);
	}
};
var ReadSectorError = class extends Error {
	constructor(track, sector, e) {
		super(`Error reading track ${track} (${toHex(track)}), sector ${sector} (${toHex(sector)}): ` + (e instanceof Error ? `${e.message}` : `${String(e)}`));
	}
};
/**
* Reads a sector of data from a nibblized disk. The sector given should be the
* "physical" sector number, meaning the one that appears in the address field.
* Like `findSector`, the first sector with the right sector number and data
* whose checksum matches is returned. This means that for a dual-boot disk
* (DOS 3.2 and DOS 3.3), whichever sector is found first wins.
*
* This does not work for WOZ disks.
*
* If the given track and sector combination is not found, a `ReadSectorError`
* will be thrown.
*
* @param disk Nibble disk
* @param track track number to read
* @param sector sector number to read
* @returns An array of sector data bytes.
*/
function readSector(disk, track, sector) {
	const { nibble, sectors } = findSector(disk, track, sector);
	const cur = disk.tracks[track];
	let idx = nibble;
	const _readNext = () => {
		const result = cur[idx++];
		if (idx >= cur.length) idx = 0;
		return result;
	};
	try {
		return sectors === 13 ? readSector13(_readNext) : readSector16(_readNext);
	} catch (e) {
		throw new ReadSectorError(track, sector, e);
	}
}
function readSector16(_readNext) {
	const data = /* @__PURE__ */ new Uint8Array(256);
	const data2 = [];
	let last = 0;
	let val;
	for (let jdx = 85; jdx >= 0; jdx--) {
		val = DETRANS62[_readNext() - 128] ^ last;
		data2[jdx] = val;
		last = val;
	}
	for (let jdx = 0; jdx < 256; jdx++) {
		val = DETRANS62[_readNext() - 128] ^ last;
		data[jdx] = val;
		last = val;
	}
	const checkSum = DETRANS62[_readNext() - 128] ^ last;
	if (checkSum) throw new InvalidChecksum(last, checkSum ^ last);
	for (let kdx = 0, jdx = 85; kdx < 256; kdx++) {
		data[kdx] <<= 1;
		if ((data2[jdx] & 1) !== 0) data[kdx] |= 1;
		data2[jdx] >>= 1;
		data[kdx] <<= 1;
		if ((data2[jdx] & 1) !== 0) data[kdx] |= 1;
		data2[jdx] >>= 1;
		if (--jdx < 0) jdx = 85;
	}
	return data;
}
function readSector13(_readNext) {
	const data = /* @__PURE__ */ new Uint8Array(256);
	let val;
	let last = 0;
	val = DETRANS53[_readNext() - 160] ^ last;
	last = val;
	data[255] = val & 7;
	for (let i = 152; i >= 0; i--) {
		val = DETRANS53[_readNext() - 160] ^ last;
		last = val;
		const off = Math.floor(i / 51) + 5 * (50 - i % 51);
		const dOff = 3 + 5 * (50 - i % 51);
		const eOff = 4 + 5 * (50 - i % 51);
		const bit = 2 - Math.floor(i / 51);
		data[off] = (val & 28) >> 2;
		data[dOff] ^= (val & 2) >> 1 << bit;
		data[eOff] ^= (val & 1) << bit;
	}
	for (let i = 0; i < 255; i++) {
		val = DETRANS53[_readNext() - 160] ^ last;
		last = val;
		const off = Math.floor(i / 51) + 5 * (50 - i % 51);
		data[off] ^= val << 3;
	}
	val = DETRANS53[_readNext() - 160] ^ last;
	last = val;
	data[255] ^= val << 3;
	const checkSum = DETRANS53[_readNext() - 160] ^ last;
	if (checkSum) throw new InvalidChecksum(last, checkSum ^ last);
	return data;
}
/**
* Convert a nibblized disk into a JSON string for storage.
*
* @param disk Nibblized disk
* @param pretty Whether to format the output string
* @returns A JSON string representing the disk
*/
function jsonEncode(disk, pretty) {
	const data = [];
	let format = "dsk";
	for (let t = 0; t < disk.tracks.length; t++) {
		data[t] = [];
		if (disk.format === "nib") {
			format = "nib";
			data[t] = base64_encode(disk.tracks[t]);
		} else for (let s = 0; s < 16; s++) {
			const _sector = disk.format === "po" ? _PO[s] : _DO[s];
			data[t][s] = base64_encode(readSector(disk, t, _sector));
		}
	}
	return JSON.stringify({
		type: format,
		encoding: "base64",
		volume: disk.volume,
		data,
		readOnly: disk.readOnly
	}, void 0, pretty ? "    " : void 0);
}
/**
* Convert a JSON string into a nibblized disk.
*
* @param data JSON string representing a disk image, created by [jsonEncode].
* @returns A nibblized disk
*/
function jsonDecode(data) {
	const tracks = [];
	const json = JSON.parse(data);
	const v = json.volume || 254;
	const readOnly = json.readOnly || false;
	for (let t = 0; t < json.data.length; t++) {
		let track = [];
		for (let s = 0; s < json.data[t].length; s++) {
			const _s = json.type === "po" ? PO[s] : DO[s];
			const sector = json.data[t][_s];
			const d = base64_decode(sector);
			track = track.concat(explodeSector16(v, t, s, d));
		}
		tracks[t] = bytify(track);
	}
	if (!isNibbleDiskFormat(json.type)) throw new Error(`JSON disks of type ${json.type} are not supported`);
	return {
		volume: v,
		format: json.type,
		encoding: ENCODING_NIBBLE,
		metadata: { name: json.name },
		tracks,
		readOnly
	};
}
/**
* Debugging utility to convert a bitstream into a nibble. Does not wrap.
*
* @param bits Bitstream containing nibbles
* @param offset Offset into bitstream to start nibblizing
* @returns nibble, the next nibble in the bitstream,
*      and offset, the end of that nibble in the bitstream
*/
function grabNibble(bits, offset) {
	let nibble = 0;
	let waitForOne = true;
	while (offset < bits.length) {
		if (bits[offset]) {
			nibble = nibble << 1 | 1;
			waitForOne = false;
		} else if (!waitForOne) nibble = nibble << 1;
		if (nibble & 128) break;
		offset += 1;
	}
	return {
		nibble,
		offset
	};
}
/**
* Returns a `Disk` object from DOS-ordered image data.
* @param options the disk image and options
* @returns A nibblized disk
*/
function createDiskFromDOS(options) {
	const { data, name, side, rawData, volume, readOnly } = options;
	const disk = {
		format: "dsk",
		encoding: ENCODING_NIBBLE,
		metadata: {
			name,
			side
		},
		volume,
		readOnly,
		tracks: []
	};
	for (let t = 0; t < 35; t++) {
		let track = [];
		for (let physical_sector = 0; physical_sector < 16; physical_sector++) {
			const dos_sector = DO[physical_sector];
			let sector;
			if (rawData) {
				const off = (16 * t + dos_sector) * 256;
				sector = new Uint8Array(rawData.slice(off, off + 256));
			} else if (data) sector = new Uint8Array(data[t][dos_sector]);
			else throw new Error("Requires data or rawData");
			track = track.concat(explodeSector16(volume, t, physical_sector, sector));
		}
		disk.tracks[t] = bytify(track);
	}
	return disk;
}
/**
* Returns a `Disk` object from raw nibble image data.
* @param options the disk image and options
* @returns A nibblized disk
*/
function createDiskFromNibble(options) {
	const { data, name, side, rawData, volume, readOnly } = options;
	const disk = {
		format: "nib",
		encoding: ENCODING_NIBBLE,
		metadata: {
			name,
			side
		},
		volume: volume || 254,
		readOnly: readOnly || false,
		tracks: []
	};
	for (let t = 0; t < 35; t++) {
		let track;
		if (rawData) {
			const off = t * 6656;
			track = new Uint8Array(rawData.slice(off, off + 6656));
		} else if (data) track = data[t][0];
		else throw new Error("Requires data or rawData");
		disk.tracks[t] = track;
	}
	return disk;
}
/**
* Returns a `Disk` object from ProDOS-ordered image data.
* @param options the disk image and options
* @returns A nibblized disk
*/
function createDiskFromProDOS(options) {
	const { data, name, side, rawData, volume, readOnly } = options;
	let disk;
	if (rawData && rawData.byteLength > 143500) {
		const blocks = [];
		for (let offset = 0; offset < rawData.byteLength; offset += 512) blocks.push(new Uint8Array(rawData.slice(offset, offset + 512)));
		disk = new MemoryBlockDisk("po", {
			name,
			side
		}, readOnly || false, blocks);
	} else {
		disk = {
			format: "po",
			encoding: ENCODING_NIBBLE,
			metadata: {
				name,
				side
			},
			volume: volume || 254,
			tracks: [],
			readOnly: readOnly || false
		};
		for (let physical_track = 0; physical_track < 35; physical_track++) {
			let track = [];
			for (let physical_sector = 0; physical_sector < 16; physical_sector++) {
				const prodos_sector = PO[physical_sector];
				let sector;
				if (rawData) {
					const off = (16 * physical_track + prodos_sector) * 256;
					sector = new Uint8Array(rawData.slice(off, off + 256));
				} else if (data) sector = data[physical_track][prodos_sector];
				else throw new Error("Requires data or rawData");
				track = track.concat(explodeSector16(volume, physical_track, physical_sector, sector));
			}
			disk.tracks[physical_track] = bytify(track);
		}
	}
	return disk;
}
/**
* Offsets in bytes to the various header fields. All number fields are
* in little-endian order (least significant byte first). These values
* come from the spec at:
*
* https://apple2.org.za/gswv/a2zine/Docs/DiskImage_2MG_Info.txt
*/
var OFFSETS = {
	/** File signature ('2IMG', 4 bytes) */
	SIGNATURE: 0,
	/** Creator ID (4 bytes) */
	CREATOR: 4,
	/** Header length (2 bytes) */
	HEADER_LENGTH: 8,
	/** Version number (2 bytes). (Version of what? Format? Image?). */
	VERSION: 10,
	/** Image format ID (4 bytes) */
	FORMAT: 12,
	/** Flags and DOS 3.3 volume number */
	FLAGS: 16,
	/**
	* Number of ProDOS blocks (4 bytes). ProDOS blocks are 512 bytes each.
	* This field must be zero if the image format is not 0x01 (ProDOS).
	* (ASIMOV2 always fills in this field.)
	*/
	BLOCKS: 20,
	/**
	* Disk data start in bytes from the beginning of the image file
	* (4 bytes).
	*/
	DATA_OFFSET: 24,
	/**
	* Length of disk data in bytes (4 bytes). (143,360 bytes for 5.25"
	* floppies; 512 × blocks for ProDOS volumes.)
	*/
	DATA_LENGTH: 28,
	/**
	* Comment start in bytes from the beginning of the image file (4 bytes).
	* Must be zero if there is no comment. The comment must come after the
	* disk data and before the creator data. The comment should be "raw text"
	* with no terminating null. By "raw text", we assume UTF-8.
	*/
	COMMENT: 32,
	/**
	* Comment length in bytes (4 bytes). Must be zero if there is no comment.
	*/
	COMMENT_LENGTH: 36,
	/**
	* Optional creator data start in bytes from the beginning of the image
	* file (4 bytes). Must be zero if there is no creator data.
	*/
	CREATOR_DATA: 40,
	/**
	* Creator data length in bytes (4 bytes). Must be zero if there is no
	* creator data.
	*/
	CREATOR_DATA_LENGTH: 44,
	/** Padding (16 bytes). Must be zero. */
	PADDING: 48
};
var FLAGS = {
	READ_ONLY: 2147483648,
	VOLUME_VALID: 256,
	VOLUME_MASK: 255
};
var FORMAT = /* @__PURE__ */ function(FORMAT) {
	FORMAT[FORMAT["DOS"] = 0] = "DOS";
	FORMAT[FORMAT["ProDOS"] = 1] = "ProDOS";
	FORMAT[FORMAT["NIB"] = 2] = "NIB";
	return FORMAT;
}({});
function read2MGHeader(rawData) {
	const prefix = new DataView(rawData);
	const decoder = new TextDecoder("ascii");
	const signature = decoder.decode(rawData.slice(OFFSETS.SIGNATURE, OFFSETS.SIGNATURE + 4));
	if (signature !== "2IMG") throw new Error(`Unrecognized 2mg signature: ${signature}`);
	const creator = decoder.decode(rawData.slice(OFFSETS.CREATOR, OFFSETS.CREATOR + 4));
	const headerLength = prefix.getInt16(OFFSETS.HEADER_LENGTH, true);
	if (headerLength !== 64) throw new Error(`2mg header length is incorrect ${headerLength} !== 64`);
	const format = prefix.getInt32(OFFSETS.FORMAT, true);
	const flags = prefix.getInt32(OFFSETS.FLAGS, true);
	const blocks = prefix.getInt32(OFFSETS.BLOCKS, true);
	const offset = prefix.getInt32(OFFSETS.DATA_OFFSET, true);
	const bytes = prefix.getInt32(OFFSETS.DATA_LENGTH, true);
	const commentOffset = prefix.getInt32(OFFSETS.COMMENT, true);
	const commentLength = prefix.getInt32(OFFSETS.COMMENT_LENGTH, true);
	const creatorDataOffset = prefix.getInt32(OFFSETS.CREATOR_DATA, true);
	const creatorDataLength = prefix.getInt32(OFFSETS.CREATOR_DATA_LENGTH, true);
	if (format === FORMAT.ProDOS && blocks * 512 !== bytes) throw new Error(`2mg blocks does not match disk data length: ${blocks} * 512 !== ${bytes}`);
	if (offset < headerLength) throw new Error(`2mg data offset is less than header length: ${offset} < ${headerLength}`);
	if (offset + bytes > prefix.byteLength) throw new Error(`2mg data extends beyond disk image: ${offset} + ${bytes} > ${prefix.byteLength}`);
	const dataEnd = offset + bytes;
	if (commentOffset && commentOffset < dataEnd) throw new Error(`2mg comment is before the end of the disk data: ${commentOffset} < ${offset} + ${bytes}`);
	const commentEnd = commentOffset ? commentOffset + commentLength : dataEnd;
	if (commentEnd > prefix.byteLength) throw new Error(`2mg comment extends beyond disk image: ${commentEnd} > ${prefix.byteLength}`);
	if (creatorDataOffset && creatorDataOffset < commentEnd) throw new Error(`2mg creator data is before the end of the comment: ${creatorDataOffset} < ${commentEnd}`);
	const creatorDataEnd = creatorDataOffset ? creatorDataOffset + creatorDataLength : commentEnd;
	if (creatorDataEnd > prefix.byteLength) throw new Error(`2mg creator data extends beyond disk image: ${creatorDataEnd} > ${prefix.byteLength}`);
	const extras = {};
	if (commentOffset) extras.comment = new TextDecoder("utf-8").decode(new Uint8Array(rawData, commentOffset, commentLength));
	if (creatorDataOffset) extras.creatorData = new Uint8Array(rawData, creatorDataOffset, creatorDataLength);
	const readOnly = (flags & FLAGS.READ_ONLY) !== 0;
	let volume = format === FORMAT.DOS ? 254 : 0;
	if (flags & FLAGS.VOLUME_VALID) volume = flags & FLAGS.VOLUME_MASK;
	return {
		bytes,
		creator,
		format,
		offset,
		readOnly,
		volume,
		...extras
	};
}
/**
* Creates the prefix and suffix parts of a 2mg file. Will use
* default header values if headerData is null.
*
* Currently only supports blocks disks but should be adaptable
* for nibble formats.
*
* @param headerData 2mg header data
* @param blocks The number of blocks in a block volume
* @returns 2mg prefix and suffix for creating a 2mg disk image
*/
var create2MGFragments = (headerData, { blocks }) => {
	if (!headerData) headerData = {
		bytes: blocks * 512,
		creator: "A2JS",
		format: FORMAT.ProDOS,
		offset: 64,
		readOnly: false,
		volume: 0
	};
	if (headerData.format !== FORMAT.ProDOS) throw new Error("Nibble formats not supported yet");
	if (headerData.bytes !== blocks * 512) throw new Error("Byte count does not match block count");
	const prefix = /* @__PURE__ */ new Uint8Array(64);
	const prefixView = new DataView(prefix.buffer);
	const flags = (headerData.volume ? headerData.volume | FLAGS.VOLUME_VALID : 0) | (headerData.readOnly ? FLAGS.READ_ONLY : 0);
	const prefixLength = prefix.length;
	const dataLength = blocks * 512;
	let commentOffset = 0;
	let commentLength = 0;
	let commentData = /* @__PURE__ */ new Uint8Array(0);
	if (headerData.comment) {
		commentData = new TextEncoder().encode(headerData.comment);
		commentOffset = prefixLength + dataLength;
		commentLength = commentData.length;
	}
	let creatorDataOffset = 0;
	let creatorDataLength = 0;
	let creatorData = /* @__PURE__ */ new Uint8Array(0);
	if (headerData.creatorData) {
		creatorData = new Uint8Array(headerData.creatorData);
		creatorDataOffset = prefixLength + dataLength + commentLength;
		creatorDataLength = headerData.creatorData.length;
	}
	const encoder = new TextEncoder();
	prefix.set(encoder.encode("2IMG"), OFFSETS.SIGNATURE);
	prefix.set(encoder.encode(headerData.creator.slice(0, 4)), OFFSETS.CREATOR);
	prefixView.setInt32(OFFSETS.HEADER_LENGTH, 64, true);
	prefixView.setInt16(OFFSETS.VERSION, 1, true);
	prefixView.setInt32(OFFSETS.FORMAT, headerData.format, true);
	prefixView.setInt32(OFFSETS.FLAGS, flags, true);
	prefixView.setInt32(OFFSETS.BLOCKS, blocks, true);
	prefixView.setInt32(OFFSETS.DATA_OFFSET, prefixLength, true);
	prefixView.setInt32(OFFSETS.DATA_LENGTH, dataLength, true);
	prefixView.setInt32(OFFSETS.COMMENT, commentOffset, true);
	prefixView.setInt32(OFFSETS.COMMENT_LENGTH, commentLength, true);
	prefixView.setInt32(OFFSETS.CREATOR_DATA, creatorDataOffset, true);
	prefixView.setInt32(OFFSETS.CREATOR_DATA_LENGTH, creatorDataLength, true);
	const suffix = new Uint8Array(commentLength + creatorDataLength);
	suffix.set(commentData);
	suffix.set(creatorData, commentLength);
	return {
		prefix,
		suffix
	};
};
/**
* Creates a 2MG image from stored 2MG header data and a block disk. Will use
* default header values if headerData is null.
*
* @param headerData 2MG style header data
* @param blocks Prodos volume blocks
* @returns 2MS
*/
var create2MGFromBlockDisk = async (headerData, disk) => {
	const blockCount = await disk.blockCount();
	const { prefix, suffix } = create2MGFragments(headerData, { blocks: blockCount });
	const imageLength = prefix.length + blockCount * 512 + suffix.length;
	const byteArray = new Uint8Array(imageLength);
	byteArray.set(prefix);
	for (let idx = 0; idx < blockCount; idx++) {
		const block = await disk.read(idx);
		byteArray.set(block, prefix.length + idx * 512);
	}
	byteArray.set(suffix, prefix.length + blockCount * 512);
	return byteArray.buffer;
};
/**
* Returns a `Disk` object from a 2mg image.
* @param options the disk image and options
*/
function createDiskFrom2MG(options) {
	let { rawData } = options;
	let disk;
	if (!rawData) throw new Error("Requires rawData");
	const { bytes, format, offset, readOnly, volume } = read2MGHeader(rawData);
	rawData = rawData.slice(offset, offset + bytes);
	options = {
		...options,
		rawData,
		readOnly,
		volume
	};
	switch (format) {
		case FORMAT.ProDOS:
			disk = createDiskFromProDOS(options);
			break;
		case FORMAT.NIB:
			disk = createDiskFromNibble(options);
			break;
		case FORMAT.DOS:
		default: disk = createDiskFromDOS(options);
	}
	return disk;
}
//#endregion
export { isNibbleDisk as C, jsonEncode as D, jsonDecode as E, read2MGHeader as O, grabNibble as S, isWozDisk as T, createDiskFrom2MG as _, MemoryBlockDisk as a, createDiskFromProDOS as b, PROCESS_BINARY as c, _D13O as d, _DO as f, create2MGFromBlockDisk as g, base64_encode as h, ENCODING_NIBBLE as i, readSector as k, PROCESS_JSON as l, base64_decode as m, DRIVE_NUMBERS as n, NIBBLE_FORMATS as o, _PO as p, ENCODING_BITSTREAM as r, NO_DISK as s, D13O as t, PROCESS_JSON_DISK as u, createDiskFromDOS as v, isNoFloppyDisk as w, explodeSector13 as x, createDiskFromNibble as y };
