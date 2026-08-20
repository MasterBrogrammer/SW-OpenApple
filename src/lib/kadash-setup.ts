import type DiskII from "js/cards/disk2";
import type { Apple2 as Apple2Class } from "js/apple2";
import { asset } from "@/lib/asset";
import { screenText, waitForText } from "@/lib/boot-exec";
import { useEmu } from "@/lib/emu-store";
import type { JSONDisk } from "js/formats/types";

function sleep(ms: number) {
  return new Promise<void>((resolve) => window.setTimeout(resolve, ms));
}

function tap(apple2: Apple2Class, ch: string) {
  const io = apple2.getIO();
  const code = ch.charCodeAt(0) & 0x7f;
  io.keyDown(code);
  window.setTimeout(() => io.keyUp(), 50);
}

function spinning() {
  const s = useEmu.getState();
  return s.drive1On || s.drive2On;
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(asset(url));
  if (!res.ok) throw new Error(`character disk template failed (${res.status})`);
  return res.json() as Promise<T>;
}

async function mountBlank(disk2: DiskII, drive: 1 | 2) {
  const raw = await fetchJson<JSONDisk & { writeProtected?: boolean }>(
    "/json/disks/blank_dos33.json",
  );
  const ok = disk2.setDisk(drive, { ...raw, readOnly: false });
  if (!ok) throw new Error("Could not mount a blank disk");
}

async function mountGame(
  disk2: DiskII,
  drive: 1 | 2,
  name: string,
  format: string,
  data: ArrayBuffer,
) {
  await disk2.setBinary(drive, name, format as "dsk", data);
}

async function fetchBuffer(url: string): Promise<ArrayBuffer | null> {
  try {
    const res = await fetch(asset(url));
    if (!res.ok) return null;
    return res.arrayBuffer();
  } catch {
    return null;
  }
}

function snapshotDrive(disk2: DiskII, drive: 1 | 2): JSONDisk | null {
  try {
    const json = disk2.getJSON(drive);
    return typeof json === "string" ? (JSON.parse(json) as JSONDisk) : (json as JSONDisk);
  } catch {
    return null;
  }
}

type KadashArgs = {
  apple2: Apple2Class;
  disk2: DiskII;
  gameName: string;
  gameFormat: string;
  gameBuf: ArrayBuffer;
  isCancelled: () => boolean;
  onStatus: (status: string) => void;
};

/**
 * Polarware Kadash: title → A/B menu. A loads the copier from the *game*
 * disk, then asks for a blank character disk. We keep the master in D1
 * until A is in RAM, then 1-drive-swap on the INSERT prompts.
 */
