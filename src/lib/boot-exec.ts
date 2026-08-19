import type { Apple2 as Apple2Class } from "js/apple2";
import { useEmu } from "@/lib/emu-store";

export type Prompt = "]" | ">";

export type BootStep = {
  wait: Prompt;
  type: string;
  optional?: boolean;
  timeoutMs?: number;
};

function sleep(ms: number) {
  return new Promise<void>((resolve) => window.setTimeout(resolve, ms));
}

function screenText(apple2: Apple2Class): string {
  try {
    return apple2.getVideoModes().getText();
  } catch {
    return "";
  }
}

function lastMeaningfulLine(text: string): string {
  const lines = text.split(/\n/);
  for (let i = lines.length - 1; i >= 0; i--) {
    const line = lines[i].replace(/[\s\u007f]+$/g, "");
    if (line.trim().length) return line.trim();
  }
  return "";
}

export function readPrompt(text: string): Prompt | null {
  const line = lastMeaningfulLine(text);
  if (/APPLE/i.test(line)) return null;
  if (line === "]" || /^\][\s\u007f@]*$/.test(line)) return "]";
  if (line === ">" || /^>[\s\u007f@]*$/.test(line)) return ">";
  return null;
}

function bootError(text: string): string | null {
  const up = text.toUpperCase();
  if (up.includes("FILE NOT FOUND")) return "FILE NOT FOUND — that name is not on this disk";
  if (up.includes("SYNTAX ERROR") || up.includes("?SYNTAX")) return "SYNTAX ERROR from the typed command";
  if (up.includes("REENTER")) return "Integer BASIC rejected the line";
  return null;
}

export function invalidateDosHooks(_apple2: Apple2Class) {
  /* leftover from the $3D0 experiment — Autostart / DOS own this RAM */
}

async function waitForMotor(
  isCancelled: () => boolean,
  timeoutMs: number,
): Promise<boolean> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (isCancelled()) return false;
    if (useEmu.getState().drive1On) return true;
    await sleep(40);
  }
  return useEmu.getState().drive1On;
}

async function waitForMotorOff(isCancelled: () => boolean, timeoutMs: number) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (isCancelled()) return;
    if (!useEmu.getState().drive1On) {
      await sleep(200);
      if (!useEmu.getState().drive1On) return;
    }
    await sleep(50);
  }
}

async function waitForPrompt(
  apple2: Apple2Class,
  want: Prompt,
  isCancelled: () => boolean,
  timeoutMs: number,
): Promise<boolean> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (isCancelled()) return false;
    if (readPrompt(screenText(apple2)) === want) return true;
    await sleep(80);
  }
  return readPrompt(screenText(apple2)) === want;
}

export async function runBootSteps(
  apple2: Apple2Class,
  steps: BootStep[],
  isCancelled: () => boolean,
  onStatus: (status: string) => void,
): Promise<void> {
  const io = apple2.getIO();
  const needsDos = steps.some((s) => s.wait === "]" && !s.optional);

  if (needsDos) {
    onStatus("Booting DOS 3.3 (Disk II)…");
    const spinning = await waitForMotor(isCancelled, 6000);
    if (isCancelled()) return;
    if (!spinning) {
      throw new Error("Disk II never started. Eject, then Insert again.");
    }
    onStatus("Waiting for HELLO to finish…");
    await waitForMotorOff(isCancelled, 8000);
    if (isCancelled()) return;
    // Break HELLO if it is sitting in a menu; harmless if already at ]
    io.setKeyBuffer("\u0003");
    await sleep(500);
  }

  for (const step of steps) {
    if (isCancelled()) return;
    onStatus(
      step.wait === ">"
        ? "Waiting for Integer BASIC…"
        : "Waiting for the BASIC prompt…",
    );
    let ready = await waitForPrompt(
      apple2,
      step.wait,
      isCancelled,
      step.timeoutMs ?? 8000,
    );
    if (!ready && !step.optional) {
      io.setKeyBuffer("\u0003");
      await sleep(400);
      ready = await waitForPrompt(apple2, step.wait, isCancelled, 3000);
    }
    if (!ready) {
      if (step.optional) return;
      throw new Error(
        `The ${step.wait === ">" ? "Integer BASIC >" : "Applesoft ]"} prompt never came up`,
      );
    }
    const payload = step.type.endsWith("\r") ? step.type : `${step.type}\r`;
    onStatus(`Typing ${payload.replace(/\r/g, "").trim()}…`);
    io.setKeyBuffer(payload);
    const typed = payload.replace(/\r/g, "").trim();
    const giveUp = Date.now() + 8000;
    while (Date.now() < giveUp) {
      if (isCancelled()) return;
      const text = screenText(apple2);
      const err = bootError(text);
      if (err) {
        if (step.optional) return;
        throw new Error(err);
      }
      if (typed && text.toUpperCase().includes(typed.toUpperCase())) break;
      await sleep(80);
    }
    await sleep(400);
  }
}
