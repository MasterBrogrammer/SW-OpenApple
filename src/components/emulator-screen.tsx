import { useEffect, useRef, type ReactNode } from "react";
import {
  Contrast,
  FlipVertical2,
  Monitor,
  Power,
  Pause,
  Play,
  RotateCcw,
  ScanLine,
  Volume2,
  VolumeX,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SoftKeyboard } from "@/components/soft-keyboard";
import { runBootSteps, type BootStep } from "@/lib/boot-exec";
import { getTitle, type Title } from "@/lib/catalog";
import { useEmu } from "@/lib/emu-store";
import { pushRecent } from "@/lib/local-prefs";
import { getUserDiskBytes, parseUserTitleId } from "@/lib/user-disks";
import { cn } from "@/lib/utils";
import type DiskII from "js/cards/disk2";
import type SmartPort from "js/cards/smartport";
import type { Apple2 as Apple2Class } from "js/apple2";
import type { JSONDisk } from "js/formats/types";
import { initGamepad } from "js/ui/gamepad";

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

let loadGeneration = 0;

declare global {
  interface Window {
    __oa?: Machine;
  }
}

export function EmulatorScreen() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const machineRef = useRef<Machine | null>(null);
  const pending = useEmu((s) => s.pendingLoad);
  const pendingNonce = pending?.nonce ?? 0;
  const paused = useEmu((s) => s.paused);
  const color = useEmu((s) => s.color);
  const scanlines = useEmu((s) => s.scanlines);
  const invert = useEmu((s) => s.invert);
  const muted = useEmu((s) => s.muted);
  const focused = useEmu((s) => s.focused);
  const drive1On = useEmu((s) => s.drive1On);
  const drive2On = useEmu((s) => s.drive2On);
  const drive1Name = useEmu((s) => s.drive1Name);
  const drive2Name = useEmu((s) => s.drive2Name);
  const paddleAxis = useEmu((s) => s.paddleAxis);
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
          useEmu.getState().pendingLoad?.id ??
          useEmu.getState().loadedId ??
          "applesoft";
        await loadTitle(machine, want, canvas);
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
      className="flex h-full min-h-0 flex-col rounded-lg bg-surface p-3 shadow-[var(--shadow-border)] sm:p-4"
      data-loaded-id={loadedId ?? ""}
      data-emu-status={emuStatus}
    >
      <div className="screen-stage">
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
          onMouseMove={(event) => {
            const io = machineRef.current?.apple2.getIO();
            const canvas = canvasRef.current;
            if (!io || !canvas) return;
            const r = canvas.getBoundingClientRect();
            const x = (event.clientX - r.left) / r.width;
            const y = (event.clientY - r.top) / r.height;
            const axis = useEmu.getState().paddleAxis;
            if (axis === "y") {
              io.paddle(0, clamp01(y));
              io.paddle(1, clamp01(x));
            } else {
              io.paddle(0, clamp01(x));
              io.paddle(1, clamp01(y));
            }
          }}
          onMouseDown={(event) => {
            event.preventDefault();
            canvasRef.current?.focus();
            machineRef.current?.audio.resume();
            machineRef.current?.apple2.getIO().buttonDown(event.button === 0 ? 0 : 1);
          }}
          onMouseUp={(event) => {
            machineRef.current?.apple2.getIO().buttonUp(event.button === 0 ? 0 : 1);
          }}
          onContextMenu={(event) => event.preventDefault()}
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
      </div>

      <div className="mt-3 flex shrink-0 flex-col gap-2">
        <div className="flex flex-wrap items-center gap-3">
          <DriveBay n={1} on={drive1On} name={drive1Name} />
          <DriveBay n={2} on={drive2On} name={drive2Name} />
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
}: {
  n: 1 | 2;
  on: boolean;
  name: string;
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
  initGamepad();

  apple2.reset();
  apple2.run();
  return { apple2, disk2, smartport, audio };
}

function clamp01(n: number) {
  return Math.min(1, Math.max(0, n));
}

function clearTextPage(machine: Machine) {
  const cpu = machine.apple2.getCPU();
  for (let addr = 0x400; addr < 0x800; addr++) {
    cpu.write(addr >> 8, addr & 0xff, 0xa0);
  }
}

async function fetchBuffer(url: string, label: string): Promise<ArrayBuffer> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${label} failed to load (${res.status})`);
  return res.arrayBuffer();
}

async function fetchJson<T>(url: string, label: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${label} failed to load (${res.status})`);
  return res.json() as Promise<T>;
}

