import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  Contrast,
  ArrowLeftRight,
  FlipVertical2,
  Monitor,
  Power,
  Pause,
  PictureInPicture2,
  Play,
  RotateCcw,
  Save,
  ScanLine,
  Volume2,
  VolumeX,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SoftKeyboard } from "@/components/soft-keyboard";
import { WozModeBadge } from "@/components/wozmode-badge";
import { runBootSteps, screenText, type BootStep } from "@/lib/boot-exec";
import { readPrompt } from "@/lib/boot-parse";
import { BOOT_WITH, floppySides, getTitle, type Title } from "@/lib/catalog";
import { createDiskAudio, resumeAllAudio, type DiskAudio } from "@/lib/disk-audio";
import {
  attachPopout,
  bindPopoutMachine,
  openCrtPopout,
  popoutWindow,
  stopPopout,
} from "@/lib/crt-popout";
import { useEmu } from "@/lib/emu-store";
import { pushRecent, readVolume, writeVolume } from "@/lib/local-prefs";
import {
  applyPaddles,
  notePaddleNorm,
  notePointerOnCanvas,
  resetPaddlePointer,
} from "@/lib/paddle-input";
import {
  getUserDiskBytes,
  parseUserTitleId,
  saveUserDisk,
  userTitleId,
} from "@/lib/user-disks";
import { asset } from "@/lib/asset";
import { cn } from "@/lib/utils";
import type DiskII from "js/cards/disk2";
import type SmartPort from "js/cards/smartport";
import type { Apple2 as Apple2Class } from "js/apple2";
import type Apple2IO from "js/apple2io";
import type { JSONDisk } from "js/formats/types";
import type { Card } from "js/types";
import { initGamepad } from "js/ui/gamepad";

/** Empty slot that returns 0, not random bytes. Autostart skips it. */
const emptySlot: Card = {
  read: () => 0,
  write: () => {},
  ioSwitch: () => 0,
  getState: () => null,
  setState: () => {},
};

type Machine = {
  apple2: Apple2Class;
  disk2: DiskII;
  smartport: SmartPort;
  audio: AudioHandle;
  diskSfx: DiskAudio;
};

type AudioHandle = {
  resume: () => void;
  reattach: (win: Window) => void;
  setMuted: (muted: boolean) => void;
  setVolume: (level: number) => void;
  close: () => void;
};

let loadGeneration = 0;

type DriveSlot = {
  format: "dsk" | "po" | "do" | "nib" | "woz";
  nameA: string;
  nameB: string;
  a: ArrayBuffer;
  b: ArrayBuffer;
  side: "a" | "b";
};

const driveSlots: { 1: DriveSlot | null; 2: DriveSlot | null } = {
  1: null,
  2: null,
};

function clearDriveSlots() {
  driveSlots[1] = null;
  driveSlots[2] = null;
  mountedDisk[1] = null;
  mountedDisk[2] = null;
  const emu = useEmu.getState();
  emu.setDriveFace(1, { name: emu.drive1Name, side: null, flip: false });
  emu.setDriveFace(2, { name: emu.drive2Name, side: null, flip: false });
}

type MountedDisk =
  | {
      kind: "binary";
      name: string;
      format: "dsk" | "po" | "do" | "nib" | "woz";
      data: ArrayBuffer;
    }
  | { kind: "json"; name: string; data: JSONDisk };

const mountedDisk: { 1: MountedDisk | null; 2: MountedDisk | null } = {
  1: null,
  2: null,
};

async function applyMounted(machine: Machine, n: 1 | 2, disk: MountedDisk) {
  if (disk.kind === "binary") {
    await machine.disk2.setBinary(n, disk.name, disk.format, disk.data.slice(0));
  } else {
    machine.disk2.setDisk(n, { ...disk.data, readOnly: false });
  }
  mountedDisk[n] = disk;
}

function sleep(ms: number) {
  return new Promise<void>((resolve) => window.setTimeout(resolve, ms));
}

function tapAscii(machine: Machine, code: number) {
  const io = machine.apple2.getIO();
  io.keyDown(code);
  window.setTimeout(() => io.keyUp(), 80);
}

async function swapDrives(machine: Machine) {
  const a = mountedDisk[1];
  const b = mountedDisk[2];
  if (!a || !b) {
    useEmu.getState().setStatus("Nothing to swap — both drives need a disk");
    return;
  }
  resumeAllAudio();
  await applyMounted(machine, 1, b);
  await applyMounted(machine, 2, a);
  const s1 = driveSlots[1];
  driveSlots[1] = driveSlots[2];
  driveSlots[2] = s1;
  const emu = useEmu.getState();
  emu.setDriveFace(1, {
    name: b.name,
    side: driveSlots[1]?.side ?? null,
    flip: Boolean(driveSlots[1]),
  });
  emu.setDriveFace(2, {
    name: a.name,
    side: driveSlots[2]?.side ?? null,
    flip: Boolean(driveSlots[2]),
  });
  emu.setStatus(`D1 ${b.name}, D2 ${a.name} — click the CRT, then Space`);
  (
    document.querySelector("canvas.apple-screen") as HTMLCanvasElement | null
  )?.focus();
}

function copyDiskBytes(data: ArrayBuffer | Uint8Array): ArrayBuffer {
  if (data instanceof Uint8Array) {
    const out = new Uint8Array(data.byteLength);
    out.set(data);
    return out.buffer;
  }
  return data.slice(0);
}

function diskSlug(name: string) {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 28);
  return slug || "saved-disk";
}

async function saveDrive1(machine: Machine) {
  const emu = useEmu.getState();
  try {
    let packed = null as Awaited<ReturnType<Machine["disk2"]["getBinary"]>>;
    try {
      packed = await machine.disk2.getBinary(1, "dsk");
    } catch {
      packed = await machine.disk2.getBinary(1);
    }
    if (!packed?.data) {
      emu.setStatus("D1 is empty — insert a floppy first");
      return;
    }
    const ext =
      packed.ext === "po" || packed.ext === "do" || packed.ext === "nib"
        ? packed.ext
        : "dsk";
    const name = emu.drive1Name && emu.drive1Name !== "Empty" ? emu.drive1Name : "Saved disk";
    const userId = emu.loadedId ? parseUserTitleId(emu.loadedId) : null;
    const saved = await saveUserDisk({
      id: userId ?? undefined,
      name,
      filename: `${diskSlug(name)}.${ext}`,
      bytes: copyDiskBytes(packed.data as ArrayBuffer | Uint8Array),
      format: ext,
      kind: "floppy",
    });
    emu.setDiskDirty(false);
    emu.setLoaded(userTitleId(saved.id), {
      d1: saved.name,
      d2: emu.drive2Name,
    });
    emu.setStatus(`D1 written to Mine as ${saved.name}`);
    window.dispatchEvent(
      new CustomEvent("oa-disk-saved", {
        detail: { id: saved.id, name: saved.name },
      }),
    );
  } catch (err) {
    emu.setStatus(err instanceof Error ? err.message : "Could not encode D1");
  }
}

