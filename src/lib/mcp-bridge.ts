import { CATALOG } from "@/lib/catalog";
import { resumeAllAudio } from "@/lib/disk-audio";
import { useEmu } from "@/lib/emu-store";

const PORT = 9877;
const BASE = `http://127.0.0.1:${PORT}`;

type Cmd = { id: string; name: string; args: Record<string, unknown> };

function machine() {
  return (
    window as unknown as {
      __oa?: {
        apple2: {
          getVideoModes: () => {
            getText: () => string;
            isHires?: () => boolean;
            isText?: () => boolean;
          };
          getCPU: () => { getPC?: () => number };
          getIO: () => {
            setKeyBuffer: (s: string) => void;
            keyDown: (n: number) => void;
            keyUp: () => void;
          };
          reset: () => void;
        };
      };
    }
  ).__oa;
}

function snapshot() {
  const emu = useEmu.getState();
  const apple2 = machine()?.apple2;
  const vm = apple2?.getVideoModes();
  const cpu = apple2?.getCPU();
  let text = "";
  try {
    text = vm?.getText() ?? "";
  } catch {
    text = "";
  }
  return {
    connected: Boolean(machine()),
    loadedId: emu.loadedId,
    loadingId: emu.loadingId,
    bootPhase: emu.bootPhase,
    status: emu.status,
    paused: emu.paused,
    muted: emu.muted,
    drive1: { on: emu.drive1On, name: emu.drive1Name },
    drive2: { on: emu.drive2On, name: emu.drive2Name },
    text: text.replace(/[\u007f]+/g, "").trim(),
    hires: vm?.isHires?.() ?? false,
    textMode: vm?.isText?.() ?? true,
    pc: cpu?.getPC?.() ?? 0,
  };
}

function sleep(ms: number) {
  return new Promise((r) => window.setTimeout(r, ms));
}

async function waitPhase(timeoutMs: number, loadedId?: string) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const s = useEmu.getState();
    if (!loadedId) {
      if (s.bootPhase === "running" || s.bootPhase === "error") return snapshot();
    } else if (loadedId === "applesoft") {
      if (!s.loadedId && (s.bootPhase === "running" || s.bootPhase === "error")) {
        return snapshot();
      }
    } else if (
      s.loadedId === loadedId &&
      (s.bootPhase === "running" || s.bootPhase === "error")
    ) {
      return snapshot();
    }
    await sleep(150);
  }
  return snapshot();
}

const KEYS: Record<string, number> = {
  return: 0x0d,
  enter: 0x0d,
  esc: 0x1b,
  escape: 0x1b,
  tab: 0x09,
  delete: 0x7f,
  backspace: 0x7f,
  left: 0x08,
  right: 0x15,
  up: 0x0b,
  down: 0x0a,
  space: 0x20,
};

async function runCmd(cmd: Cmd): Promise<unknown> {
  const m = machine();
  const emu = useEmu.getState();
  switch (cmd.name) {
    case "status":
      return snapshot();
    case "catalog":
      return CATALOG.map((t) => ({
        id: t.id,
        name: t.name,
        category: t.category,
        year: t.year ?? null,
        featured: Boolean(t.featured),
      }));
    case "insert": {
      const id = String(cmd.args.id || "");
      if (!id) throw new Error("id required");
      resumeAllAudio();
      emu.requestLoad(id);
      const timeout = id === "sword-of-kadash" ? 70000 : 22000;
      return waitPhase(timeout, id === "applesoft" ? "applesoft" : id);
    }
    case "eject":
      resumeAllAudio();
      emu.requestEject();
      return waitPhase(12000, "applesoft");
    case "type": {
      if (!m) throw new Error("IIe is not powered on");
      let text = String(cmd.args.text ?? "");
      if (cmd.args.return) text += "\r";
      m.apple2.getIO().setKeyBuffer(text);
      return { typed: text.replace(/\r/g, "\\r") };
    }
    case "key": {
      if (!m) throw new Error("IIe is not powered on");
      const name = String(cmd.args.name || "").toLowerCase();
      const code = KEYS[name];
      if (code == null) throw new Error(`unknown key ${name}`);
      m.apple2.getIO().keyDown(code);
      window.setTimeout(() => m.apple2.getIO().keyUp(), 50);
      return { key: name, code };
    }
    case "reset":
      if (!m) throw new Error("IIe is not powered on");
      m.apple2.reset();
      return { reset: true };
    case "wait":
      return waitPhase(Number(cmd.args.timeout_ms) || 15000);
    case "screenshot": {
      const canvas = document.querySelector("canvas");
      if (!(canvas instanceof HTMLCanvasElement)) throw new Error("no CRT");
      const jpeg = await new Promise<string>((resolve, reject) => {
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("screenshot failed"));
              return;
            }
            const reader = new FileReader();
            reader.onload = () => {
              const url = String(reader.result || "");
              const b64 = url.split(",")[1] || "";
              resolve(b64);
            };
            reader.onerror = () => reject(new Error("screenshot read failed"));
            reader.readAsDataURL(blob);
          },
          "image/jpeg",
          0.55,
        );
      });
      const snap = snapshot();
      return { ...snap, jpeg };
    }
    default:
      throw new Error(`unknown command ${cmd.name}`);
  }
}

async function pollLoop(stop: () => boolean) {
  while (!stop()) {
    try {
      const res = await fetch(`${BASE}/poll`, { method: "GET" });
      if (stop()) return;
      if (res.status === 204) continue;
      if (!res.ok) {
        await sleep(1500);
        continue;
      }
      const cmd = (await res.json()) as Cmd;
      resumeAllAudio();
      useEmu.getState().beginMcp();
      const oa = (window as unknown as { __oa?: { diskSfx?: { whoosh: () => void } } })
        .__oa;
      oa?.diskSfx?.whoosh();
      let payload: { id: string; ok: boolean; result?: unknown; error?: string };
      try {
        const result = await runCmd(cmd);
        payload = { id: cmd.id, ok: true, result };
      } catch (err) {
        payload = {
          id: cmd.id,
          ok: false,
          error: err instanceof Error ? err.message : String(err),
        };
      } finally {
        useEmu.getState().endMcp();
      }
      await fetch(`${BASE}/result`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch {
      await sleep(2000);
    }
  }
}

export function startMcpBridge() {
  if (typeof window === "undefined") return () => {};
  if (window.location.hostname !== "127.0.0.1" && window.location.hostname !== "localhost") {
    return () => {};
  }
  let stopped = false;
  void pollLoop(() => stopped);
  return () => {
    stopped = true;
  };
}
