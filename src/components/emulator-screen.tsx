import { useEffect, useRef, type ReactNode } from "react";
import {
  Contrast,
  Monitor,
  Pause,
  Play,
  Power,
  RotateCcw,
  ScanLine,
  Volume2,
  VolumeX,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SoftKeyboard } from "@/components/soft-keyboard";
import { getTitle } from "@/lib/catalog";
import { useEmu } from "@/lib/emu-store";
import { cn } from "@/lib/utils";
import type DiskII from "js/cards/disk2";
import type SmartPort from "js/cards/smartport";
import type { Apple2 as Apple2Class } from "js/apple2";
import type { JSONDisk } from "js/formats/types";

type Machine = {
  apple2: Apple2Class;
  disk2: DiskII;
  smartport: SmartPort;
  audio: AudioHandle;
};

type AudioHandle = {
  resume: () => void;
  setMuted: (muted: boolean) => void;
  close: () => void;
};

let bootKeysTimer = 0;
let bootKeysInterval = 0;

declare global {
  interface Window {
    __oa?: Machine;
  }
}

export function EmulatorScreen() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const machineRef = useRef<Machine | null>(null);
  const pending = useEmu((s) => s.pendingLoad);
  const paused = useEmu((s) => s.paused);
  const color = useEmu((s) => s.color);
  const scanlines = useEmu((s) => s.scanlines);
  const invert = useEmu((s) => s.invert);
  const muted = useEmu((s) => s.muted);
  const focused = useEmu((s) => s.focused);
  const drive1On = useEmu((s) => s.drive1On);
  const drive1Name = useEmu((s) => s.drive1Name);
  const status = useEmu((s) => s.status);
  const loadedId = useEmu((s) => s.loadedId);
  const booted = useEmu((s) => s.booted);

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
        useEmu.getState().setBooted(true);
        const want =
          useEmu.getState().pendingLoad ??
          useEmu.getState().loadedId ??
          "dos33";
        await loadTitle(machine, want);
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
    };
  }, []);

  useEffect(() => {
    if (!booted || !pending) return;
    const machine = machineRef.current;
    if (!machine) return;
    void loadTitle(machine, pending);
  }, [pending, booted]);

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
  }, [muted]);

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

  const emuStatus = booted && loadedId ? "ready" : booted ? "on" : "loading";

  return (
    <section
      className="flex min-h-0 flex-col rounded-lg bg-surface p-3 shadow-[var(--shadow-border)] sm:p-4"
      data-loaded-id={loadedId ?? ""}
      data-emu-status={emuStatus}
    >
      <div
        className={cn(
          "screen-bezel relative mx-auto w-full max-w-[840px] overflow-hidden rounded-md bg-screen",
          scanlines && "scanlines",
        )}
      >
        <canvas
          ref={canvasRef}
          width={560}
          height={384}
          tabIndex={0}
          className={cn(
            "apple-screen block h-auto w-full outline-none",
            !color && "mono",
            invert && "invert",
          )}
          onFocus={() => useEmu.getState().setFocused(true)}
          onBlur={() => useEmu.getState().setFocused(false)}
          onClick={() => {
            canvasRef.current?.focus();
            machineRef.current?.audio.resume();
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

      <div className="mx-auto mt-3 flex w-full max-w-[840px] flex-wrap items-center gap-2">
        <DriveLight on={drive1On} label={`S6 D1 · ${drive1Name}`} />
        <span className="hidden text-xs text-muted sm:inline">{status}</span>
        <div className="ml-auto flex flex-wrap items-center gap-1">
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
            label="Reset"
            onClick={() => machineRef.current?.apple2.reset()}
          >
            <RotateCcw className="size-4" />
          </IconBtn>
          <IconBtn
            label="Power"
            onClick={() => {
              const machine = machineRef.current;
              if (!machine) return;
              useEmu.getState().requestLoad("applesoft");
            }}
          >
            <Power className="size-4" />
          </IconBtn>
        </div>
      </div>

      <p className="mx-auto mt-2 hidden max-w-[840px] text-xs text-muted md:block">
        Keys go to the II when the screen is focused. Ctrl+Delete is Reset. Open
        Apple is ⌘ / Win; Closed Apple is Alt.
      </p>

      <SoftKeyboard
        onKey={(code) => machineRef.current?.apple2.getIO().keyDown(code)}
        onUp={() => machineRef.current?.apple2.getIO().keyUp()}
      />
    </section>
  );
}

function DriveLight({ on, label }: { on: boolean; label: string }) {
  return (
    <span className="inline-flex items-center gap-2 font-mono text-[11px] text-muted">
      <span
        className={cn(
          "size-2 rounded-full",
          on ? "bg-accent shadow-[0_0_8px_var(--color-accent)]" : "bg-raised",
        )}
      />
      {label}
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

  const apple2 = new Apple2({
    canvas,
    gl: false,
    e: true,
    enhanced: true,
    rom: "apple2enh",
    characterRom: "apple2enh_char",
    tick: () => {},
  });
  await apple2.ready;

  const io = apple2.getIO();
  const cpu = apple2.getCPU();
  const disk2 = new DiskII(io, {
    driveLight: (driveNo, on) => useEmu.getState().setDrive(driveNo, on),
    dirty: () => {},
    label: (driveNo, name) => {
      if (driveNo === 1 && name) useEmu.setState({ drive1Name: name });
    },
  });
  const smartport = new SmartPort(
    cpu,
    {
      driveLight: (driveNo, on) => {
        if (driveNo === 1) useEmu.getState().setDrive(1, on);
      },
      dirty: () => {},
      label: () => {},
    },
    { block: false },
  );

  // Slot 7 SmartPort always; Disk II is mapped only when a floppy is in.
  // An empty Disk II hangs Autostart forever (black CRT).
  io.setSlot(7, smartport);

  apple2.getVideoModes().mono(!useEmu.getState().color);
  apple2.getVideoModes().scanlines(useEmu.getState().scanlines);

  const audio = attachAudio(io);
  audio.setMuted(useEmu.getState().muted);

  apple2.reset();
  apple2.run();
  return { apple2, disk2, smartport, audio };
}

function clearTextPage(machine: Machine) {
  const cpu = machine.apple2.getCPU();
  for (let addr = 0x400; addr < 0x800; addr++) {
    cpu.write(addr >> 8, addr & 0xff, 0xa0);
  }
}

async function loadTitle(machine: Machine, id: string) {
  const title = getTitle(id);
  if (!title) return;
  useEmu.getState().clearPending();
  useEmu.getState().setStatus(`Loading ${title.name}…`);
  try {
    const io = machine.apple2.getIO();
    const media = title.media;

    machine.apple2.stop();
    machine.smartport.resetBlockDisk(1);
    machine.smartport.resetBlockDisk(2);

    if (media.kind === "none") {
      io.setSlot(6, null);
      useEmu.getState().setLoaded(id, "Empty");
    } else if (media.kind === "json") {
      io.setSlot(6, machine.disk2);
      const json = (await (await fetch(media.url)).json()) as JSONDisk & {
        writeProtected?: boolean;
      };
      if (json.writeProtected && json.readOnly == null) json.readOnly = true;
      const ok = machine.disk2.setDisk(1, json);
      if (!ok) throw new Error(`Could not decode ${title.name}`);
      useEmu.getState().setLoaded(id, title.name);
    } else if (media.kind === "floppy") {
      io.setSlot(6, machine.disk2);
      const buf = await (await fetch(media.url)).arrayBuffer();
      await machine.disk2.setBinary(1, title.name, media.format, buf);
      useEmu.getState().setLoaded(id, title.name);
    } else {
      io.setSlot(6, null);
      const buf = await (await fetch(media.url)).arrayBuffer();
      await machine.smartport.setBinary(1, title.name, media.format, buf);
      useEmu.getState().setLoaded(id, title.name);
    }

    clearTextPage(machine);
    machine.apple2.reset();
    if (useEmu.getState().paused) {
      useEmu.getState().setPaused(false);
    } else {
      machine.apple2.run();
    }
    useEmu.getState().setStatus(
      media.kind === "none" ? "Applesoft BASIC — click the screen to type" : `Booting ${title.name}`,
    );
    scheduleBootKeys(machine, title.bootKeys);
  } catch (err) {
    useEmu.getState().setStatus(
      err instanceof Error ? err.message : "Could not load that disk",
    );
  }
}

function cancelBootKeys() {
  if (bootKeysTimer) {
    window.clearTimeout(bootKeysTimer);
    bootKeysTimer = 0;
  }
  if (bootKeysInterval) {
    window.clearInterval(bootKeysInterval);
    bootKeysInterval = 0;
  }
}

function scheduleBootKeys(machine: Machine, keys: string | undefined) {
  cancelBootKeys();
  if (!keys) return;
  bootKeysTimer = window.setTimeout(() => {
    bootKeysTimer = 0;
    const io = machine.apple2.getIO();
    let i = 0;
    bootKeysInterval = window.setInterval(() => {
      if (i >= keys.length) {
        cancelBootKeys();
        io.keyUp();
        return;
      }
      const ch = keys[i++];
      const code = ch === "\r" || ch === "\n" ? 0x0d : ch.charCodeAt(0) & 0x7f;
      io.keyDown(code);
      io.keyUp();
    }, 90);
  }, 2800);
}

function teardown(machine: Machine) {
  cancelBootKeys();
  try {
    machine.apple2.stop();
  } catch {
    /* already stopped */
  }
  machine.audio.close();
}

function attachAudio(io: {
  sampleRate: (rate: number, size: number) => void;
  addSampleListener: (cb: (sample: number[]) => void) => void;
}): AudioHandle {
  let muted = true;
  let ctx: AudioContext | null = null;
  let node: ScriptProcessorNode | null = null;
  const queue: number[][] = [];

  try {
    ctx = new AudioContext({ sampleRate: 44000 });
    io.sampleRate(ctx.sampleRate, 1024);
    node = ctx.createScriptProcessor(1024, 1, 1);
    io.addSampleListener((sample) => {
      if (!muted && queue.length < 10) queue.push(sample);
    });
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
    node.connect(ctx.destination);
  } catch {
    /* audio optional */
  }

  return {
    resume: () => {
      void ctx?.resume();
    },
    setMuted: (next) => {
      muted = next;
      if (next) queue.length = 0;
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