let kadashHelp = "";
let kadashHelpTimer: number | null = null;
let kadashGame: MountedDisk | null = null;
let kadashMaster: MountedDisk | null = null;

function stopKadashDiskHelp() {
  if (kadashHelpTimer != null) {
    window.clearInterval(kadashHelpTimer);
    kadashHelpTimer = null;
  }
  kadashHelp = "";
}

function cloneMounted(disk: MountedDisk, name: string): MountedDisk {
  if (disk.kind === "binary") {
    return { kind: "binary", name, format: disk.format, data: disk.data.slice(0) };
  }
  return { kind: "json", name, data: { ...disk.data } };
}

function labelDrives(d1: string, d2: string) {
  useEmu.getState().setDriveFace(1, { name: d1, side: null, flip: false });
  useEmu.getState().setDriveFace(2, { name: d2, side: null, flip: false });
}

/** Polarware: copy side 2 (master character) onto a blank in D1. */
async function arrangeKadashCopier(machine: Machine) {
  if (!kadashGame) return;
  const copy = cloneMounted(kadashGame, "Copy");
  const master = kadashMaster ?? kadashGame;
  await applyMounted(machine, 1, copy);
  await applyMounted(machine, 2, master);
  labelDrives("Copy", "Master");
  useEmu.getState().setStatus("D1 Copy, D2 Master character (side 2) — click CRT, Space");
}

async function arrangeKadashCharacter(machine: Machine) {
  const char = cloneMounted(kadashMaster ?? kadashGame!, "Character");
  if (kadashGame) await applyMounted(machine, 2, kadashGame);
  await applyMounted(machine, 1, char);
  labelDrives("Character", kadashGame?.name ?? "Kadash");
}

async function arrangeKadashProgram(machine: Machine) {
  if (!kadashGame) return;
  const char =
    mountedDisk[1]?.name === "Character" || mountedDisk[1]?.name === "Copy"
      ? mountedDisk[1]
      : mountedDisk[2];
  await applyMounted(machine, 1, kadashGame);
  if (char) await applyMounted(machine, 2, char);
  labelDrives(kadashGame.name, char?.name ?? "Character");
}

function startKadashDiskHelp(machine: Machine, gen: number) {
  stopKadashDiskHelp();
  kadashHelpTimer = window.setInterval(() => {
    void (async () => {
      if (gen !== loadGeneration) {
        stopKadashDiskHelp();
        return;
      }
      if (useEmu.getState().loadedId !== "sword-of-kadash") return;
      let text = "";
      try {
        text = machine.apple2.getVideoModes().getText().toUpperCase();
      } catch {
        return;
      }
      if (text.includes("DRIVE1: COPY") && text.includes("DRIVE2: MASTER")) {
        if (kadashHelp !== "copier") {
          kadashHelp = "copier";
          useEmu
            .getState()
            .setStatus("Copier can't read this side-2 dump — press Esc, then B");
          tapAscii(machine, 0x1b);
        }
        return;
      }
      if (text.includes("DISK ERROR")) {
        if (kadashHelp !== "error") {
          kadashHelp = "error";
          tapAscii(machine, 0x20);
        }
        return;
      }
      if (text.includes("INSERT CHARACTER") || text.includes("INSERT MASTER")) {
        if (kadashHelp !== "char") {
          kadashHelp = "char";
          await arrangeKadashCharacter(machine);
          window.setTimeout(() => tapAscii(machine, 0x20), 300);
        }
        return;
      }
      if (text.includes("INSERT PROGRAM")) {
        if (kadashHelp !== "prog") {
          kadashHelp = "prog";
          await arrangeKadashProgram(machine);
          window.setTimeout(() => tapAscii(machine, 0x20), 300);
        }
        return;
      }
      if (text.includes("DISK ERROR")) {
        kadashHelp = "error";
        return;
      }
      if (kadashHelp === "error" || kadashHelp === "copier") {
        /* stay until a new prompt */
      } else if (
        !text.includes("INSERT") &&
        !text.includes("DRIVE1: COPY")
      ) {
        kadashHelp = "";
      }
    })();
  }, 700);
}

async function flipDrive(machine: Machine, n: 1 | 2) {
  const slot = driveSlots[n];
  if (!slot) return;
  const next = slot.side === "a" ? "b" : "a";
  const buf = next === "a" ? slot.a : slot.b;
  const name = next === "a" ? slot.nameA : slot.nameB;
  resumeAllAudio();
  await machine.disk2.setBinary(n, name, slot.format, buf.slice(0));
  slot.side = next;
  useEmu.getState().setDriveFace(n, { name, side: next, flip: true });
  useEmu.getState().setStatus(
    `D${n} now side ${next.toUpperCase()} — click the CRT, then press Space`,
  );
  (
    document.querySelector("canvas.apple-screen") as HTMLCanvasElement | null
  )?.focus();
}

declare global {
  interface Window {
    __oa?: Machine;
    __oaInput?: {
      keyDown: (code: number) => void;
      keyUp: () => void;
      buttonDown: (n: number) => void;
      buttonUp: (n: number) => void;
      pointer: (x: number, y: number) => void;
    };
  }
}

function bindOpenerInput(machine: Machine | null) {
  if (!machine) {
    delete window.__oaInput;
    return;
  }
  window.__oaInput = {
    keyDown: (code) => machine.apple2.getIO().keyDown(code),
    keyUp: () => machine.apple2.getIO().keyUp(),
    buttonDown: (n) => machine.apple2.getIO().buttonDown(n as 0 | 1),
    buttonUp: (n) => machine.apple2.getIO().buttonUp(n as 0 | 1),
    pointer: (x, y) => notePaddleNorm(x, y),
  };
}

