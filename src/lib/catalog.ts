export type Media =
  | { kind: "none" }
  | { kind: "json"; url: string }
  | { kind: "floppy"; url: string; format: "dsk" | "po" | "do" | "nib" }
  | { kind: "block"; url: string; format: "2mg" | "po" | "hdv" };

export type Title = {
  id: string;
  name: string;
  category: string;
  summary: string;
  media: Media;
  size: string;
  license: string;
  /** Typed into the II after the disk boots (DOS greeting missing, etc.). */
  bootKeys?: string;
};

export const CATEGORIES = [
  "All",
  "Game",
  "Adventure",
  "Creative",
  "System",
  "GUI",
  "Unix",
  "Network",
  "Language",
  "Utility",
  "Blank",
] as const;

export const CATALOG: Title[] = [
  {
    id: "painter",
    name: "Painter",
    category: "Game",
    summary:
      "Joystick action: fence in bugs, flood-fill the room. MIT, rebuilt for ProDOS.",
    media: { kind: "floppy", url: "/disks/painter.po", format: "po" },
    size: "140K floppy",
    license: "MIT — Randall Frank",
  },
  {
    id: "tombombem",
    name: "Tom Bombem",
    category: "Game",
    summary:
      "Original hi-res shooter by Vince Weaver. Paddle or joystick, starfield, ending.",
    media: { kind: "floppy", url: "/disks/tombombem.dsk", format: "dsk" },
    size: "140K floppy",
    license: "GPL-2.0 — Vince Weaver",
  },
  {
    id: "mazezam",
    name: "MazezaM",
    category: "Game",
    summary:
      "Push whole rows of blocks to reach the exit. Space to start, arrows to move.",
    media: { kind: "floppy", url: "/disks/mazezam.dsk", format: "dsk" },
    size: "140K floppy",
    license: "Public domain — Ventzislav Tzvetkov",
  },
  {
    id: "mystery-house",
    name: "Mystery House",
    category: "Adventure",
    summary:
      "The first graphic adventure. Roberta Williams released it to the public domain.",
    media: { kind: "floppy", url: "/disks/mystery.dsk", format: "dsk" },
    size: "140K floppy",
    license: "Public domain — Roberta Williams",
  },
  {
    id: "eamon",
    name: "Eamon: Beginner’s Cave",
    category: "Adventure",
    summary:
      "Public-domain RPG construction set. Main Hall plus the first cave, one disk.",
    media: { kind: "floppy", url: "/disks/eamon.dsk", format: "dsk" },
    size: "140K floppy",
    license: "Public domain — Donald Brown",
    bootKeys: "RUN HELLO\r",
  },
  {
    id: "colossal-cave",
    name: "Colossal Cave Adventure",
    category: "Adventure",
    summary:
      "Crowther & Woods. You are standing at the end of a road before a small brick building.",
    media: { kind: "floppy", url: "/disks/colossal-cave.dsk", format: "dsk" },
    size: "140K floppy",
    license: "Public domain original — Crowther & Woods",
  },
  {
    id: "bam",
    name: "Beneath Apple Manor",
    category: "Adventure",
    summary:
      "Don Worth’s 1978 roguelike, Special Edition. Freeware from the author.",
    media: { kind: "floppy", url: "/disks/bam.dsk", format: "dsk" },
    size: "140K floppy",
    license: "Freeware — Don Worth",
  },
  {
    id: "silvern",
    name: "Silvern Castle",
    category: "Adventure",
    summary:
      "Wizardry-style party crawler. Jeff Fink reclaimed it and released it as freeware.",
    media: { kind: "block", url: "/disks/silvern.hdv", format: "hdv" },
    size: "800K SmartPort",
    license: "Freeware — Jeff Fink",
  },
  {
    id: "applewriter",
    name: "Apple Writer 1.1",
    category: "Creative",
    summary:
      "Paul Lutus’s classic word processor. Freeware since 1992 — copy and share, don’t sell.",
    media: { kind: "floppy", url: "/disks/applewriter.dsk", format: "dsk" },
    size: "140K floppy",
    license: "Freeware — Paul Lutus",
  },
  {
    id: "fredwriter",
    name: "FrEdWriter 3.10",
    category: "Creative",
    summary:
      "Free Educational Writer. Prompted composing for classrooms, copy-all granted.",
    media: { kind: "floppy", url: "/disks/fredwriter.dsk", format: "dsk" },
    size: "140K floppy",
    license: "Public domain — Al Rogers",
  },
  {
    id: "electric-duet",
    name: "Electric Duet",
    category: "Creative",
    summary:
      "Two-voice music on the built-in speaker. Compose, play piano, or run the jukebox.",
    media: { kind: "floppy", url: "/disks/electric-duet.dsk", format: "dsk" },
    size: "140K floppy",
    license: "GPL-2.0 — Paul Lutus",
  },
  {
    id: "applepi-music",
    name: "Apple Pi Music Disk",
    category: "Creative",
    summary:
      "User-group music collection. Unmute the speaker and boot for tunes.",
    media: { kind: "floppy", url: "/disks/applepi-music.dsk", format: "dsk" },
    size: "140K floppy",
    license: "Public domain — Apple Pi UG",
  },
  {
    id: "dos33",
    name: "DOS 3.3 Master",
    category: "System",
    summary: "Apple’s 16-sector DOS. CATALOG, RUN, SAVE — the original disk OS.",
    media: { kind: "json", url: "/json/disks/dos33master.json" },
    size: "140K floppy",
    license: "Historic system software",
  },
  {
    id: "prodos",
    name: "ProDOS 2.4.2",
    category: "System",
    summary: "The last community ProDOS. Boots to BASIC.SYSTEM.",
    media: { kind: "json", url: "/json/disks/prodos.json" },
    size: "140K floppy",
    license: "Historic system software",
  },
  {
    id: "applesoft",
    name: "Applesoft BASIC",
    category: "Language",
    summary: "Cold start with no disk. The ] prompt lives in ROM.",
    media: { kind: "none" },
    size: "ROM",
    license: "Historic firmware",
  },
  {
    id: "a2desktop",
    name: "A2DeskTop 1.5 (140K)",
    category: "GUI",
    summary: "Finder-like desktop for ProDOS 8. Tight on a 5.25\" disk.",
    media: { kind: "floppy", url: "/disks/a2desktop-disk1.po", format: "po" },
    size: "140K floppy",
    license: "GPL-3.0 — a2stuff/a2d",
  },
  {
    id: "a2desktop-800",
    name: "A2DeskTop 1.5 (800K)",
    category: "GUI",
    summary: "Full DeskTop with accessories on an 800K SmartPort volume.",
    media: { kind: "block", url: "/disks/a2desktop.2mg", format: "2mg" },
    size: "800K SmartPort",
    license: "GPL-3.0 — a2stuff/a2d",
  },
  {
    id: "a2osx",
    name: "A2osX (140K)",
    category: "Unix",
    summary: "Unix-like kernel and shell for the Apple IIe.",
    media: { kind: "floppy", url: "/disks/a2osx.po", format: "po" },
    size: "140K floppy",
    license: "FOSS — A2osX",
  },
  {
    id: "a2osx-800",
    name: "A2osX (800K)",
    category: "Unix",
    summary: "Larger A2osX volume on SmartPort.",
    media: { kind: "block", url: "/disks/a2osx-800.po", format: "po" },
    size: "800K SmartPort",
    license: "FOSS — A2osX",
  },
  {
    id: "contiki",
    name: "Contiki",
    category: "Network",
    summary: "Lightweight GUI OS with TCP/IP, built for 8-bit machines.",
    media: { kind: "floppy", url: "/disks/contiki.dsk", format: "dsk" },
    size: "140K floppy",
    license: "BSD — contiki-os",
  },
  {
    id: "contiki-po",
    name: "Contiki (ProDOS 800K)",
    category: "Network",
    summary: "Contiki on a ProDOS-order SmartPort image.",
    media: { kind: "block", url: "/disks/contiki.po", format: "po" },
    size: "800K SmartPort",
    license: "BSD — contiki-os",
  },
  {
    id: "plasma",
    name: "PLASMA",
    category: "Language",
    summary: "Portable, lightweight assembler / VM language for the Apple II.",
    media: { kind: "floppy", url: "/disks/plasma-sys.po", format: "po" },
    size: "140K floppy",
    license: "FOSS — PLASMA",
  },
  {
    id: "plforth",
    name: "PLFORTH",
    category: "Language",
    summary: "FORTH environment on the PLASMA runtime.",
    media: { kind: "floppy", url: "/disks/plforth.po", format: "po" },
    size: "140K floppy",
    license: "FOSS — PLFORTH",
  },
  {
    id: "audit",
    name: "Apple II Audit",
    category: "Utility",
    summary: "Hardware self-test and ROM identification.",
    media: { kind: "json", url: "/json/disks/audit.json" },
    size: "140K floppy",
    license: "FOSS utility",
  },
  {
    id: "blank-dos",
    name: "Blank DOS 3.3",
    category: "Blank",
    summary: "Initialized DOS 3.3 floppy. INIT your own.",
    media: { kind: "json", url: "/json/disks/blank_dos33.json" },
    size: "140K floppy",
    license: "Blank image",
  },
  {
    id: "blank-prodos",
    name: "Blank ProDOS",
    category: "Blank",
    summary: "Empty ProDOS volume.",
    media: { kind: "json", url: "/json/disks/blank_prodos.json" },
    size: "140K floppy",
    license: "Blank image",
  },
];

export function getTitle(id: string) {
  return CATALOG.find((t) => t.id === id);
}