export async function setupKadashCharacter(args: KadashArgs): Promise<void> {
  const { apple2, disk2, gameName, gameFormat, gameBuf, isCancelled, onStatus } =
    args;

  onStatus("Waiting for Kadash…");
  await waitForText(apple2, "PENGUIN SOFTWARE PRESENTS", isCancelled, 16000);
  if (isCancelled()) return;

  const idleUntil = Date.now() + 19000;
  while (Date.now() < idleUntil) {
    if (isCancelled()) return;
    if (screenText(apple2).toUpperCase().includes("CREATE A CHARACTER")) break;
    await sleep(80);
  }
  if (!screenText(apple2).toUpperCase().includes("CREATE A CHARACTER")) {
    apple2.getIO().keyUp();
    await sleep(80);
    tap(apple2, " ");
    await waitForText(apple2, "CREATE A CHARACTER", isCancelled, 8000);
  }
  if (isCancelled()) return;
  if (!screenText(apple2).toUpperCase().includes("CREATE A CHARACTER")) {
    onStatus("Kadash menu never came up — press A or B on the CRT");
    return;
  }

  onStatus("Creating a character disk…");
  apple2.getIO().keyUp();
  await sleep(500);
  tap(apple2, "A");
  await sleep(600);
  {
    const text = screenText(apple2).toUpperCase();
    if (
      text.includes("READYING THE SACRED FORTRESS") ||
      (text.includes("INSERT") && text.includes("MASTER") && !text.includes("SWORDSMEN"))
    ) {
      apple2.getIO().keyDown(0x1b);
      window.setTimeout(() => apple2.getIO().keyUp(), 50);
      await waitForText(apple2, "CREATE A CHARACTER", isCancelled, 6000);
      await sleep(400);
      tap(apple2, "A");
    }
  }

  const start = Date.now();
  let last = "";
  let char: JSONDisk | null = null;
  let d1IsGame = true;

  while (Date.now() - start < 50000) {
    if (isCancelled()) return;
    const text = screenText(apple2).toUpperCase();

    if (
      (text.includes("DIFFICULTY LEVEL") || text.includes("SWORDSMEN")) &&
      last !== "diff"
    ) {
      tap(apple2, "2");
      last = "diff";
      onStatus("Picking Warrior…");
    } else if (text.includes("1 OR 2 DRIVES") && last !== "drives") {
      tap(apple2, "1");
      last = "drives";
      onStatus("Copying (one drive) — swapping disks…");
    } else if (text.includes("INSERT MASTER") && last !== "master") {
      const sideB = await fetchBuffer("/disks/sword-of-kadash-b.dsk");
      if (sideB) await mountGame(disk2, 1, "Kadash B", gameFormat, sideB);
      else await mountGame(disk2, 1, gameName, gameFormat, gameBuf);
      d1IsGame = true;
      await sleep(200);
      tap(apple2, " ");
      last = "master";
    } else if (
      (text.includes("INSERT CHARACTER") || text.includes("DRIVE1: COPY")) &&
      last !== "char"
    ) {
      if (!d1IsGame) char = snapshotDrive(disk2, 1) ?? char;
      if (char) disk2.setDisk(1, { ...char, readOnly: false });
      else await mountBlank(disk2, 1);
      d1IsGame = false;
      await sleep(200);
      tap(apple2, " ");
      last = "char";
    } else if (
      (text.includes("INSERT PROGRAM") || text.includes("DRIVE2: MASTER")) &&
      last !== "prog"
    ) {
      if (!d1IsGame) char = snapshotDrive(disk2, 1) ?? char;
      await mountGame(disk2, 1, gameName, gameFormat, gameBuf);
      d1IsGame = true;
      await sleep(200);
      tap(apple2, " ");
      last = "prog";
    } else if (text.includes("ILLEGAL CHARACTER")) {
      onStatus("Character disk rejected — inserting a blank");
      await mountBlank(disk2, 1);
      d1IsGame = false;
      tap(apple2, " ");
      last = "char";
    } else if (
      last !== "" &&
      last !== "menu" &&
      text.includes("CREATE A CHARACTER") &&
      text.includes("ENTER THE FORTRESS") &&
      !text.includes("1 OR 2 DRIVES") &&
      !spinning()
    ) {
      if (!d1IsGame) char = snapshotDrive(disk2, 1) ?? char;
      last = "menu";
      break;
    } else if (text.includes("ESC TO COPY AGAIN") && last === "drives") {
      if (!d1IsGame) char = snapshotDrive(disk2, 1) ?? char;
      tap(apple2, " ");
      last = "copied";
      break;
    }

    if (spinning()) onStatus("Copying the character disk…");
    await sleep(140);
  }

  if (isCancelled()) return;

  await mountGame(disk2, 1, gameName, gameFormat, gameBuf);
  d1IsGame = true;
  if (char) disk2.setDisk(2, { ...char, readOnly: false });
  else await mountBlank(disk2, 2);
  useEmu.getState().setLoaded("sword-of-kadash", {
    d1: "Kadash",
    d2: "Character",
  });

  if (last !== "copied" && last !== "menu") {
    onStatus("Kadash menu is up — A creates a character, B enters the fortress");
    return;
  }

  await sleep(300);
  if (!screenText(apple2).toUpperCase().includes("ENTER THE FORTRESS")) {
    tap(apple2, " ");
    await waitForText(apple2, "ENTER THE FORTRESS", isCancelled, 6000);
  }
  if (isCancelled()) return;

  onStatus("Entering the fortress…");
  tap(apple2, "B");

  const enterUntil = Date.now() + 18000;
  last = "fortress";
  while (Date.now() < enterUntil) {
    if (isCancelled()) return;
    const text = screenText(apple2).toUpperCase();
    if (text.includes("INSERT CHARACTER") && last !== "char") {
      if (char) disk2.setDisk(1, { ...char, readOnly: false });
      else await mountBlank(disk2, 1);
      d1IsGame = false;
      tap(apple2, " ");
      last = "char";
    } else if (text.includes("INSERT PROGRAM") && last !== "prog") {
      await mountGame(disk2, 1, gameName, gameFormat, gameBuf);
      d1IsGame = true;
      tap(apple2, " ");
      last = "prog";
    } else if (
      text.includes("READYING THE SACRED FORTRESS") ||
      text.includes("YOU STAND BEFORE")
    ) {
      break;
    }
    await sleep(140);
  }

  await mountGame(disk2, 1, gameName, gameFormat, gameBuf);
  if (char) disk2.setDisk(2, { ...char, readOnly: false });
}