type Loadable = {
  id: string;
  name: string;
  category?: Title["category"];
  media: Title["media"] | { kind: "bytes"; format: string; floppy: boolean; data: ArrayBuffer };
  bootSteps?: BootStep[];
  paddleAxis?: "x" | "y";
  play?: string;
};

function driveLabels(title: Loadable): { d1: string; d2: string } {
  if (title.media.kind === "none" || title.id === "applesoft") {
    return { d1: "Empty", d2: "Empty" };
  }
  if (title.bootSteps?.length) return { d1: "DOS 3.3", d2: title.name };
  return { d1: title.name, d2: "Empty" };
}

function stepsFor(title: Loadable): BootStep[] {
  if (title.bootSteps?.length) return title.bootSteps;
  if (title.media.kind === "none") return [];
  if (title.category === "System" || title.category === "Workshop") return [];
  return [{ wait: "]", type: "RUN HELLO\r", optional: true, timeoutMs: 7000 }];
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
  useEmu.getState().clearPending();
  useEmu.getState().setLoading(id);
  useEmu.getState().setLoadError(null);
  try {
    const title = await resolveLoad(id);
    if (gen !== loadGeneration) return;
    if (!title) throw new Error("Unknown disk");
    useEmu.getState().setStatus(`Loading ${title.name}…`);

    const io = machine.apple2.getIO();
    const media = title.media;

    machine.apple2.stop();
    machine.smartport.resetBlockDisk(1);
    machine.smartport.resetBlockDisk(2);

    if (media.kind === "none") {
      io.setSlot(6, null);
    } else if (media.kind === "json") {
      io.setSlot(6, machine.disk2);
      const json = await fetchJson<JSONDisk & { writeProtected?: boolean }>(
        media.url,
        title.name,
      );
      if (gen !== loadGeneration) return;
      if (json.writeProtected && json.readOnly == null) json.readOnly = true;
      const ok = machine.disk2.setDisk(1, json);
      if (!ok) throw new Error(`Could not decode ${title.name}`);
    } else if (media.kind === "floppy") {
      io.setSlot(6, machine.disk2);
      const buf = await fetchBuffer(media.url, title.name);
      if (gen !== loadGeneration) return;
      await machine.disk2.setBinary(1, title.name, media.format, buf);
    } else if (media.kind === "bytes") {
      if (media.floppy) {
        io.setSlot(6, machine.disk2);
        await machine.disk2.setBinary(
          1,
          title.name,
          media.format as "dsk" | "po" | "do" | "nib" | "woz",
          media.data,
        );
      } else {
        io.setSlot(6, null);
        await machine.smartport.setBinary(
          1,
          title.name,
          media.format as "2mg" | "po" | "hdv",
          media.data,
        );
      }
    } else {
      io.setSlot(6, null);
      const buf = await fetchBuffer(media.url, title.name);
      if (gen !== loadGeneration) return;
      await machine.smartport.setBinary(1, title.name, media.format, buf);
    }

    const insertedId = title.id === "applesoft" ? null : id;
    useEmu.getState().setLoaded(insertedId, driveLabels(title));
    useEmu.getState().setPaddleAxis(title.paddleAxis ?? "x");

    if (gen !== loadGeneration) return;
    clearTextPage(machine);
    machine.apple2.reset();
    if (useEmu.getState().paused) {
      useEmu.getState().setPaused(false);
    } else {
      machine.apple2.run();
    }
    pushRecent(id);
    const hint =
      title.play ??
      (media.kind === "none"
        ? "Applesoft BASIC — click the screen to type"
        : `Booting ${title.name}`);
    useEmu.getState().setStatus(hint);
    canvas?.focus();
    useEmu.getState().setFocused(true);
    const steps = stepsFor(title);
    if (steps.length) {
      await runBootSteps(
        machine.apple2,
        steps,
        () => gen !== loadGeneration,
        (status) => {
          if (gen === loadGeneration) useEmu.getState().setStatus(status);
        },
      );
      if (gen === loadGeneration) {
        useEmu.getState().setStatus(title.play ?? `Running ${title.name}`);
      }
    }
  } catch (err) {
    if (gen !== loadGeneration) return;
    const message = err instanceof Error ? err.message : "Could not load that disk";
    useEmu.getState().setStatus(message);
    useEmu.getState().setLoadError(message);
  }
}

function teardown(machine: Machine) {
  loadGeneration += 1;
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
