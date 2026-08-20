import type { Apple2 as Apple2Class } from "js/apple2";
import { useEmu } from "@/lib/emu-store";
import {
  bootError,
  commandEchoed,
  looksLikeDos,
  readPrompt,
  type Prompt,
} from "@/lib/boot-parse";

export type { Prompt };

export type BootStep = {
  wait: Prompt;
  type: string;
  optional?: boolean;
  timeoutMs?: number;
};

function sleep(ms: number) {
  return new Promise<void>((resolve) => window.setTimeout(resolve, ms));
}

export function screenText(apple2: Apple2Class): string {
  try {
    return apple2.getVideoModes().getText();
  } catch {
    return "";
  }
}

function driveSpinning() {
  const s = useEmu.getState();
  return s.drive1On || s.drive2On;
}

async function waitForMotor(
  isCancelled: () => boolean,
  timeoutMs: number,
): Promise<boolean> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (isCancelled()) return false;
    if (driveSpinning()) return true;
    await sleep(40);
  }
  return driveSpinning();
}

async function waitUntilDosPrompt(
  apple2: Apple2Class,
  isCancelled: () => boolean,
  timeoutMs: number,
): Promise<"prompt" | "hung" | "fail"> {
  const start = Date.now();
  let sawBanner = false;
  while (Date.now() - start < timeoutMs) {
    if (isCancelled()) return "fail";
    const text = screenText(apple2);
    if (looksLikeDos(text)) sawBanner = true;
    if (readPrompt(text) === "]") return "prompt";
    await sleep(80);
  }
  if (readPrompt(screenText(apple2)) === "]") return "prompt";
  if (sawBanner) return "hung";
  return "fail";
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

export async function waitForText(
  apple2: Apple2Class,
  needle: string,
  isCancelled: () => boolean,
  timeoutMs: number,
): Promise<boolean> {
  const start = Date.now();
  const want = needle.toUpperCase();
  while (Date.now() - start < timeoutMs) {
    if (isCancelled()) return false;
    if (screenText(apple2).toUpperCase().includes(want)) return true;
    await sleep(80);
  }
  return screenText(apple2).toUpperCase().includes(want);
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
    const spinning = await waitForMotor(isCancelled, 10000);
    if (isCancelled()) return;
    onStatus("Waiting for DOS 3.3…");
    const dos = await waitUntilDosPrompt(
      apple2,
      isCancelled,
      spinning ? 14000 : 4000,
    );
    if (isCancelled()) return;
    if (dos === "fail" && !spinning) {
      throw new Error("Disk II never started. Eject, then Insert again.");
    }
    if (dos === "hung" || (dos === "fail" && spinning)) {
      // HELLO on this System Master is a II+ Integer-card loader and can
      // sit on that banner forever on an Enhanced IIe. Break it once.
      onStatus("Breaking HELLO…");
      io.setKeyBuffer("\u0003");
      await sleep(500);
      const ready = await waitForPrompt(apple2, "]", isCancelled, 4000);
      if (!ready && dos === "fail") {
        throw new Error("DOS 3.3 never reached the ] prompt");
      }
    }
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
    const typed = payload.replace(/\r/g, "").trim();
    onStatus(`Typing ${typed}…`);
    io.setKeyBuffer(payload);
    const giveUp = Date.now() + 8000;
    while (Date.now() < giveUp) {
      if (isCancelled()) return;
      const text = screenText(apple2);
      const err = bootError(text);
      if (err) {
        if (step.optional) return;
        throw new Error(err);
      }
      if (commandEchoed(text, step.wait, typed)) break;
      await sleep(80);
    }
    if (/^RUN\b/i.test(typed)) {
      const leave = Date.now() + 2500;
      while (Date.now() < leave) {
        if (isCancelled()) return;
        const text = screenText(apple2);
        const err = bootError(text);
        if (err) {
          if (step.optional) return;
          throw new Error(err);
        }
        if (readPrompt(text) !== step.wait) break;
        await sleep(80);
      }
    } else {
      await sleep(400);
    }
  }
}
