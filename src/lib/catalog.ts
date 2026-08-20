import type { BootStep } from "@/lib/boot-exec";

export type Media =
  | { kind: "none" }
  | { kind: "json"; url: string }
  | {
      kind: "floppy";
      url: string;
      format: "dsk" | "po" | "do" | "nib" | "woz";
      /** Flip side of the same disk (A/B switch on the drive). */
      sideBUrl?: string;
      /** Second floppy in Disk II drive 2 — the dual-drive flex. */
      drive2Url?: string;
    }
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
  /** Which mouse axis drives paddle 0. Brick Out is sideways — use "y". */
  paddleAxis?: "x" | "y";
  /** Put a writable blank DOS 3.3 disk in drive 2 (character / save disk). */
  characterDisk?: boolean;
  /** If set, D2 gets this image instead of a blank (Kadash character side). */
  characterDiskUrl?: string;
};

/** Side A URL plus optional flip side (sideBUrl, else drive2Url). */
export function floppySides(media: Media): {
  a: string;
  b?: string;
  format: "dsk" | "po" | "do" | "nib" | "woz";
} | null {
  if (media.kind !== "floppy") return null;
  return {
    a: media.url,
    b: media.sideBUrl ?? media.drive2Url,
    format: media.format,
  };
}

export const CATEGORIES = ["Games", "Apps", "System"] as const;

/** Cold-start OSes — always one click from the drive bay. */
export const BOOT_WITH: { id: string; label: string }[] = [
  { id: "applesoft", label: "Applesoft" },
  { id: "dos33", label: "DOS 3.3" },
  { id: "prodos", label: "ProDOS" },
];

const DOS33: Media = { kind: "json", url: "/json/disks/dos33master.json" };