export function EmulatorScreen() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const machineRef = useRef<Machine | null>(null);
  const popoutRef = useRef<Window | null>(null);
  const popoutCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [poppedOut, setPoppedOut] = useState(false);
  const pending = useEmu((s) => s.pendingLoad);
  const pendingNonce = pending?.nonce ?? 0;
  const paused = useEmu((s) => s.paused);
  const color = useEmu((s) => s.color);
  const scanlines = useEmu((s) => s.scanlines);
  const invert = useEmu((s) => s.invert);
  const muted = useEmu((s) => s.muted);
  const volume = useEmu((s) => s.volume);
  const focused = useEmu((s) => s.focused);
  const drive1On = useEmu((s) => s.drive1On);
  const drive2On = useEmu((s) => s.drive2On);
  const drive1Name = useEmu((s) => s.drive1Name);
  const drive2Name = useEmu((s) => s.drive2Name);
  const drive1Side = useEmu((s) => s.drive1Side);
  const drive2Side = useEmu((s) => s.drive2Side);
  const drive1Flip = useEmu((s) => s.drive1Flip);
  const drive2Flip = useEmu((s) => s.drive2Flip);
  const paddleAxis = useEmu((s) => s.paddleAxis);
  const status = useEmu((s) => s.status);
  const loadedId = useEmu((s) => s.loadedId);
  const loadingId = useEmu((s) => s.loadingId);
  const booted = useEmu((s) => s.booted);
  const bootPhase = useEmu((s) => s.bootPhase);
  const diskDirty = useEmu((s) => s.diskDirty);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let cancelled = false;

    void boot(canvas)
      .then(async (machine) => {
        if (cancelled) {
          teardown(machine);
          return;
        }
        machineRef.current = machine;
        window.__oa = machine;
        bindOpenerInput(machine);
        const vol = readVolume();
        useEmu.getState().setVolume(vol);
        machine.audio.setVolume(vol / 100);
        machine.diskSfx.setVolume(vol / 100);
        bindPopoutMachine(() => machineRef.current);
        const live = popoutWindow();
        if (live) {
          const c = live.document.querySelector("canvas.apple-screen");
          if (c && c.nodeName === "CANVAS") {
            attachPopout(live, c as HTMLCanvasElement);
            setPoppedOut(true);
          }
        }
        const want =
          useEmu.getState().pendingLoad?.id ??
          useEmu.getState().loadedId ??
          "applesoft";
        await loadTitle(machine, want, canvas);
        useEmu.getState().setBooted(true);
        canvas.focus();
        useEmu.getState().setFocused(true);
      })
      .catch((err) => {
        console.error(err);
        useEmu.getState().setStatus(
          err instanceof Error ? err.message : "The IIe failed to power on",
        );
      });

    return () => {
      cancelled = true;
      useEmu.getState().setBooted(false);
      if (machineRef.current) {
        teardown(machineRef.current);
        machineRef.current = null;
      }
      if (window.__oa) delete window.__oa;
      bindOpenerInput(null);
    };
  }, []);

  useEffect(() => {
    if (!booted || !pending) return;
    const machine = machineRef.current;
    const canvas = canvasRef.current;
    if (!machine) return;
    void loadTitle(machine, pending.id, canvas);
  }, [pendingNonce, booted, pending]);

  useEffect(() => {
    const machine = machineRef.current;
    if (!machine) return;
    if (paused) machine.apple2.stop();
    else machine.apple2.run();
  }, [paused]);

  useEffect(() => {
    machineRef.current?.apple2.getVideoModes().mono(!color);
  }, [color]);

  useEffect(() => {
    machineRef.current?.apple2.getVideoModes().scanlines(scanlines);
  }, [scanlines]);

  useEffect(() => {
    machineRef.current?.audio.setMuted(muted);
    machineRef.current?.diskSfx.setMuted(muted);
  }, [muted]);

  useEffect(() => {
    const level = volume / 100;
    machineRef.current?.audio.setVolume(level);
    machineRef.current?.diskSfx.setVolume(level);
  }, [volume]);

  useEffect(() => {
    const win = popoutRef.current;
    if (!win || win.closed) return;
    win.postMessage(
      {
        type: "oa-display-style",
        color,
        scanlines,
        invert,
      },
      window.location.origin,
    );
  }, [color, scanlines, invert, poppedOut]);


  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (!useEmu.getState().focused) return;
      const machine = machineRef.current;
      if (!machine) return;
      if (event.ctrlKey && (event.key === "Delete" || event.key === "F12")) {
        event.preventDefault();
        machine.apple2.reset();
        return;
      }
      const code = mapKey(event);
      if (code == null) return;
      event.preventDefault();
      machine.apple2.getIO().keyDown(code);
      if (event.metaKey || event.getModifierState("OS")) {
        machine.apple2.getIO().buttonDown(0);
      }
      if (event.altKey) {
        machine.apple2.getIO().buttonDown(1);
      }
    }
    function onKeyUp() {
      const io = machineRef.current?.apple2.getIO();
      if (!io) return;
      io.keyUp();
      io.buttonUp(0);
      io.buttonUp(1);
    }
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  function hostAudio(win: Window) {
    const m = machineRef.current;
    m?.audio.reattach(win);
    m?.diskSfx.reattach(win);
  }

  function dockDisplay() {
    const win = popoutRef.current;
    stopPopout();
    hostAudio(window);
    popoutCanvasRef.current = null;
    if (win && !win.closed) {
      try {
        win.postMessage({ type: "oa-display-close" }, window.location.origin);
        win.close();
      } catch {
        /* */
      }
    }
    popoutRef.current = null;
    setPoppedOut(false);
  }

  function popOutDisplay() {
    resumeAllAudio();
    if (popoutRef.current && !popoutRef.current.closed) {
      popoutRef.current.focus();
      return;
    }
    const win = openCrtPopout();
    if (!win) {
      useEmu.getState().setStatus("Allow pop-ups to pop out the CRT");
      return;
    }
    popoutRef.current = win;
    const origin = window.location.origin;
    const onMsg = (event: MessageEvent) => {
      if (event.origin !== origin) return;
      const type = (event.data as { type?: string } | null)?.type;
      if (type === "oa-display-ready") {
        const attach = () => {
          const canvas = win.document.querySelector("canvas.apple-screen");
          if (!canvas || canvas.nodeName !== "CANVAS") return false;
          popoutCanvasRef.current = canvas as HTMLCanvasElement;
          bindPopoutMachine(() => machineRef.current);
          attachPopout(win, canvas as HTMLCanvasElement);
          win.postMessage(
            {
              type: "oa-display-style",
              color: useEmu.getState().color,
              scanlines: useEmu.getState().scanlines,
              invert: useEmu.getState().invert,
            },
            origin,
          );
          return true;
        };
        if (!attach()) {
          let tries = 0;
          const retry = window.setInterval(() => {
            tries += 1;
            if (attach() || tries > 40) window.clearInterval(retry);
          }, 50);
        }
        setPoppedOut(true);
      }
      if (type === "oa-display-gone") {
        window.removeEventListener("message", onMsg);
        stopPopout();
        hostAudio(window);
        popoutCanvasRef.current = null;
        popoutRef.current = null;
        setPoppedOut(false);
      }
    };
    window.addEventListener("message", onMsg);
    const poll = window.setInterval(() => {
      if (!popoutRef.current || popoutRef.current.closed) {
        window.clearInterval(poll);
        window.removeEventListener("message", onMsg);
        stopPopout();
        hostAudio(window);
        popoutCanvasRef.current = null;
        popoutRef.current = null;
        setPoppedOut(false);
      }
    }, 400);
    win.addEventListener("load", () => {
      win.document.title = "SW-OpenApple display";
    });
  }

  const emuStatus = booted && loadedId ? "ready" : booted ? "on" : "loading";

  return (
    <section
      className="flex h-full min-h-0 flex-col rounded-lg bg-surface p-3 shadow-[var(--shadow-border)] sm:p-4"
      data-loaded-id={loadedId ?? ""}
      data-emu-status={emuStatus}
      data-boot-phase={bootPhase}
    >
      <div className="flex min-h-0 flex-1">
      <div className="screen-stage min-w-0 flex-1">
        <div
          className={cn(
            "screen-bezel rounded-md",
            scanlines && "scanlines",
          )}
        >
        <canvas
          ref={canvasRef}
          width={560}
          height={384}
          tabIndex={0}
          className={cn(
            "apple-screen h-full w-full outline-none",
            !color && "mono",
            invert && "invert",
          )}
          onFocus={() => useEmu.getState().setFocused(true)}
          onBlur={() => useEmu.getState().setFocused(false)}
          onPointerMove={(event) => {
            const machine = machineRef.current;
            const canvas = canvasRef.current;
            if (!machine || !canvas) return;
            notePointerOnCanvas(event.clientX, event.clientY, canvas);
            applyPaddles(machine.apple2.getIO(), useEmu.getState().paddleAxis);
          }}
          onPointerDown={(event) => {
            event.preventDefault();
            const canvas = canvasRef.current;
            const machine = machineRef.current;
            canvas?.focus();
            canvas?.setPointerCapture(event.pointerId);
            machine?.audio.resume();
            machine?.diskSfx.resume();
            if (canvas && machine) {
              notePointerOnCanvas(event.clientX, event.clientY, canvas);
              applyPaddles(machine.apple2.getIO(), useEmu.getState().paddleAxis);
            }
            machine?.apple2.getIO().buttonDown(event.button === 0 ? 0 : 1);
          }}
          onPointerUp={(event) => {
            machineRef.current?.apple2.getIO().buttonUp(event.button === 0 ? 0 : 1);
          }}
          onContextMenu={(event) => event.preventDefault()}
          onClick={() => {
            canvasRef.current?.focus();
            machineRef.current?.audio.resume();
            machineRef.current?.diskSfx.resume();
          }}
        />
        {!focused ? (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-end p-3">
            <span className="rounded-md px-2 py-1 font-mono text-[11px] text-accent/90">
              Click to type
            </span>
          </div>
        ) : null}
        </div>
      </div>
      <aside className="flex w-20 shrink-0 items-end justify-center pb-1 pl-1 sm:w-24">
        <WozModeBadge />
      </aside>
      </div>

      <div className="mt-3 flex shrink-0 flex-col gap-2">
        <div className="flex flex-wrap items-center gap-3">
          <DriveBay
            n={1}
            on={drive1On}
            name={drive1Name}
            side={drive1Side}
            flip={drive1Flip}
            onFlip={() => {
              const machine = machineRef.current;
              if (machine) void flipDrive(machine, 1);
            }}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 px-2"
            title="Swap the disks in D1 and D2"
            aria-label="Swap disks"
            onClick={() => {
              const machine = machineRef.current;
              if (machine) void swapDrives(machine);
            }}
          >
            <ArrowLeftRight className="size-3.5" />
            Swap
          </Button>
          <DriveBay
            n={2}
            on={drive2On}
            name={drive2Name}
            side={drive2Side}
            flip={drive2Flip}
            onFlip={() => {
              const machine = machineRef.current;
              if (machine) void flipDrive(machine, 2);
            }}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 px-2"
            title="Boot a writable blank DOS 3.3 floppy in D1"
            onClick={() => {
              resumeAllAudio();
              useEmu.getState().requestLoad("blank-dos");
            }}
          >
            Blank
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className={cn(
              "h-8 px-2",
              diskDirty && "text-accent shadow-[inset_0_0_0_1px_var(--color-accent)]",
            )}
            title={
              diskDirty
                ? "D1 has writes — save into Mine"
                : "Save D1 into Mine"
            }
            disabled={drive1Name === "Empty"}
            onClick={() => {
              const machine = machineRef.current;
              if (machine) void saveDrive1(machine);
            }}
          >
            <Save className="size-3.5" />
            {diskDirty ? "Save D1 ·" : "Save D1"}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="ml-auto"
            onClick={() => useEmu.getState().requestEject()}
          >
            <Power className="size-3.5" />
            Eject / reset
          </Button>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="mr-1 text-[10px] tracking-wide text-muted uppercase">
            Boot with
          </span>
          {BOOT_WITH.map((os) => {
            const active =
              os.id === "applesoft"
                ? loadedId === null && bootPhase === "running"
                : loadedId === os.id;
            return (
              <button
                key={os.id}
                type="button"
                data-boot-with={os.id}
                disabled={loadingId === os.id}
                onClick={() => {
                  resumeAllAudio();
                  useEmu.getState().requestLoad(os.id);
                }}
                className={cn(
                  "h-7 rounded-md px-2 font-mono text-[11px]",
                  active
                    ? "bg-accent text-accent-fg"
                    : "bg-raised text-muted hover:text-fg",
                )}
              >
                {os.label}
              </button>
            );
          })}
        </div>
        <div className="flex flex-wrap items-center gap-2">
        <span className="min-w-0 flex-1 truncate text-xs text-muted">{status}</span>
        <div className="flex flex-wrap items-center gap-1">
          <IconBtn
            label={color ? "Color" : "Mono"}
            onClick={() => useEmu.getState().setColor(!color)}
          >
            <Monitor className="size-4" />
          </IconBtn>
          <IconBtn
            label="Scanlines"
            onClick={() => useEmu.getState().setScanlines(!scanlines)}
          >
            <ScanLine className="size-4" />
          </IconBtn>
          <IconBtn
            label="Invert"
            onClick={() => useEmu.getState().setInvert(!invert)}
          >
            <Contrast className="size-4" />
          </IconBtn>
          <IconBtn
            label={muted ? "Unmute" : "Mute"}
            onClick={() => useEmu.getState().setMuted(!muted)}
          >
            {muted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
          </IconBtn>
          <label className="flex h-10 items-center gap-2 pr-1" title="Volume">
            <input
              type="range"
              min={0}
              max={100}
              step={1}
              value={volume}
              aria-label="Volume"
              className="h-2 w-24 cursor-pointer appearance-none rounded-full bg-raised accent-accent"
              onChange={(event) => {
                const next = Number(event.target.value);
                useEmu.getState().setVolume(next);
                writeVolume(next);
                machineRef.current?.audio.resume();
                machineRef.current?.diskSfx.resume();
              }}
            />
            <span className="w-8 font-mono text-[11px] tabular-nums text-muted">
              {volume}%
            </span>
          </label>
          <IconBtn
            label={poppedOut ? "Display is popped out" : "Pop out display"}
            onClick={() => {
              resumeAllAudio();
              if (poppedOut) dockDisplay();
              else popOutDisplay();
            }}
          >
            <PictureInPicture2 className={cn("size-4", poppedOut && "text-accent")} />
          </IconBtn>
          <IconBtn
            label={paused ? "Run" : "Pause"}
            onClick={() => {
              const next = !useEmu.getState().paused;
              useEmu.getState().setPaused(next);
            }}
          >
            {paused ? <Play className="size-4" /> : <Pause className="size-4" />}
          </IconBtn>
          <IconBtn
            label={
              paddleAxis === "y"
                ? "Paddle = mouse up/down"
                : "Paddle = mouse left/right"
            }
            onClick={() =>
              useEmu
                .getState()
                .setPaddleAxis(useEmu.getState().paddleAxis === "y" ? "x" : "y")
            }
          >
            <FlipVertical2 className="size-4" />
          </IconBtn>
          <IconBtn
            label="Warm reset"
            onClick={() => machineRef.current?.apple2.reset()}
          >
            <RotateCcw className="size-4" />
          </IconBtn>
        </div>
        </div>
      </div>

      <SoftKeyboard
        onKey={(code) => machineRef.current?.apple2.getIO().keyDown(code)}
        onUp={() => machineRef.current?.apple2.getIO().keyUp()}
      />
    </section>
  );
}

