import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { _ as Link, y as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { i as createServerFn, o as getServerFnById, t as TSS_SERVER_FUNCTION } from "./ssr.mjs";
import { i as signOut, t as authClient } from "./client-sGid3STf.mjs";
import { t as authMiddleware } from "./middleware-I1-vhrOI.mjs";
import { n as cn, t as Button } from "./button-BrXXEjTT.mjs";
import { a as Play, c as Heart, i as RotateCcw, l as Gauge, n as Volume2, o as LoaderCircle, s as Keyboard, t as VolumeX, u as FolderOpen } from "../_libs/lucide-react.mjs";
import { t as create } from "../_libs/zustand.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-Dw7I7NGO.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var ROWS = [
	[
		"ESC",
		"1",
		"2",
		"3",
		"4",
		"5",
		"6",
		"7",
		"8",
		"9",
		"0"
	],
	[
		"Q",
		"W",
		"E",
		"R",
		"T",
		"Y",
		"U",
		"I",
		"O",
		"P"
	],
	[
		"A",
		"S",
		"D",
		"F",
		"G",
		"H",
		"J",
		"K",
		"L",
		"RETURN"
	],
	[
		"Z",
		"X",
		"C",
		"V",
		"B",
		"N",
		"M",
		",",
		".",
		"/"
	],
	["SPC"]
];
var CODES = {
	ESC: 27,
	RETURN: 13,
	SPC: 32,
	",": 44,
	".": 46,
	"/": 47
};
function codeFor(label) {
	if (label in CODES) return CODES[label];
	if (label.length === 1) return label.charCodeAt(0);
	return 255;
}
function SoftKeyboard({ onKey, onUp }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex flex-col gap-1 rounded-lg bg-surface p-2 shadow-[var(--shadow-border)] md:hidden",
		children: ROWS.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex justify-center gap-1",
			children: row.map((key) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				type: "button",
				variant: "outline",
				size: "sm",
				className: key === "SPC" ? "min-h-11 flex-1" : "min-h-11 min-w-8 px-2",
				onPointerDown: (e) => {
					e.preventDefault();
					const code = codeFor(key);
					if (code !== 255) onKey(code);
				},
				onPointerUp: onUp,
				onPointerLeave: onUp,
				children: key === "SPC" ? "space" : key === "RETURN" ? "return" : key
			}, key))
		}, row.join()))
	});
}
var CATEGORIES = [
	{
		id: "all",
		label: "All"
	},
	{
		id: "language",
		label: "Language"
	},
	{
		id: "system",
		label: "System"
	},
	{
		id: "os",
		label: "OS"
	},
	{
		id: "productivity",
		label: "Apps"
	},
	{
		id: "development",
		label: "Dev"
	},
	{
		id: "utility",
		label: "Utility"
	}
];
var CATALOG = [
	{
		id: "applesoft",
		title: "Applesoft BASIC",
		dek: "The language in the IIe ROM. Boots to the ] prompt with no disk in the drive.",
		category: "language",
		license: "ROM",
		year: "1977",
		author: "Apple Computer",
		media: "ROM",
		bootHint: "Type NEW, then a program. RUN executes it. LIST shows it."
	},
	{
		id: "dos33",
		title: "DOS 3.3 System Master",
		dek: "The classic disk operating system. CATALOG, LOAD, SAVE, RUN — the Apple II as people remember it.",
		category: "system",
		license: "Apple system (bundled for emulation)",
		year: "1980",
		author: "Apple Computer",
		disk: "/json/disks/dos33master.json",
		media: "140K floppy",
		bootHint: "After boot, type CATALOG. Integer/Applesoft samples live on this disk."
	},
	{
		id: "prodos",
		title: "ProDOS",
		dek: "Apple's later SOS-inspired DOS. Hierarchical volumes, clock-aware, the basis for almost every FOSS disk here.",
		category: "system",
		license: "Apple system (bundled for emulation)",
		year: "1983",
		author: "Apple Computer",
		disk: "/json/disks/prodos.json",
		media: "140K floppy"
	},
	{
		id: "blank-dos",
		title: "Blank DOS 3.3",
		dek: "An initialized DOS 3.3 floppy. Write Applesoft programs and SAVE them.",
		category: "system",
		license: "Blank media",
		year: "1980",
		author: "—",
		disk: "/json/disks/blank_dos33.json",
		media: "140K floppy"
	},
	{
		id: "blank-prodos",
		title: "Blank ProDOS",
		dek: "An empty ProDOS volume. Useful as a data disk next to DeskTop or A2osX.",
		category: "system",
		license: "Blank media",
		year: "1983",
		author: "—",
		disk: "/json/disks/blank_prodos.json",
		media: "140K floppy"
	},
	{
		id: "a2desktop",
		title: "Apple II DeskTop",
		dek: "A real Finder for the IIe: icons, folders, desk accessories. GPL desktop by the a2stuff project, v1.5.",
		category: "productivity",
		license: "GPL-2.0",
		year: "2025",
		author: "a2stuff / Joshua Bell et al.",
		disk: "/disks/a2desktop-disk1.po",
		media: "140K floppy",
		bootHint: "Boots from Disk II. Double-hires desktop — give it a few seconds, then click in the screen."
	},
	{
		id: "a2desktop-800",
		title: "Apple II DeskTop (800K)",
		dek: "The 800K ProDOS 2MG of DeskTop 1.5, for SmartPort. Larger volume, same GPL desktop.",
		category: "productivity",
		license: "GPL-2.0",
		year: "2025",
		author: "a2stuff / Joshua Bell et al.",
		disk: "/disks/a2desktop.2mg",
		media: "800K ProDOS",
		bootHint: "Boots from SmartPort (slot 7). If it drops to the monitor, use the 140K floppy instead."
	},
	{
		id: "a2osx",
		title: "A2osX",
		dek: "A Unix-like, preemptive multitasking OS for the Apple II. Shell, pipes, daemons — on a 65C02.",
		category: "os",
		license: "FOSS (A2osX)",
		year: "2024",
		author: "A2osX contributors",
		disk: "/disks/a2osx.po",
		media: "140K floppy",
		bootHint: "80-column Unix-like OS. Give it a few seconds after the drive light."
	},
	{
		id: "a2osx-800",
		title: "A2osX (800K)",
		dek: "The larger A2osX stable image. More tools on one volume; boots from SmartPort.",
		category: "os",
		license: "FOSS (A2osX)",
		year: "2024",
		author: "A2osX contributors",
		disk: "/disks/a2osx-800.po",
		media: "800K ProDOS"
	},
	{
		id: "contiki",
		title: "Contiki",
		dek: "Adam Dunkels' tiny TCP/IP OS, ported to the Apple II by Oliver Schmidt. A desktop, a browser, on 64K.",
		category: "os",
		license: "BSD-3-Clause",
		year: "2019",
		author: "Dunkels / Schmidt / Contiki",
		disk: "/disks/contiki.dsk",
		media: "140K floppy",
		bootHint: "Network hardware is not emulated here; explore the desktop and apps offline."
	},
	{
		id: "contiki-800",
		title: "Contiki (800K)",
		dek: "The 800K ProDOS build of Contiki for the Apple II, with more of the userland on one disk.",
		category: "os",
		license: "BSD-3-Clause",
		year: "2019",
		author: "Dunkels / Schmidt / Contiki",
		disk: "/disks/contiki.po",
		media: "800K ProDOS"
	},
	{
		id: "plasma",
		title: "PLASMA",
		dek: "David Schmenk's portable language for Apple II — a compact compiler/VM used to write whole systems.",
		category: "language",
		license: "FOSS (PLASMA)",
		year: "2024",
		author: "David Schmenk",
		disk: "/disks/plasma-sys.po",
		media: "140K floppy",
		bootHint: "Needs ProDOS in memory. Run ProDOS first, then this disk, or type '-PLASMA.SYSTEM' from BASIC."
	},
	{
		id: "plforth",
		title: "PLFORTH",
		dek: "Forth on the Apple II, from the PLASMA/Pleiades toolchain. Stack-based, immediate, very 1980s in the best way.",
		category: "language",
		license: "FOSS (PLASMA)",
		year: "2024",
		author: "David Schmenk",
		disk: "/disks/plforth.po",
		media: "140K floppy"
	},
	{
		id: "audit",
		title: "Apple II Audit",
		dek: "A hardware/firmware diagnostic that prints what kind of Apple II this emulator is pretending to be.",
		category: "utility",
		license: "Bundled with Apple ][js",
		year: "2010s",
		author: "Apple II community",
		disk: "/json/disks/audit.json",
		media: "140K floppy"
	}
];
var useEmuStore = create((set) => ({
	status: "idle",
	error: null,
	loadedId: null,
	loadedTitle: null,
	drive1: {
		name: "Empty",
		on: false
	},
	drive2: {
		name: "Empty",
		on: false
	},
	turbo: true,
	muted: false,
	api: null,
	setStatus: (status, error = null) => set({
		status,
		error
	}),
	setLoaded: (loadedId, loadedTitle) => set({
		loadedId,
		loadedTitle
	}),
	setDrive: (drive, info) => set((state) => drive === 1 ? { drive1: {
		...state.drive1,
		...info
	} } : { drive2: {
		...state.drive2,
		...info
	} }),
	setTurbo: (turbo) => set({ turbo }),
	setMuted: (muted) => set({ muted }),
	registerApi: (api) => set({ api })
}));
var SCREEN_W = 560;
var SCREEN_H = 384;
var BASIC_BANNER = "HOME\rPRINT \"OPENAPPLE  //E\"\rPRINT \"ENHANCED 65C02 SYSTEM\"\rPRINT \"RUN A DISK FROM THE LIBRARY.\"\r";
var BLOCK_EXTS = /* @__PURE__ */ new Set([
	"2mg",
	"hdv",
	"po"
]);
var FLOPPY_EXTS = /* @__PURE__ */ new Set([
	"2mg",
	"d13",
	"do",
	"dsk",
	"po",
	"nib",
	"woz"
]);
function nameAndExt(path) {
	const parts = (path.split("/").pop() ?? path).split(".");
	const ext = (parts.pop() ?? "").toLowerCase();
	return {
		name: decodeURIComponent(parts.join(".")),
		ext
	};
}
function attachSpeaker(io) {
	const ctx = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 44e3 });
	const node = ctx.createScriptProcessor(1024, 1, 1);
	const queue = [];
	let enabled = true;
	io.sampleRate(ctx.sampleRate, 1024);
	io.addSampleListener((sample) => {
		if (enabled && ctx.state === "running" && queue.length < 6) queue.push(sample);
	});
	node.onaudioprocess = (event) => {
		const out = event.outputBuffer.getChannelData(0);
		const sample = queue.shift();
		let i = 0;
		if (sample) {
			const n = Math.min(sample.length, out.length);
			for (; i < n; i++) out[i] = sample[i];
		}
		for (; i < out.length; i++) out[i] = 0;
	};
	node.connect(ctx.destination);
	const resume = () => {
		ctx.resume();
	};
	return {
		resume,
		setEnabled: (on) => {
			enabled = on;
			if (on) resume();
			else queue.length = 0;
		},
		dispose: () => {
			try {
				node.disconnect();
				ctx.close();
			} catch {}
		}
	};
}
async function loadVendor() {
	const [{ Apple2 }, disk2Mod, smartMod, ramMod, clockMod, keysMod, mouseMod, mouseUiMod] = await Promise.all([
		import("./apple2-RZb332Dd.mjs"),
		import("./disk2-ZXrAwPxo.mjs"),
		import("./smartport-DFZivfyL.mjs"),
		import("./ramfactor-CDIb-oMu.mjs"),
		import("./thunderclock-iUjUCgFh.mjs"),
		import("./keyboard-CISIdvw2.mjs"),
		import("./mouse-CdtYMqRD.mjs"),
		import("./mouse-a8BURx1K.mjs")
	]);
	return {
		Apple2,
		Disk2: disk2Mod.default,
		SmartPort: smartMod.default,
		RAMFactor: ramMod.default,
		Thunderclock: clockMod.default,
		Mouse: mouseMod.default,
		MouseUI: mouseUiMod.MouseUI,
		mapKeyboardEvent: keysMod.mapKeyboardEvent
	};
}
function EmulatorScreen() {
	const canvasRef = (0, import_react.useRef)(null);
	const fileRef = (0, import_react.useRef)(null);
	const machineRef = (0, import_react.useRef)(null);
	const [keysOpen, setKeysOpen] = (0, import_react.useState)(false);
	const status = useEmuStore((s) => s.status);
	const error = useEmuStore((s) => s.error);
	const drive1 = useEmuStore((s) => s.drive1);
	const drive2 = useEmuStore((s) => s.drive2);
	const turbo = useEmuStore((s) => s.turbo);
	const muted = useEmuStore((s) => s.muted);
	const loadedTitle = useEmuStore((s) => s.loadedTitle);
	(0, import_react.useEffect)(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		let cancelled = false;
		let greetTimer;
		useEmuStore.getState().setStatus("booting");
		const boot = async () => {
			const vendor = await loadVendor();
			if (cancelled || !canvasRef.current) return;
			const apple2 = new vendor.Apple2({
				canvas: canvasRef.current,
				rom: "apple2enh",
				characterRom: "apple2enh_char",
				e: true,
				enhanced: true,
				gl: false,
				tick: () => void 0
			});
			await apple2.ready;
			if (cancelled) {
				apple2.stop();
				return;
			}
			const io = apple2.getIO();
			const cpu = apple2.getCPU();
			const setDrive = useEmuStore.getState().setDrive;
			const diskCbs = {
				driveLight: (n, on) => setDrive(n, { on }),
				dirty: () => void 0,
				label: (n, name) => setDrive(n, { name: name || "Empty" })
			};
			const smartCbs = {
				driveLight: (n, on) => setDrive(n, { on }),
				dirty: () => void 0,
				label: (n, name) => {
					if (name) setDrive(n, { name });
				}
			};
			const disk2 = new vendor.Disk2(io, diskCbs, 16);
			const smartPort = new vendor.SmartPort(cpu, smartCbs, { block: false });
			const ramfactor = new vendor.RAMFactor(8388608);
			const clock = new vendor.Thunderclock();
			const mouseUI = new vendor.MouseUI(canvas);
			const mouse = new vendor.Mouse(cpu, mouseUI);
			io.setSlot(2, ramfactor);
			io.setSlot(4, mouse);
			io.setSlot(5, clock);
			const speaker = attachSpeaker(io);
			io.updateKHz(4092);
			apple2.reset();
			apple2.run();
			canvasRef.current?.focus();
			machineRef.current = {
				apple2,
				disk2,
				smartPort,
				speaker,
				mapKeyboardEvent: vendor.mapKeyboardEvent
			};
			const clearGreet = () => {
				if (greetTimer) {
					clearTimeout(greetTimer);
					greetTimer = void 0;
				}
			};
			const greetBasic = () => {
				clearGreet();
				greetTimer = setTimeout(() => {
					if (cancelled) return;
					io.setKeyBuffer(BASIC_BANNER);
				}, 450);
			};
			const slotFloppy = () => {
				io.setSlot(6, disk2);
				io.setSlot(7, null);
			};
			const slotBlock = () => {
				io.setSlot(6, null);
				io.setSlot(7, smartPort);
			};
			const unslotDisks = () => {
				io.setSlot(6, null);
				io.setSlot(7, null);
				smartPort.resetBlockDisk(1);
				smartPort.resetBlockDisk(2);
			};
			const cpuMem = cpu;
			const coldBoot = () => {
				cpuMem.write(1012, 0);
				apple2.stop();
				apple2.reset();
				apple2.run();
			};
			const loadBinary = async (url, drive) => {
				const { name, ext } = nameAndExt(url);
				if (ext === "json") {
					const json = await fetch(url).then((r) => {
						if (!r.ok) throw new Error(`Could not load ${name}`);
						return r.json();
					});
					slotFloppy();
					smartPort.resetBlockDisk(drive);
					disk2.setDisk(drive, json);
					return;
				}
				const data = await fetch(url).then((r) => {
					if (!r.ok) throw new Error(`Could not load ${name}`);
					return r.arrayBuffer();
				});
				await insertBinary(name, ext, data, drive);
			};
			const insertBinary = async (name, ext, data, drive) => {
				if (data.byteLength >= 819200) {
					if (!BLOCK_EXTS.has(ext)) throw new Error(`Cannot mount ${name} as a block disk`);
					slotBlock();
					await smartPort.setBinary(drive, name, ext, data);
				} else if (FLOPPY_EXTS.has(ext)) {
					slotFloppy();
					smartPort.resetBlockDisk(drive);
					await disk2.setBinary(drive, name, ext, data);
				} else throw new Error(`Unknown disk format ".${ext}"`);
			};
			const loadItem = async (item) => {
				const st = useEmuStore.getState();
				st.setStatus("loading");
				clearGreet();
				try {
					speaker.resume();
					if (!item.disk) {
						unslotDisks();
						st.setDrive(1, {
							name: "Empty",
							on: false
						});
						st.setDrive(2, {
							name: "Empty",
							on: false
						});
						coldBoot();
						greetBasic();
					} else {
						await loadBinary(item.disk, 1);
						if (item.disk2) await loadBinary(item.disk2, 2);
						coldBoot();
					}
					st.setLoaded(item.id, item.title);
					st.setStatus("ready");
				} catch (err) {
					const message = err instanceof Error ? err.message : "Load failed";
					st.setStatus("error", message);
				}
			};
			const loadFile = async (file) => {
				const st = useEmuStore.getState();
				st.setStatus("loading");
				clearGreet();
				try {
					speaker.resume();
					const { name, ext } = nameAndExt(file.name);
					const data = await file.arrayBuffer();
					await insertBinary(name, ext, data, 1);
					coldBoot();
					st.setLoaded("local", file.name);
					st.setStatus("ready");
				} catch (err) {
					const message = err instanceof Error ? err.message : "Load failed";
					st.setStatus("error", message);
				}
			};
			useEmuStore.getState().registerApi({
				loadItem,
				loadFile,
				reset: () => coldBoot(),
				setTurbo: (on) => {
					io.updateKHz(on ? 4092 : 1023);
					useEmuStore.getState().setTurbo(on);
				},
				setMuted: (on) => {
					speaker.setEnabled(!on);
					useEmuStore.getState().setMuted(on);
				}
			});
			const dos = CATALOG.find((item) => item.id === "dos33");
			if (dos) loadItem(dos);
			else {
				useEmuStore.getState().setStatus("ready");
				useEmuStore.getState().setLoaded("applesoft", "Applesoft BASIC");
				greetBasic();
			}
		};
		boot().catch((err) => {
			if (cancelled) return;
			const message = err instanceof Error ? err.message : "Emulator failed";
			useEmuStore.getState().setStatus("error", message);
		});
		return () => {
			cancelled = true;
			if (greetTimer) clearTimeout(greetTimer);
			const machine = machineRef.current;
			machine?.apple2.stop();
			machine?.speaker.dispose();
			machineRef.current = null;
			useEmuStore.getState().registerApi(null);
		};
	}, []);
	(0, import_react.useEffect)(() => {
		const onKeyDown = (event) => {
			const machine = machineRef.current;
			if (!machine) return;
			if (event.target?.closest("input, textarea, select, [contenteditable=true]")) return;
			if (event.metaKey && event.key !== "Alt") return;
			const { key, keyCode } = machine.mapKeyboardEvent(event, event.getModifierState("CapsLock"), event.ctrlKey);
			if (key === "RESET") {
				event.preventDefault();
				useEmuStore.getState().api?.reset();
				return;
			}
			const io = machine.apple2.getIO();
			if (key === "OPEN_APPLE") {
				event.preventDefault();
				io.buttonDown(0, true);
				return;
			}
			if (key === "CLOSED_APPLE") {
				event.preventDefault();
				io.buttonDown(1, true);
				return;
			}
			if (keyCode !== 255) {
				event.preventDefault();
				io.keyDown(keyCode);
				machine.speaker.resume();
			}
		};
		const onKeyUp = (event) => {
			const machine = machineRef.current;
			if (!machine) return;
			const { key } = machine.mapKeyboardEvent(event);
			const io = machine.apple2.getIO();
			if (key === "OPEN_APPLE") io.buttonDown(0, false);
			if (key === "CLOSED_APPLE") io.buttonDown(1, false);
			io.keyUp();
		};
		const onPaste = (event) => {
			const machine = machineRef.current;
			if (!machine) return;
			if (event.target?.closest("input, textarea")) return;
			const text = event.clipboardData?.getData("text");
			if (text) {
				event.preventDefault();
				machine.apple2.getIO().setKeyBuffer(text);
			}
		};
		window.addEventListener("keydown", onKeyDown);
		window.addEventListener("keyup", onKeyUp);
		window.addEventListener("paste", onPaste);
		return () => {
			window.removeEventListener("keydown", onKeyDown);
			window.removeEventListener("keyup", onKeyUp);
			window.removeEventListener("paste", onPaste);
		};
	}, []);
	const api = useEmuStore((s) => s.api);
	const onDrop = (event) => {
		event.preventDefault();
		const file = event.dataTransfer.files[0];
		if (file) api?.loadFile(file);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "flex min-h-0 flex-col gap-3 lg:overflow-y-auto",
		"data-emu-status": status,
		"data-loaded-id": loadedId ?? "",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative overflow-hidden rounded-lg bg-screen shadow-[var(--shadow-border)]",
				onDragOver: (e) => e.preventDefault(),
				onDrop,
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", {
						ref: canvasRef,
						width: SCREEN_W,
						height: SCREEN_H,
						className: "block h-auto w-full bg-screen outline-none focus-visible:ring-2 focus-visible:ring-accent/40",
						style: { imageRendering: "pixelated" },
						tabIndex: 0,
						"aria-label": "Apple IIe display"
					}),
					status === "booting" || status === "idle" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "absolute inset-0 grid place-items-center bg-screen text-sm text-accent",
						children: "Starting enhanced IIe…"
					}) : null,
					status === "loading" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "absolute inset-x-0 bottom-0 bg-screen/80 px-3 py-2 text-xs text-accent",
						children: "Mounting disk…"
					}) : null,
					status === "error" && error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "absolute inset-x-0 bottom-0 bg-danger/90 px-3 py-2 text-xs text-fg",
						children: error
					}) : null
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DriveChip, {
						n: 1,
						drive: drive1
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DriveChip, {
						n: 2,
						drive: drive2
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "hidden min-w-0 flex-1 truncate text-xs text-muted sm:block",
						children: loadedTitle ?? "Enhanced Apple IIe"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "ml-auto flex items-center gap-1",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "ghost",
								size: "icon",
								className: "size-10",
								"aria-label": "Reset",
								onClick: () => api?.reset(),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, { className: "size-4" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: turbo ? "default" : "ghost",
								size: "icon",
								className: "size-10",
								"aria-label": turbo ? "1 MHz" : "Fast",
								onClick: () => api?.setTurbo(!turbo),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Gauge, { className: "size-4" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "ghost",
								size: "icon",
								className: "size-10",
								"aria-label": muted ? "Unmute" : "Mute",
								onClick: () => api?.setMuted(!muted),
								children: muted ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VolumeX, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Volume2, { className: "size-4" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "ghost",
								size: "icon",
								className: "size-10 md:hidden",
								"aria-label": "Keyboard",
								onClick: () => setKeysOpen((v) => !v),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Keyboard, { className: "size-4" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "outline",
								size: "sm",
								className: "hidden sm:inline-flex",
								onClick: () => fileRef.current?.click(),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FolderOpen, { className: "size-3.5" }), "Open disk"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								ref: fileRef,
								type: "file",
								accept: ".dsk,.po,.do,.2mg,.hdv,.nib,.woz,.json",
								className: "hidden",
								onChange: (e) => {
									const file = e.target.files?.[0];
									if (file) api?.loadFile(file);
									e.target.value = "";
								}
							})
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs leading-relaxed text-muted",
				children: "Raw IIe video, 560×384. Type into the machine — Alt is Open-Apple, Delete is Reset, paste inserts as keystrokes. Fast mode is on so disks boot in a couple of seconds."
			}),
			keysOpen ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SoftKeyboard, {
				onKey: (code) => machineRef.current?.apple2.getIO().keyDown(code),
				onUp: () => machineRef.current?.apple2.getIO().keyUp()
			}) : null
		]
	});
}
function DriveChip({ n, drive }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: "inline-flex items-center gap-2 rounded-md bg-surface px-2.5 py-1.5 text-xs text-muted shadow-[inset_0_0_0_1px_var(--color-border)]",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: cn("size-2 rounded-full", drive.on ? "bg-accent" : "bg-border"),
				"aria-hidden": true
			}),
			"S",
			n,
			" ",
			drive.name
		]
	});
}
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var listFavorites = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("2f410b3fb618f7a868b1b54b341202e7f25b2fddb025f03288c8d53e12dc6635"));
var toggleFavorite = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((softwareId) => softwareId.trim()).handler(createSsrRpc("8903222aa7247b0ad28c3580682328be3d77c9766690779a9a7358df6b5e49f9"));
/**
* Current user + loading state. Same behavior in live preview and when deployed:
*   - Auth enabled (default) -> the real signed-in user; `user` is `null` while
*                            the session resolves (`isPending: true`) and when
*                            signed out (`isPending: false`). Session comes from
*                            Better Auth `useSession()` → `/api/auth/get-session`
*                            (cookie when deployed; bearer in live preview).
*   - Auth disabled (`VITE_AUTH_ENABLED=false`) -> `DEV_USER`, never pending.
*
* Protect a route by waiting out `isPending` before acting on `user` —
* redirecting on `user: null` alone bounces signed-in visitors to sign-in on
* every hard reload:
*
*   import { RedirectToSignIn } from "@/lib/auth/gates";
*   const { user, isPending } = useCurrentUserState();
*   if (isPending) return null;              // still resolving — don't redirect yet
*   if (!user) return <RedirectToSignIn />;  // definitely signed out
*
* `authEnabled` is a module-level constant fixed at load, so the guarded hook
* call keeps a stable hook order across every render of a given component.
*/
function useCurrentUserState() {
	const { data, isPending } = authClient.useSession();
	const user = data?.user;
	return {
		user: user ? {
			id: user.id,
			displayName: user.name ?? null,
			primaryEmail: user.email ?? null,
			profileImageUrl: user.image ?? null,
			isDevFallback: false
		} : null,
		isPending
	};
}
/**
* Convenience view of `useCurrentUserState().user` for display (e.g.
* `user?.displayName ?? "Guest"`). NOTE: `null` means *loading OR signed out* —
* for redirects/guards use `useCurrentUserState()` and check `isPending`.
*/
function useCurrentUser() {
	return useCurrentUserState().user;
}
function SoftwareLibrary() {
	const [query, setQuery] = (0, import_react.useState)("");
	const [category, setCategory] = (0, import_react.useState)("all");
	const [stars, setStars] = (0, import_react.useState)(/* @__PURE__ */ new Set());
	const { user, isPending } = useCurrentUserState();
	const loadedId = useEmuStore((s) => s.loadedId);
	const status = useEmuStore((s) => s.status);
	const api = useEmuStore((s) => s.api);
	(0, import_react.useEffect)(() => {
		if (isPending || !user) {
			setStars(/* @__PURE__ */ new Set());
			return;
		}
		listFavorites().then((ids) => setStars(new Set(ids))).catch(() => setStars(/* @__PURE__ */ new Set()));
	}, [user, isPending]);
	const items = (0, import_react.useMemo)(() => {
		const q = query.trim().toLowerCase();
		return CATALOG.filter((item) => {
			if (category !== "all" && item.category !== category) return false;
			if (!q) return true;
			return item.title.toLowerCase().includes(q) || item.dek.toLowerCase().includes(q) || item.author.toLowerCase().includes(q) || item.license.toLowerCase().includes(q);
		});
	}, [query, category]);
	const onStar = async (id) => {
		if (!user) {
			window.location.assign("/login");
			return;
		}
		try {
			const result = await toggleFavorite({ data: id });
			setStars((prev) => {
				const next = new Set(prev);
				if (result.starred) next.add(id);
				else next.delete(id);
				return next;
			});
		} catch {}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
		className: "flex min-h-0 flex-col rounded-lg bg-surface shadow-[var(--shadow-border)] lg:h-full",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col gap-3 p-4 pb-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-mono text-xs font-medium uppercase tracking-[0.14em] text-muted",
					children: "Software library"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-fg",
					children: "Free and open-source disks that boot on a real IIe."
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					type: "search",
					value: query,
					onChange: (e) => setQuery(e.target.value),
					placeholder: "Search titles, licenses…",
					className: "h-10 w-full rounded-md bg-raised px-3 text-sm text-fg shadow-[inset_0_0_0_1px_var(--color-border)] outline-none placeholder:text-muted focus-visible:shadow-[inset_0_0_0_1px_var(--color-accent)]"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "-mx-1 flex gap-1 overflow-x-auto px-1 pb-0.5",
					children: CATEGORIES.map((cat) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => setCategory(cat.id),
						className: cn("h-8 shrink-0 rounded-md px-2.5 text-xs font-medium", category === cat.id ? "bg-accent text-accent-fg" : "text-muted hover:bg-raised hover:text-fg"),
						children: cat.label
					}, cat.id))
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
			className: "min-h-0 flex-1 space-y-2 overflow-y-auto px-3 pb-4",
			children: [items.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LibraryCard, {
				item,
				active: loadedId === item.id,
				busy: status === "loading" && loadedId === item.id,
				starred: stars.has(item.id),
				onRun: () => void api?.loadItem(item),
				onStar: () => void onStar(item.id),
				signedIn: Boolean(user),
				authPending: isPending
			}, item.id)), items.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
				className: "px-2 py-8 text-center text-sm text-muted",
				children: "No titles match that search."
			}) : null]
		})]
	});
}
function LibraryCard({ item, active, busy, starred, onRun, onStar, signedIn, authPending }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
		"data-software-id": item.id,
		className: cn("cursor-pointer rounded-md bg-raised p-3 shadow-[inset_0_0_0_1px_var(--color-border)] transition-shadow duration-150", active && "shadow-[inset_0_0_0_1px_var(--color-accent)]"),
		onClick: onRun,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start justify-between gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "truncate text-sm font-medium text-fg",
						children: item.title
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-0.5 font-mono text-xs text-muted",
						children: [
							item.year,
							" · ",
							item.media,
							" · ",
							item.license
						]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "relative grid size-10 shrink-0 place-items-center rounded-md text-muted hover:text-fg",
					"aria-label": starred ? "Remove from saved" : signedIn ? "Save" : "Sign in to save",
					onClick: (event) => {
						event.stopPropagation();
						onStar();
					},
					disabled: authPending,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, { className: cn("size-4", starred && "fill-accent text-accent") })
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm leading-relaxed text-muted",
				children: item.dek
			}),
			item.bootHint ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-xs leading-relaxed text-muted/80",
				children: item.bootHint
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 flex items-center justify-between gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "truncate text-xs text-muted",
					children: item.author
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					size: "sm",
					onClick: (event) => {
						event.stopPropagation();
						onRun();
					},
					disabled: busy,
					children: [busy ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-3.5 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-3.5" }), active ? "Reboot" : "Run"]
				})]
			})
		]
	});
}
/**
* Minimal signed-in identity chip + sign-out. Restyle freely (see the
* `design-ui` skill). Sign-out is only shown when auth is enabled (the
* disabled-auth dev user has nothing to sign out of).
*/
function UserButton() {
	const user = useCurrentUser();
	if (!user) return null;
	const label = user.displayName ?? user.primaryEmail ?? "Account";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center gap-2",
		children: [
			user.profileImageUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: user.profileImageUrl,
				alt: "",
				className: "h-8 w-8 rounded-full object-cover"
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "grid h-8 w-8 place-items-center rounded-full bg-black/10 text-sm font-medium dark:bg-white/20",
				children: label.charAt(0).toUpperCase()
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-sm font-medium",
				children: label
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: () => void signOut(),
				className: "cursor-pointer text-sm underline-offset-4 opacity-70 hover:underline",
				children: "Sign out"
			})
		]
	});
}
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-dvh flex-col lg:h-dvh lg:max-h-dvh lg:overflow-hidden",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Header, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
				className: "mx-auto grid w-full max-w-[1400px] min-h-0 flex-1 grid-cols-1 gap-4 p-4 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,24rem)] lg:overflow-hidden",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmulatorScreen, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SoftwareLibrary, {})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("footer", {
				className: "shrink-0 border-t border-border px-4 py-3 text-center text-xs text-muted",
				children: "Emulator core is Apple ][js by Will Scullin (MIT). Enhanced IIe, 65C02, Disk II + SmartPort. Disks are redistributed under their own licenses."
			})
		]
	});
}
function Header() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
		className: "shrink-0 border-b border-border",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto flex h-14 max-w-[1400px] items-center gap-3 px-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/",
					className: "flex items-center gap-2.5 no-underline",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "grid size-8 place-items-center rounded-md bg-raised font-mono text-sm font-semibold text-accent shadow-[inset_0_0_0_1px_var(--color-border)]",
						children: "]["
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-medium tracking-tight text-fg",
						children: "OpenApple"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "hidden text-xs text-muted sm:inline",
					children: "Enhanced IIe · 65C02 · FOSS disks"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "ml-auto",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthSlot, {})
				})
			]
		})
	});
}
function AuthSlot() {
	const { user, isPending } = useCurrentUserState();
	if (isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "size-8 animate-pulse rounded-full bg-raised" });
	if (user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "text-fg",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserButton, {})
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
		to: "/login",
		className: "inline-flex h-10 items-center rounded-md px-3 text-sm text-muted no-underline hover:bg-raised hover:text-fg",
		children: "Sign in"
	});
}
//#endregion
export { Home as component };