export const CATALOG: Title[] = [
  {
    id: "little-brick-out",
    name: "Little Brick Out",
    category: "Games",
    year: 1979,
    author: "Steve Wozniak",
    featured: true,
    summary:
      "Woz’s Breakout, shipped on the DOS 3.3 System Master. Every school IIe had this.",
    play: "Woz laid this out sideways: paddle on the left, bricks on the right. Mouse up/down, click to serve.",
    media: DOS33,
    size: "140K floppy",
    license: "Historic system software",
    tags: ["breakout", "woz", "paddle", "school"],
    paddleAxis: "y",
    bootSteps: [{ wait: "]", type: "RUN LITTLE BRICK OUT\r" }],
  },
  {
    id: "spys-demise",
    name: "Spy’s Demise",
    category: "Games",
    year: 1982,
    author: "Alan Zeldin / Penguin Software",
    featured: true,
    summary:
      "Cross the embassy floors without getting spotted. 1982 arcade, no shooting — just timing. The one you bragged about.",
    play: "Joystick/paddle. Get to the other side. Don’t get seen.",
    media: { kind: "floppy", url: "/disks/spys-demise.dsk", format: "dsk" },
    size: "140K floppy",
    license: "Freeware — Penguin Software / Polarware",
    tags: ["arcade", "penguin", "hi-res"],
  },
  {
    id: "pie-man",
    name: "Pie Man",
    category: "Games",
    year: 1982,
    author: "Eagle Berns & Michael Kosaka",
    featured: true,
    summary:
      "Lucy’s chocolate-factory energy, except it’s pies. Conveyor, cream, cherry, rack. Hi-res and weirdly addictive.",
    play: "Joystick. Cream, cherry, rack. Don’t drop the pie.",
    media: { kind: "floppy", url: "/disks/pie-man.dsk", format: "dsk" },
    size: "140K floppy",
    license: "Freeware — Penguin Software / Polarware",
    tags: ["arcade", "penguin", "hi-res"],
  },
  {
    id: "arcade-boot-camp",
    name: "Arcade Boot Camp",
    category: "Games",
    year: 1984,
    author: "John Besnard",
    featured: true,
    summary:
      "Private PeeVee vs every arcade skill that mattered: run, jump, dodge, drive, fly, shoot. A whole arcade in one box.",
    play: "Pick a drill. Joystick. Survive the sergeant.",
    media: { kind: "floppy", url: "/disks/arcade-boot-camp.dsk", format: "dsk" },
    size: "140K floppy",
    license: "Freeware — Penguin Software / Polarware",
    tags: ["arcade", "penguin", "compilation"],
  },
  {
    id: "sword-of-kadash",
    name: "Sword of Kadash",
    category: "Games",
    year: 1985,
    author: "Chris Cole / Dynamix",
    featured: true,
    summary:
      "Hundreds of rooms, traps, and an action-adventure map. Ahead of its time — the kid who had this had taste.",
    play: "Space at the title, then B to enter. Skip A — the copier errors on this dump.",
    bootSteps: [{ wait: "]", type: "RUN KADASH\r" }],
    characterDisk: true,
    media: {
      kind: "floppy",
      url: "/disks/sword-of-kadash.dsk",
      format: "dsk",
    },
    size: "140K floppy + character disk",
    license: "Freeware — Penguin Software / Polarware",
    tags: ["arcade", "adventure", "penguin"],
  },
  {
    id: "bouncing-kamungas",
    name: "Bouncing Kamungas",
    category: "Games",
    year: 1984,
    author: "Tom Becklund",
    featured: true,
    summary:
      "You’re a melon farmer. They’re bouncing. Pitchfork, thunderstorms, Fargo winters. Wacky hi-res action.",
    play: "Joystick. Protect the melons.",
    media: { kind: "floppy", url: "/disks/bouncing-kamungas.dsk", format: "dsk" },
    size: "140K floppy",
    license: "Freeware — Penguin Software / Polarware",
    tags: ["arcade", "penguin"],
  },
  {
    id: "crime-wave",
    name: "Crime Wave",
    category: "Games",
    year: 1983,
    author: "Tom Becklund",
    summary:
      "Hi-res cop-and-robber action from the same Fargo animator who did Kamungas.",
    play: "Joystick. Don’t let the city go under.",
    media: { kind: "floppy", url: "/disks/crime-wave.dsk", format: "dsk" },
    size: "140K floppy",
    license: "Freeware — Penguin Software / Polarware",
    tags: ["arcade", "penguin"],
  },
  {
    id: "spy-strikes-back",
    name: "The Spy Strikes Back",
    category: "Games",
    year: 1983,
    author: "Mark Pelczarski & Bob Hardy",
    summary:
      "Sneak the embassy. No shooting. Color/music clues, a nasty cipher, and a Monty Python subtitle.",
    play: "Joystick. Don’t be seen. Gather the clues.",
    media: { kind: "floppy", url: "/disks/spy-strikes-back.dsk", format: "dsk" },
    size: "140K floppy",
    license: "Freeware — Penguin Software / Polarware",
    tags: ["arcade", "penguin"],
  },
  {
    id: "poof",
    name: "Poof!",
    category: "Games",
    year: 1982,
    author: "Alan Zeldin",
    summary:
      "The original Spy’s Demise, before Penguin put a briefcase on him. Same addiction, earlier sprite.",
    play: "Joystick. Cross without getting hit.",
    media: { kind: "floppy", url: "/disks/poof.dsk", format: "dsk" },
    size: "140K floppy",
    license: "Freeware — Penguin Software / Polarware",
    tags: ["arcade", "penguin"],
  },
  {
    id: "transylvania",
    name: "Transylvania",
    category: "Games",
    year: 1982,
    author: "Antonio Antiochia",
    featured: true,
    summary:
      "Werewolf, castle, hi-res forest. The graphic adventure you showed people to prove the Apple was magic.",
    play: "Two-word parser. Flip D1, or side B is already in drive 2.",
    media: {
      kind: "floppy",
      url: "/disks/transylvania.dsk",
      format: "dsk",
      drive2Url: "/disks/transylvania-b.dsk",
    },
    size: "2×140K floppy",
    license: "Freeware — Polarware / Antonio Antiochia",
    tags: ["adventure", "hi-res", "penguin"],
  },
  {
    id: "coveted-mirror",
    name: "The Coveted Mirror",
    category: "Games",
    year: 1983,
    author: "Eagle Berns & Holly Thomason",
    summary:
      "Non-linear graphic adventure with a jousting minigame still on this original disk. Clever, not cruel.",
    play: "Two-word parser. Flip D1, or side B is already in drive 2.",
    media: {
      kind: "floppy",
      url: "/disks/coveted-mirror.dsk",
      format: "dsk",
      drive2Url: "/disks/coveted-mirror-b.dsk",
    },
    size: "2×140K floppy",
    license: "Freeware — Polarware / Berns & Thomason",
    tags: ["adventure", "hi-res", "penguin"],
  },
  {
    id: "the-quest",
    name: "The Quest",
    category: "Games",
    year: 1983,
    author: "Dallas Snell, Joe Toler, Joel Ellis Rea",
    summary:
      "Double hi-res graphic adventure with Gorn, your dim but useful sidekick. Playboy reviewed it. Your mom didn’t need to know.",
    play: "Parser. Flip D1, or side B is already in drive 2.",
    media: {
      kind: "floppy",
      url: "/disks/the-quest.dsk",
      format: "dsk",
      drive2Url: "/disks/the-quest-b.dsk",
    },
    size: "2×140K floppy",
    license: "Freeware — Penguin Software / Polarware",
    tags: ["adventure", "hi-res", "penguin"],
  },
  {
    id: "crimson-crown",
    name: "The Crimson Crown",
    category: "Games",
    year: 1985,
    author: "Antonio Antiochia",
    summary:
      "Transylvania sequel, 16-color Comprehend engine. Vampire, crown, the flex after you’d beaten the first one.",
    play: "Full-sentence parser. Flip D1, or side B is already in drive 2.",
    media: {
      kind: "floppy",
      url: "/disks/crimson-crown.dsk",
      format: "dsk",
      drive2Url: "/disks/crimson-crown-b.dsk",
    },
    size: "2×140K floppy",
    license: "Freeware — Polarware / Antonio Antiochia",
    tags: ["adventure", "hi-res", "penguin"],
  },
  {
    id: "ootopos",
    name: "Oo-Topos",
    category: "Games",
    year: 1986,
    author: "Mike Berlyn",
    summary:
      "Berlyn’s sci-fi adventure, rebuilt with Comprehend graphics. Crash-landed, alien, the Infocom guy before Infocom.",
    play: "Parser. Flip D1, or side B is already in drive 2.",
    media: {
      kind: "floppy",
      url: "/disks/ootopos.dsk",
      format: "dsk",
      drive2Url: "/disks/ootopos-b.dsk",
    },
    size: "2×140K floppy",
    license: "Freeware — Polarware / Mike Berlyn",
    tags: ["adventure", "hi-res", "penguin"],
  },
  {
    id: "expedition-amazon",
    name: "Expedition Amazon",
    category: "Games",
    year: 1983,
    author: "Willard Phillips",
    summary:
      "Party RPG in the jungle. Not Ultima, not Wizardry — the one the Penguin kids actually owned.",
    play: "Build a party. Flip D1, or side B is already in drive 2.",
    media: {
      kind: "floppy",
      url: "/disks/expedition-amazon.dsk",
      format: "dsk",
      drive2Url: "/disks/expedition-amazon-b.dsk",
    },
    size: "2×140K floppy",
    license: "Freeware — Penguin Software / Polarware",
    tags: ["rpg", "penguin"],
  },
  {
    id: "pensate",
    name: "Pensate",
    category: "Games",
    year: 1983,
    author: "John Besnard",
    summary:
      "Abstract board combat — chess-adjacent, othello-adjacent, entirely its own. For when the arcade fried your nerves.",
    play: "Keyboard. Think before you move.",
    media: { kind: "floppy", url: "/disks/pensate.dsk", format: "dsk" },
    size: "140K floppy",
    license: "Freeware — Penguin Software / Polarware",
    tags: ["strategy", "penguin"],
  },
  {
    id: "applevision",
    name: "Apple-Vision",
    category: "Games",
    year: 1979,
    author: "Apple Computer",
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
    category: "Games",
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
    category: "Games",
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
    category: "Games",
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
    category: "Games",
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
    category: "Games",
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
    category: "Games",
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
    category: "Games",
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
    category: "Games",
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
    category: "Games",
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
    category: "Games",
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
    category: "Games",
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
    category: "Apps",
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
    category: "Apps",
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
    category: "Apps",
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
    category: "Apps",
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
    category: "Games",
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
      "Apple’s 16-sector DOS. CATALOG, RUN, BRUN, SAVE. Brick Out and Animals live on this disk too.",
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
    category: "System",
    summary: "Finder-like desktop for ProDOS 8. Tight on a 5.25\" disk.",
    media: { kind: "floppy", url: "/disks/a2desktop-disk1.po", format: "po" },
    size: "140K floppy",
    license: "GPL-3.0 — a2stuff/a2d",
    tags: ["gui", "prodos"],
  },
  {
    id: "a2desktop-800",
    name: "A2DeskTop 1.5 (800K)",
    category: "System",
    summary: "Full DeskTop with accessories on an 800K SmartPort volume.",
    media: { kind: "block", url: "/disks/a2desktop.2mg", format: "2mg" },
    size: "800K SmartPort",
    license: "GPL-3.0 — a2stuff/a2d",
    tags: ["gui", "prodos"],
  },
  {
    id: "a2osx",
    name: "A2osX (140K)",
    category: "System",
    summary: "Unix-like kernel and shell for the Apple IIe.",
    media: { kind: "floppy", url: "/disks/a2osx.po", format: "po" },
    size: "140K floppy",
    license: "FOSS — A2osX",
    tags: ["unix"],
  },
  {
    id: "a2osx-800",
    name: "A2osX (800K)",
    category: "System",
    summary: "Larger A2osX volume on SmartPort.",
    media: { kind: "block", url: "/disks/a2osx-800.po", format: "po" },
    size: "800K SmartPort",
    license: "FOSS — A2osX",
    tags: ["unix"],
  },
  {
    id: "contiki",
    name: "Contiki",
    category: "System",
    summary: "Lightweight GUI OS with TCP/IP, built for 8-bit machines.",
    media: { kind: "floppy", url: "/disks/contiki.dsk", format: "dsk" },
    size: "140K floppy",
    license: "BSD — contiki-os",
    tags: ["network", "gui"],
  },
  {
    id: "contiki-po",
    name: "Contiki (ProDOS 800K)",
    category: "System",
    summary: "Contiki on a ProDOS-order SmartPort image.",
    media: { kind: "block", url: "/disks/contiki.po", format: "po" },
    size: "800K SmartPort",
    license: "BSD — contiki-os",
    tags: ["network"],
  },
  {
    id: "plasma",
    name: "PLASMA",
    category: "System",
    summary: "Portable, lightweight assembler / VM language for the Apple II.",
    media: { kind: "floppy", url: "/disks/plasma-sys.po", format: "po" },
    size: "140K floppy",
    license: "FOSS — PLASMA",
    tags: ["language"],
  },
  {
    id: "plforth",
    name: "PLFORTH",
    category: "System",
    summary: "FORTH environment on the PLASMA runtime.",
    media: { kind: "floppy", url: "/disks/plforth.po", format: "po" },
    size: "140K floppy",
    license: "FOSS — PLFORTH",
    tags: ["language", "forth"],
  },
  {
    id: "audit",
    name: "Apple II Audit",
    category: "System",
    summary: "Hardware self-test and ROM identification.",
    media: { kind: "json", url: "/json/disks/audit.json" },
    size: "140K floppy",
    license: "FOSS utility",
    tags: ["utility"],
  },
  {
    id: "blank-dos",
    name: "Blank DOS 3.3",
    category: "System",
    summary: "Writable DOS 3.3 floppy. Type a program, then SAVE HELLO.",
    play: "DOS is in RAM. Type a program, SAVE HELLO, then Save D1 into Mine.",
    media: { kind: "json", url: "/json/disks/dos33master.json" },
    bootSteps: [{ wait: "]", type: "NEW" }],
    size: "140K floppy",
    license: "Blank image",
    tags: ["blank"],
  },
  {
    id: "blank-prodos",
    name: "Blank ProDOS",
    category: "System",
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
    if (!q && category !== "All" && title.category !== category) {
      return false;
    }
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