function DriveBay({
  n,
  on,
  name,
  side,
  flip,
  onFlip,
}: {
  n: 1 | 2;
  on: boolean;
  name: string;
  side: "a" | "b" | null;
  flip: boolean;
  onFlip: () => void;
}) {
  return (
    <span className="inline-flex min-w-0 items-center gap-2 rounded-md bg-raised px-2.5 py-1.5 font-mono text-[11px] text-muted">
      <span
        className={cn(
          "size-2 shrink-0 rounded-full",
          on ? "bg-accent shadow-[0_0_8px_var(--color-accent)]" : "bg-border",
        )}
      />
      <span className="shrink-0 text-[10px] tracking-wide uppercase">D{n}</span>
      <span className="truncate text-fg">{name}</span>
      {flip ? (
        <span
          className="ml-0.5 inline-flex shrink-0 rounded-sm bg-bg p-px"
          role="group"
          aria-label={`Drive ${n} disk side`}
        >
          {(["a", "b"] as const).map((face) => (
            <button
              key={face}
              type="button"
              data-drive-flip={`${n}-${face}`}
              aria-pressed={side === face}
              title={
                face === "a"
                  ? "Insert side A in this drive"
                  : "Insert side B in this drive"
              }
              onClick={(event) => {
                event.preventDefault();
                resumeAllAudio();
                if (side !== face) onFlip();
              }}
              className={cn(
                "h-5 min-w-5 px-1.5 text-[10px] font-semibold tracking-wide uppercase",
                side === face
                  ? "rounded-sm bg-accent text-accent-fg"
                  : "text-muted hover:text-fg",
              )}
            >
              {face.toUpperCase()}
            </button>
          ))}
        </span>
      ) : null}
    </span>
  );
}

