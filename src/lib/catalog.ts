import type { BootStep } from "@/lib/boot-exec";

export type Media =
  | { kind: "none" }
  | { kind: "json"; url: string }
  | { kind: "floppy"; url: string; format: "dsk" | "po" | "do" | "nib" | "woz" }
  | { kind: "block"; url: string; format: "2mg" | "po" | "hdv" };

export type Title = {
  id: string;
  name: string;
  category: (typeof CATEGORIES)[number];
  summary: string;
  /** Short in-game hint shown while this disk is loaded. */
  play?: string;
  media: Media;
  size: string;
  license: string;
  year?: number;
  author?: string;
  tags?: string[];
  featured?: boolean;
  /**
   * After the disk boots, wait for DOS/BASIC prompts and type these commands.
   * Use this for files that live on a System Master (not self-booting games).
   */
  bootSteps?: BootStep[];
};

export const CATEGORIES = [
  "All",
  "Arcade",
  "Adventure",
  "Creative",
  "System",
  "Workshop",
] as const;

const DOS33: Media = { kind: "json", url: "/json/disks/dos33master.json" };

export const CATALOG: Title[] = [
  {
    id: "little-brick-out",
    name: "Little Brick Out",
    category: "Arcade",
    year: 1979,
    author: "Steve Wozniak",
    featured: true,
    summary:
      "Woz’s Breakout, shipped on the DOS 3.3 System Master. Every school IIe had this.",
    play: "Move the mouse left/right over the screen (paddle). Click to serve.",
    media: DOS33,
    size: "140K floppy",
    license: "Historic system software",
    tags: ["breakout", "woz", "paddle", "school"],
    bootSteps: [{ wait: "]", type: "RUN LITTLE BRICK OUT\r" }],
  },
  {
    id: "applevision",
    name: "Apple-Vision",
    category: "Arcade",
    year: 1979,
    author: "Apple Computer",
    featured: true,
    summary:
      "The hi-res demo from the System Master. Integer BASIC, so we switch language before RUN.",
    play: "Let it play. This is the one that made the lab IIe look expensive.",
    media: DOS33,
    size: "140K floppy",
    license: "Historic system software",
    tags: ["hi-res", "demo", "school", "integer"],
    bootSteps: [
      { wait: "]", type: "INT\r" },
      { wait: ">", type: "RUN APPLEVISION\r" },
    ],
  },
  {
    id: "painter",
    name: "Painter",
    category: "Arcade",
    year: 2016,
    author: "Randall Frank",
    featured: true,
    summary:
      "Qix-style action: fence in the bugs, flood-fill the room. Starts dark — that is the playfield.",
    play: "Mouse is the joystick. Click = button 0. Fence the bugs, fill the room.",
    media: { kind: "floppy", url: "/disks/painter.po", format: "po" },
    size: "140K floppy",
    license: "MIT — Randall Frank",
    tags: ["qix", "joystick", "action"],
  },
  {
    id: "tombombem",
    name: "Tom Bombem",
    category: "Arcade",
    year: 1998,
    author: "Vince Weaver",
    featured: true,
    summary:
      "Hi-res vertical shooter. Paddle or joystick, starfield, a real ending. GPL.",
    play: "Paddle/mouse X to move. Click or paddle button to fire.",
    media: { kind: "floppy", url: "/disks/tombombem.dsk", format: "dsk" },
    size: "140K floppy",
    license: "GPL-2.0 — Vince Weaver",
    tags: ["shooter", "paddle"],
  },
  {
    id: "mazezam",
    name: "MazezaM",
    category: "Arcade",
    year: 2004,
    author: "Ventzislav Tzvetkov",
    summary:
      "Push whole rows of blocks to open a path. Tight puzzle, public domain.",
    play: "Space to start, arrow keys to move.",
    media: { kind: "floppy", url: "/disks/mazezam.dsk", format: "dsk" },
    size: "140K floppy",
    license: "Public domain — Ventzislav Tzvetkov",
    tags: ["puzzle", "sokoban"],
  },
  {
    id: "animals",
    name: "Animals",
    category: "Arcade",
    year: 1979,
    author: "Apple Computer",
    summary:
      "Twenty questions that learns. You taught it ‘is it a cat?’ on a lab IIe in 1983.",
    play: "Integer BASIC: we boot DOS, type INT, then RUN ANIMALS. Answer Y or N.",
    media: DOS33,
    size: "140K floppy",
    license: "Historic system software",
    tags: ["school", "classic", "integer"],
    bootSteps: [
      { wait: "]", type: "INT\r" },
      { wait: ">", type: "RUN ANIMALS\r" },
    ],
  },
  {
    id: "brians-theme",
    name: "Brian’s Theme",
    category: "Arcade",
    year: 1980,
    author: "Apple Computer",
    summary: "Hi-res art/music demo from the System Master. Applesoft, so it RUNs after DOS.",
    media: DOS33,
    size: "140K floppy",
    license: "Historic system software",
    tags: ["hi-res", "demo", "school"],
    bootSteps: [{ wait: "]", type: "RUN BRIAN'S THEME\r" }],
  },
  {
    id: "biorhythm",
    name: "Biorhythm",
    category: "Arcade",
    year: 1979,
    author: "Apple Computer",
    summary: "Print-your-cycles parlor program. Integer BASIC; we INT then RUN.",
    media: DOS33,
    size: "140K floppy",
    license: "Historic system software",
    tags: ["school", "integer"],
    bootSteps: [
      { wait: "]", type: "INT\r" },
      { wait: ">", type: "RUN BIORHYTHM\r" },
    ],
  },
  {
    id: "mystery-house",
    name: "Mystery House",
    category: "Adventure",
    year: 1980,
    author: "Roberta Williams",
    featured: true,
    summary:
      "The first graphic adventure. Roberta Williams released it to the public domain.",
    play: "Type GO NORTH, GET KEY, LOOK. Two words, all caps.",
    media: { kind: "floppy", url: "/disks/mystery.dsk", format: "dsk" },
    size: "140K floppy",
    license: "Public domain — Roberta Williams",
    tags: ["sierra", "hi-res", "parser"],
  },
  {
    id: "eamon",
    name: "Eamon: Beginner’s Cave",
    category: "Adventure",
    year: 1980,
    author: "Donald Brown",
    summary:
      "Public-domain RPG construction set. Main Hall plus the first cave, one disk.",
    play: "Boots itself when it can. If it stops at ], we RUN HELLO.",
    media: { kind: "floppy", url: "/disks/eamon.dsk", format: "dsk" },
    size: "140K floppy",
    license: "Public domain — Donald Brown",
    bootSteps: [{ wait: "]", type: "RUN HELLO\r", optional: true }],
    tags: ["rpg", "eamon"],
  },
  {
    id: "colossal-cave",
    name: "Colossal Cave Adventure",
    category: "Adventure",
    year: 1976,
    author: "Crowther & Woods",
    summary:
      "You are standing at the end of a road before a small brick building.",
    play: "XYZZY still works. GET LAMP. ENTER BUILDING.",
    media: { kind: "floppy", url: "/disks/colossal-cave.dsk", format: "dsk" },
    size: "140K floppy",
    license: "Public domain original — Crowther & Woods",
    tags: ["text", "adventure"],
  },
  {
    id: "bam",
    name: "Beneath Apple Manor",
    category: "Adventure",
    year: 1978,
    author: "Don Worth",
    summary:
      "Don Worth’s 1978 roguelike, Special Edition. Freeware from the author.",
    play: "Keyboard movement. Watch hit points; the manor gets mean fast.",
    media: { kind: "floppy", url: "/disks/bam.dsk", format: "dsk" },
    size: "140K floppy",
    license: "Freeware — Don Worth",
    tags: ["roguelike"],
  },
  {
    id: "silvern",
    name: "Silvern Castle",
    category: "Adventure",
    year: 2000,
    author: "Jeff Fink",
    summary:
      "Wizardry-style party crawler. Jeff Fink reclaimed it and released it as freeware.",
    play: "Boots from SmartPort (hard disk). Create a party in town, then the castle.",
    media: { kind: "block", url: "/disks/silvern.hdv", format: "hdv" },
    size: "800K SmartPort",
    license: "Freeware — Jeff Fink",
    tags: ["wizardry", "blobber"],
  },
  {
    id: "applewriter",
    name: "Apple Writer 1.1",
    category: "Creative",
    year: 1979,
    author: "Paul Lutus",
    summary:
      "The word processor people actually used. Freeware since 1992 — copy and share, don’t sell.",
    play: "Ctrl-letter commands. Ctrl-Q catalog, Ctrl-S save. Click the screen first.",
    media: { kind: "floppy", url: "/disks/applewriter.dsk", format: "dsk" },
    size: "140K floppy",
    license: "Freeware — Paul Lutus",
    tags: ["word processor"],
  },
  {
    id: "fredwriter",
    name: "FrEdWriter 3.10",
    category: "Creative",
    year: 1985,
    author: "Al Rogers",
    summary:
      "Free Educational Writer. Prompted composing for classrooms, copy-all granted.",
    media: { kind: "floppy", url: "/disks/fredwriter.dsk", format: "dsk" },
    size: "140K floppy",
    license: "Public domain — Al Rogers",
    tags: ["school", "writing"],
  },
  {
    id: "electric-duet",
    name: "Electric Duet",
    category: "Creative",
    year: 1980,
    author: "Paul Lutus",
    summary:
      "Two-voice music on the built-in speaker. Unmute, then compose or hit the jukebox.",
    play: "Unmute the speaker first. Space / menu picks songs.",
    media: { kind: "floppy", url: "/disks/electric-duet.dsk", format: "dsk" },
    size: "140K floppy",
    license: "GPL-2.0 — Paul Lutus",
    tags: ["music"],
  },
  {
    id: "applepi-music",
    name: "Apple Pi Music Disk",
    category: "Creative",
    summary: "User-group music collection. Unmute the speaker and boot for tunes.",
    play: "Unmute, then let it boot. Click the screen if it wants a key.",
    media: { kind: "floppy", url: "/disks/applepi-music.dsk", format: "dsk" },
    size: "140K floppy",
    license: "Public domain — Apple Pi UG",
    tags: ["music"],
  },
  {
    id: "color-demosoft",
    name: "Color DemoSoft",
    category: "Creative",
    year: 1980,
    author: "Apple Computer",
    summary:
      "Hi-res color demo from the System Master. The first time the lab IIe looked expensive.",
    media: DOS33,
    size: "140K floppy",
    license: "Historic system software",
    bootSteps: [{ wait: "]", type: "RUN COLOR DEMOSOFT\r" }],
    tags: ["hi-res", "demo", "school"],
  },
  {
    id: "dos33",
    name: "DOS 3.3 Master",
    category: "System",
    summary:
      "Apple’s 16-sector DOS. CATALOG, RUN, BRUN, SAVE. Brick Out, Apple Trek, and Animals live on this disk too.",
    play: "At the ] prompt: CATALOG then RUN or BRUN a file.",
    media: DOS33,
    size: "140K floppy",
    license: "Historic system software",
    tags: ["dos"],
  },
  {
    id: "prodos",
    name: "ProDOS 2.4.2",
    category: "System",
    summary: "The last community ProDOS. Boots to BASIC.SYSTEM.",
    play: "CATALOG, PREFIX, -FILENAME.SYSTEM to run.",
    media: { kind: "json", url: "/json/disks/prodos.json" },
    size: "140K floppy",
    license: "Historic system software",
    tags: ["prodos"],
  },
  {
    id: "applesoft",
    name: "Applesoft BASIC",
    category: "System",
    summary: "Cold start with no disk. The ] prompt lives in ROM.",
    play: "Click the screen, then 10 PRINT \"HELLO\": 20 GOTO 10",
    media: { kind: "none" },
    size: "ROM",
    license: "Historic firmware",
    tags: ["basic"],
  },
  {
    id: "a2desktop",
    name: "A2DeskTop 1.5 (140K)",
    category: "Workshop",
    summary: "Finder-like desktop for ProDOS 8. Tight on a 5.25\" disk.",
    media: { kind: "floppy", url: "/disks/a2desktop-disk1.po", format: "po" },
    size: "140K floppy",
    license: "GPL-3.0 — a2stuff/a2d",
    tags: ["gui", "prodos"],
  },
  {
    id: "a2desktop-800",
    name: "A2DeskTop 1.5 (800K)",
    category: "Workshop",
    summary: "Full DeskTop with accessories on an 800K SmartPort volume.",
    media: { kind: "block", url: "/disks/a2desktop.2mg", format: "2mg" },
    size: "800K SmartPort",
    license: "GPL-3.0 — a2stuff/a2d",
    tags: ["gui", "prodos"],
  },
  {
    id: "a2osx",
    name: "A2osX (140K)",
    category: "Workshop",
    summary: "Unix-like kernel and shell for the Apple IIe.",
    media: { kind: "floppy", url: "/disks/a2osx.po", format: "po" },
    size: "140K floppy",
    license: "FOSS — A2osX",
    tags: ["unix"],
  },
  {
    id: "a2osx-800",
    name: "A2osX (800K)",
    category: "Workshop",
    summary: "Larger A2osX volume on SmartPort.",
    media: { kind: "block", url: "/disks/a2osx-800.po", format: "po" },
    size: "800K SmartPort",
    license: "FOSS — A2osX",
    tags: ["unix"],
  },
  {
    id: "contiki",
    name: "Contiki",
    category: "Workshop",
    summary: "Lightweight GUI OS with TCP/IP, built for 8-bit machines.",
    media: { kind: "floppy", url: "/disks/contiki.dsk", format: "dsk" },
    size: "140K floppy",
    license: "BSD — contiki-os",
    tags: ["network", "gui"],
  },
  {
    id: "contiki-po",
    name: "Contiki (ProDOS 800K)",
    category: "Workshop",
    summary: "Contiki on a ProDOS-order SmartPort image.",
    media: { kind: "block", url: "/disks/contiki.po", format: "po" },
    size: "800K SmartPort",
    license: "BSD — contiki-os",
    tags: ["network"],
  },
  {
    id: "plasma",
    name: "PLASMA",
    category: "Workshop",
    summary: "Portable, lightweight assembler / VM language for the Apple II.",
    media: { kind: "floppy", url: "/disks/plasma-sys.po", format: "po" },
    size: "140K floppy",
    license: "FOSS — PLASMA",
    tags: ["language"],
  },
  {
    id: "plforth",
    name: "PLFORTH",
    category: "Workshop",
    summary: "FORTH environment on the PLASMA runtime.",
    media: { kind: "floppy", url: "/disks/plforth.po", format: "po" },
    size: "140K floppy",
    license: "FOSS — PLFORTH",
    tags: ["language", "forth"],
  },
  {
    id: "audit",
    name: "Apple II Audit",
    category: "Workshop",
    summary: "Hardware self-test and ROM identification.",
    media: { kind: "json", url: "/json/disks/audit.json" },
    size: "140K floppy",
    license: "FOSS utility",
    tags: ["utility"],
  },
  {
    id: "blank-dos",
    name: "Blank DOS 3.3",
    category: "Workshop",
    summary: "Initialized DOS 3.3 floppy. INIT your own.",
    media: { kind: "json", url: "/json/disks/blank_dos33.json" },
    size: "140K floppy",
    license: "Blank image",
    tags: ["blank"],
  },
  {
    id: "blank-prodos",
    name: "Blank ProDOS",
    category: "Workshop",
    summary: "Empty ProDOS volume.",
    media: { kind: "json", url: "/json/disks/blank_prodos.json" },
    size: "140K floppy",
    license: "Blank image",
    tags: ["blank"],
  },
];

export function getTitle(id: string) {
  return CATALOG.find((t) => t.id === id);
}

export function searchTitles(query: string, category: string): Title[] {
  const q = query.trim().toLowerCase();
  const filtered = CATALOG.filter((title) => {
    if (category !== "All" && title.category !== category) return false;
    if (!q) return true;
    const hay = [
      title.name,
      title.summary,
      title.category,
      title.license,
      title.author ?? "",
      title.play ?? "",
      ...(title.tags ?? []),
    ]
      .join(" ")
      .toLowerCase();
    return hay.includes(q);
  });
  return filtered.sort((a, b) => {
    if (a.featured !== b.featured) return a.featured ? -1 : 1;
    return a.name.localeCompare(b.name);
  });
}
