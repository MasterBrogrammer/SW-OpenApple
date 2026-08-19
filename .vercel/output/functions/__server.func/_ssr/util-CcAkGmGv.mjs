//#region node_modules/.nitro/vite/services/ssr/assets/util-CcAkGmGv.js
var hex_digits = "0123456789ABCDEF";
/** Returns a random byte. */
function garbage() {
	return Math.random() * 256 & 255;
}
/**
* Returns an array or Uint8Array of `size` bytes filled as if the computer
* was just powered on.
*/
function allocMem(size) {
	const result = new Uint8Array(size);
	for (let idx = 0; idx < size; idx++) result[idx] = idx & 2 ? 0 : 255;
	for (let idx = 0; idx < size; idx += 512) {
		result[idx + 40] = garbage();
		result[idx + 41] = garbage();
		result[idx + 104] = garbage();
		result[idx + 105] = garbage();
	}
	return result;
}
/** Returns an array or Uint8Array of 256 * `pages` bytes. */
function allocMemPages(pages) {
	return allocMem(pages << 8);
}
/** Returns a new Uint8Array for the input array. */
function bytify(ary) {
	return new Uint8Array(ary);
}
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
//#endregion
export { garbage as a, debug as i, allocMemPages as n, toHex as o, bytify as r, allocMem as t };