function IconBtn({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      title={label}
      aria-label={label}
      onClick={onClick}
    >
      {children}
    </Button>
  );
}

async function boot(canvas: HTMLCanvasElement): Promise<Machine> {
  const [{ Apple2 }, { default: DiskII }, { default: SmartPort }] =
    await Promise.all([
      import("js/apple2"),
      import("js/cards/disk2"),
      import("js/cards/smartport"),
    ]);

  let ioForTick: Apple2IO | null = null;
  const apple2 = new Apple2({
    canvas,
    gl: false,
    e: true,
    enhanced: true,
    rom: "apple2enh",
    characterRom: "apple2enh_char",
    tick: () => {
      if (!ioForTick) return;
      applyPaddles(ioForTick, useEmu.getState().paddleAxis);
    },
  });
  await apple2.ready;

  const io = apple2.getIO();
  ioForTick = io;
  const cpu = apple2.getCPU();
  const diskSfx = createDiskAudio();
  const disk2 = new DiskII(io, {
    driveLight: (driveNo, on) => {
      useEmu.getState().setDrive(driveNo, on);
      if (driveNo === 1) diskSfx.motor(on);
    },
    dirty: (_driveNo, dirty) => {
      if (dirty) useEmu.getState().setDiskDirty(true);
    },
    label: (driveNo, name) => {
      if (driveNo === 1 && name) useEmu.setState({ drive1Name: name });
    },
    headStep: () => diskSfx.seek(),
  });
  const smartport = new SmartPort(
    cpu,
    {
      driveLight: (driveNo, on) => {
        if (driveNo === 1) {
          useEmu.getState().setDrive(1, on);
          diskSfx.motor(on);
        }
      },
      dirty: () => {},
      label: () => {},
    },
    { block: false },
  );

  io.setSlot(6, emptySlot);
  io.setSlot(7, emptySlot);

  apple2.getVideoModes().mono(!useEmu.getState().color);
  apple2.getVideoModes().scanlines(useEmu.getState().scanlines);

  const audio = attachAudio(io);
  const vol = useEmu.getState().volume / 100;
  audio.setMuted(useEmu.getState().muted);
  audio.setVolume(vol);
  diskSfx.setMuted(useEmu.getState().muted);
  diskSfx.setVolume(vol);
  initGamepad();

  return { apple2, disk2, smartport, audio, diskSfx };
}

/** Slot firmware at $Cn00, not the IIe internal $Cxxx ROM. */
function enableSlotRoms(apple2: Apple2Class) {
  apple2.getCPU().write(0xc0, 0x06, 0x00);
}

function diskIISignature(apple2: Apple2Class): number {
  return apple2.getCPU().read(0xc6, 0x01);
}

/** Same as typing PR#6: run the Disk II boot ROM in slot 6. */
function jumpToDiskII(apple2: Apple2Class) {
  enableSlotRoms(apple2);
  apple2.getCPU().setPC(0xc600);
}

function smartPortSignature(apple2: Apple2Class): number {
  return apple2.getCPU().read(0xc7, 0x01);
}

/** Same as PR#7: run the SmartPort boot ROM in slot 7. */
function jumpToSmartPort(apple2: Apple2Class) {
  enableSlotRoms(apple2);
  apple2.getCPU().setPC(0xc700);
}

function clearTextPage(machine: Machine) {
  const cpu = machine.apple2.getCPU();
  for (let addr = 0x400; addr < 0x800; addr++) {
    cpu.write(addr >> 8, addr & 0xff, 0xa0);
  }
}

async function fetchBuffer(url: string, label: string): Promise<ArrayBuffer> {
  const res = await fetch(asset(url));
  if (!res.ok) throw new Error(`${label} failed to load (${res.status})`);
  return res.arrayBuffer();
}

async function fetchJson<T>(url: string, label: string): Promise<T> {
  const res = await fetch(asset(url));
  if (!res.ok) throw new Error(`${label} failed to load (${res.status})`);
  return res.json() as Promise<T>;
}

async function formatBlankDos(
  machine: Machine,
  isCancelled: () => boolean,
) {
  const raw = await fetchJson<JSONDisk & { writeProtected?: boolean }>(
    "/json/disks/blank_dos33.json",
    "blank floppy",
  );
  const json = { ...raw, readOnly: false, name: "Blank DOS 3.3" };
  const ok = machine.disk2.setDisk(1, json);
  if (!ok) throw new Error("Could not insert a blank floppy");
  mountedDisk[1] = { kind: "json", name: "Blank DOS 3.3", data: json };
  useEmu.getState().setDriveFace(1, {
    name: "Blank DOS 3.3",
    side: null,
    flip: false,
  });
  useEmu.getState().setStatus("INIT HELLO — formatting D1");
  machine.apple2.getIO().setKeyBuffer("INIT HELLO\r");
  const start = Date.now();
  let sawSpin = false;
  let quiet = 0;
  while (Date.now() - start < 55000) {
    if (isCancelled()) return;
    const spinning = useEmu.getState().drive1On;
    if (spinning) {
      sawSpin = true;
      quiet = 0;
    } else if (sawSpin) {
      quiet += 120;
    }
    const text = screenText(machine.apple2);
    if (/WRITE PROTECTED/i.test(text)) {
      useEmu.getState().setStatus("INIT failed — disk is write-protected");
      return;
    }
    if (sawSpin && quiet >= 700 && readPrompt(text) === "]") {
      useEmu.getState().setStatus("Blank is ready. Type a program, SAVE HELLO, then Save D1.");
      return;
    }
    await sleep(120);
  }
  useEmu.getState().setStatus("Blank is in D1. If you see ], SAVE HELLO then Save D1.");
}

async function mountBlankDos(disk2: DiskII, drive: 1 | 2) {
  const raw = await fetchJson<JSONDisk & { writeProtected?: boolean }>(
    "/json/disks/blank_dos33.json",
    "character disk",
  );
  const json = { ...raw, readOnly: false };
  const ok = disk2.setDisk(drive, json);
  if (!ok) throw new Error("Could not create a character disk");
  mountedDisk[drive] = { kind: "json", name: "Character", data: json };
}

type Loadable = {
  id: string;
  name: string;
  category?: Title["category"];
  media: Title["media"] | { kind: "bytes"; format: string; floppy: boolean; data: ArrayBuffer };
  bootSteps?: BootStep[];
  paddleAxis?: "x" | "y";
  play?: string;
  characterDisk?: boolean;
  characterDiskUrl?: string;
};

function driveLabels(title: Loadable): { d1: string; d2: string } {
  if (title.media.kind === "none" || title.id === "applesoft") {
    return { d1: "Empty", d2: "Empty" };
  }
  const two =
    title.media.kind === "floppy" &&
    "drive2Url" in title.media &&
    Boolean(title.media.drive2Url);
  if (title.id === "blank-dos") return { d1: "Blank DOS 3.3", d2: "Empty" };
  if (title.characterDisk) return { d1: title.name, d2: "Character" };
  if (title.bootSteps?.length) return { d1: "DOS 3.3", d2: two ? "Side B" : "Empty" };
  return { d1: title.name, d2: two ? "Side B" : "Empty" };
}

function stepsFor(title: Loadable): BootStep[] {
  return title.bootSteps ?? [];
}

function resetMachine(machine: Machine) {
  machine.disk2.reset();
  useEmu.getState().setDrive(1, false);
  useEmu.getState().setDrive(2, false);
  machine.diskSfx.motor(false);
  const mmu = machine.apple2.getMMU();
  mmu?.reset();
  // DOS 3.3 plants a reset hook at $03F2. After a game, Autostart will
  // follow it into the monitor unless we invalidate the checksum byte.
  mmu?.write(0x03, 0xf2, 0);
  mmu?.write(0x03, 0xf3, 0);
  mmu?.write(0x03, 0xf4, 0);
  machine.apple2.getVideoModes().reset();
  machine.apple2.reset();
}

async function resolveLoad(id: string): Promise<Loadable | null> {
  const catalog = getTitle(id);
  if (catalog) return catalog;
  const userId = parseUserTitleId(id);
  if (!userId) return null;
  const row = await getUserDiskBytes(userId);
  if (!row) throw new Error("That disk is no longer in your library");
  return {
    id,
    name: row.name,
    media: {
      kind: "bytes",
      format: row.format,
      floppy: row.kind === "floppy",
      data: row.bytes,
    },
  };
}

async function loadTitle(
  machine: Machine,
  id: string,
  canvas: HTMLCanvasElement | null,
) {
  const gen = ++loadGeneration;
  const emu = useEmu.getState();
  emu.clearPending();
  emu.setLoading(id);
  emu.setLoadError(null);
  emu.setBootPhase("loading");
  try {
    const title = await resolveLoad(id);
    if (gen !== loadGeneration) return;
    if (!title) throw new Error("Unknown disk");
    emu.setStatus(`Loading ${title.name}…`);
    machine.diskSfx.resume();
    stopKadashDiskHelp();
    clearDriveSlots();

    const io = machine.apple2.getIO();
    const media = title.media;
    let gameBuf: ArrayBuffer | undefined;

    machine.apple2.stop();
    machine.smartport.resetBlockDisk(1);
    machine.smartport.resetBlockDisk(2);
    machine.disk2.reset();
    emu.setDrive(1, false);
    emu.setDrive(2, false);
    machine.diskSfx.motor(false);

    if (media.kind === "none") {
      io.setSlot(6, emptySlot);
      io.setSlot(7, emptySlot);
    } else if (media.kind === "json") {
      io.setSlot(7, emptySlot);
      io.setSlot(6, machine.disk2);
      const raw = await fetchJson<JSONDisk & { writeProtected?: boolean }>(
        media.url,
        title.name,
      );
      if (gen !== loadGeneration) return;
      const writable = title.id === "blank-prodos";
      const json = {
        ...raw,
        readOnly: writable
          ? false
          : (raw.readOnly ?? raw.writeProtected ?? true),
      };
      const ok = machine.disk2.setDisk(1, json);
      if (!ok) throw new Error(`Could not decode ${title.name}`);
      if (writable) {
        mountedDisk[1] = { kind: "json", name: title.name, data: json };
      }
    } else if (media.kind === "floppy") {
      io.setSlot(7, emptySlot);
      io.setSlot(6, machine.disk2);
      const buf = await fetchBuffer(media.url, title.name);
      if (gen !== loadGeneration) return;
      gameBuf = buf;
      await machine.disk2.setBinary(1, title.name, media.format, buf.slice(0));
      mountedDisk[1] = {
        kind: "binary",
        name: title.name,
        format: media.format,
        data: buf,
      };
      const sides = floppySides(media);
      let sideB: ArrayBuffer | undefined;
      if (sides?.b) {
        sideB = await fetchBuffer(sides.b, `${title.name} side B`);
        if (gen !== loadGeneration) return;
      }
      if (media.drive2Url) {
        const buf2 =
          sideB ?? (await fetchBuffer(media.drive2Url, `${title.name} side B`));
        if (gen !== loadGeneration) return;
        await machine.disk2.setBinary(
          2,
          `${title.name} B`,
          media.format,
          buf2.slice(0),
        );
        mountedDisk[2] = {
          kind: "binary",
          name: `${title.name} B`,
          format: media.format,
          data: buf2,
        };
      }
      if (title.id === "sword-of-kadash") {
        kadashGame = {
          kind: "binary",
          name: title.name,
          format: media.format,
          data: buf,
        };
        try {
          const mbuf = await fetchBuffer(
            "/disks/sword-of-kadash-b.dsk",
            "Kadash side 2",
          );
          kadashMaster = {
            kind: "binary",
            name: "Master",
            format: media.format,
            data: mbuf,
          };
        } catch {
          kadashMaster = cloneMounted(kadashGame, "Master");
        }
      }
      if (title.characterDisk) {
        if (title.characterDiskUrl) {
          const cbuf = await fetchBuffer(
            title.characterDiskUrl,
            "character disk",
          );
          if (gen !== loadGeneration) return;
          await machine.disk2.setBinary(
            2,
            "Character",
            media.format,
            cbuf.slice(0),
          );
          mountedDisk[2] = {
            kind: "binary",
            name: "Character",
            format: media.format,
            data: cbuf,
          };
        } else {
          await mountBlankDos(machine.disk2, 2);
        }
      }
      if (sideB) {
        const slot = (side: "a" | "b"): DriveSlot => ({
          format: media.format,
          nameA: title.name,
          nameB: `${title.name} B`,
          a: buf,
          b: sideB,
          side,
        });
        driveSlots[1] = slot("a");
        useEmu.getState().setDriveFace(1, {
          name: title.name,
          side: "a",
          flip: true,
        });
        if (media.drive2Url && !title.characterDisk) {
          driveSlots[2] = slot("b");
          useEmu.getState().setDriveFace(2, {
            name: `${title.name} B`,
            side: "b",
            flip: true,
          });
        }
      }
    } else if (media.kind === "bytes") {
      if (media.floppy) {
        io.setSlot(7, emptySlot);
        io.setSlot(6, machine.disk2);
        await machine.disk2.setBinary(
          1,
          title.name,
          media.format as "dsk" | "po" | "do" | "nib" | "woz",
          media.data,
        );
        mountedDisk[1] = {
          kind: "binary",
          name: title.name,
          format: media.format as "dsk" | "po" | "do" | "nib" | "woz",
          data: media.data,
        };
      } else {
        io.setSlot(6, emptySlot);
        io.setSlot(7, machine.smartport);
        await machine.smartport.setBinary(
          1,
          title.name,
          media.format as "2mg" | "po" | "hdv",
          media.data,
        );
      }
    } else {
      io.setSlot(6, emptySlot);
      io.setSlot(7, machine.smartport);
      const buf = await fetchBuffer(media.url, title.name);
      if (gen !== loadGeneration) return;
      await machine.smartport.setBinary(1, title.name, media.format, buf);
    }

    if (gen !== loadGeneration) return;
    const steps = stepsFor(title);
    const floppyBoot =
      media.kind === "json" ||
      media.kind === "floppy" ||
      (media.kind === "bytes" && media.floppy);
    const blockBoot =
      media.kind === "block" || (media.kind === "bytes" && !media.floppy);

    clearTextPage(machine);
    resetMachine(machine);
    enableSlotRoms(machine.apple2);
    if (floppyBoot) {
      const sig = diskIISignature(machine.apple2);
      if (sig !== 0x20) {
        throw new Error(
          `Disk II ROM not visible (read $${sig.toString(16).padStart(2, "0")} at $C601)`,
        );
      }
      jumpToDiskII(machine.apple2);
    } else if (blockBoot) {
      const sig = smartPortSignature(machine.apple2);
      if (sig !== 0x20) {
        throw new Error(
          `SmartPort ROM not visible (read $${sig.toString(16).padStart(2, "0")} at $C701)`,
        );
      }
      jumpToSmartPort(machine.apple2);
    }

    const insertedId = title.id === "applesoft" ? null : id;
    useEmu.getState().setLoaded(
      insertedId,
      driveLabels(title),
      title.paddleAxis ?? "x",
    );
    if (id !== "applesoft") pushRecent(id);

    useEmu.getState().setPaused(false);
    useEmu.getState().setBootPhase("booting");
    machine.apple2.run();
    const hint =
      title.play ??
      (media.kind === "none"
        ? "Applesoft BASIC — click the screen to type"
        : `Booting ${title.name}`);
    useEmu.getState().setStatus(hint);
    canvas?.focus();
    useEmu.getState().setFocused(true);
    if (steps.length) {
      await runBootSteps(
        machine.apple2,
        steps,
        () => gen !== loadGeneration,
        (status) => {
          if (gen === loadGeneration) useEmu.getState().setStatus(status);
        },
      );
    }
    if (title.id === "blank-dos" && gen === loadGeneration) {
      await formatBlankDos(machine, () => gen !== loadGeneration);
    }
    if (gen === loadGeneration) {
      useEmu.getState().setStatus(title.play ?? `Running ${title.name}`);
      useEmu.getState().setBootPhase("running");
      if (title.id === "sword-of-kadash") startKadashDiskHelp(machine, gen);
    }
  } catch (err) {
    if (gen !== loadGeneration) return;
    const message = err instanceof Error ? err.message : "Could not load that disk";
    useEmu.getState().setStatus(message);
    useEmu.getState().setLoadError(message);
    useEmu.getState().setBootPhase("error");
    try {
      useEmu.getState().setPaused(false);
      machine.apple2.run();
    } catch {
      /* keep the machine alive for Eject */
    }
  }
}

function teardown(machine: Machine) {
  loadGeneration += 1;
  stopKadashDiskHelp();
  resetPaddlePointer();
  try {
    machine.apple2.stop();
  } catch {
    /* already stopped */
  }
  machine.audio.close();
  machine.diskSfx.close();
}

function attachAudio(io: {
  sampleRate: (rate: number, size: number) => void;
  addSampleListener: (cb: (sample: number[]) => void) => void;
}): AudioHandle {
  let muted = false;
  // 1-bit click, not SID. C64 needed 0.728 SID trim; that would clip this.
  const SPEAKER_TRIM = 0.22;
  let volume = 0.5;
  let ctx: AudioContext | null = null;
  let node: ScriptProcessorNode | null = null;
  let master: GainNode | null = null;
  let host: Window = window;
  const queue: number[][] = [];
  let hooked = false;

  function applyGain() {
    if (!master || !ctx) return;
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.setTargetAtTime(
      muted ? 0 : SPEAKER_TRIM * volume,
      ctx.currentTime,
      0.04,
    );
  }

  function graphWindow(): Window {
    return host && !host.closed ? host : window;
  }

  function hookListener() {
    if (hooked) return;
    hooked = true;
    io.addSampleListener((sample) => {
      if (!muted && queue.length < 10) queue.push(sample);
    });
  }

  function connectGraph() {
    const w = graphWindow();
    const AC =
      w.AudioContext ||
      (w as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    ctx = new AC({ sampleRate: 44000 });
    io.sampleRate(ctx.sampleRate, 1024);
    node = ctx.createScriptProcessor(1024, 1, 1);
    node.onaudioprocess = (event) => {
      const out = event.outputBuffer.getChannelData(0);
      const sample = queue.shift();
      if (!sample) {
        out.fill(0);
        return;
      }
      const n = Math.min(sample.length, out.length);
      for (let i = 0; i < n; i++) out[i] = sample[i] ?? 0;
      for (let i = n; i < out.length; i++) out[i] = 0;
    };
    master = ctx.createGain();
    applyGain();
    master.connect(ctx.destination);
    node.connect(master);
    hookListener();
  }

  try {
    connectGraph();
  } catch {
    /* audio optional */
  }

  return {
    reattach: (win: Window) => {
      host = win && !win.closed ? win : window;
      try {
        node?.disconnect();
        void ctx?.close();
      } catch {
        /* */
      }
      node = null;
      master = null;
      ctx = null;
      try {
        connectGraph();
        void ctx?.resume();
      } catch {
        /* */
      }
    },
    resume: () => {
      void ctx?.resume();
    },
    setMuted: (next) => {
      muted = next;
      if (next) queue.length = 0;
      applyGain();
    },
    setVolume: (level) => {
      volume = Math.min(1, Math.max(0, level));
      applyGain();
    },
    close: () => {
      try {
        node?.disconnect();
        void ctx?.close();
      } catch {
        /* ignore */
      }
    },
  };
}

function mapKey(event: KeyboardEvent): number | null {
  if (event.metaKey && event.key !== "Meta") {
    /* still map the key; Open Apple is a modifier */
  }
  switch (event.key) {
    case "Enter":
      return 0x0d;
    case "Escape":
      return 0x1b;
    case "Tab":
      return 0x09;
    case "Backspace":
    case "Delete":
      return 0x7f;
    case "ArrowLeft":
      return 0x08;
    case "ArrowRight":
      return 0x15;
    case "ArrowUp":
      return 0x0b;
    case "ArrowDown":
      return 0x0a;
    default:
      break;
  }
  if (event.key.length !== 1) return null;
  let code = event.key.charCodeAt(0);
  if (event.ctrlKey) {
    const up = event.key.toUpperCase().charCodeAt(0);
    if (up >= 65 && up <= 90) return up - 64;
  }
  // IIe boots with caps lock on
  if (code >= 97 && code <= 122 && !event.shiftKey) code -= 32;
  return code;
}
