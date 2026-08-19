import type { Apple2 as Apple2Class } from "js/apple2";
import { useEmu } from "@/lib/emu-store";

export type Prompt = "]" | ">";

export type BootStep = {
  /** BASIC prompt to wait for before typing. Skip the step if optional and it never appears. */
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
  // ROM splash is "APPLE ][" — that is NOT the BASIC prompt.
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

function peek(apple2: Apple2Class, addr: number): number {
  return apple2.getCPU().read(addr >> 8, addr & 0xff);
}

function poke(apple2: Apple2Class, addr: number, value: number) {
  apple2.getCPU().write(addr >> 8, addr & 0xff, value);
}

/** DOS 3.3 / BASIC.SYSTEM warm-start vector. $4C = JMP once DOS is in RAM. */
const DOS_WARM = 0x03d0;

/** Clear leftover DOS hooks so we can tell THIS boot actually loaded DOS. */
export function invalidateDosHooks(apple2: Apple2Class) {
  poke(apple2, DOS_WARM, 0x00);
  poke(apple2, 0x03d3, 0x00);
}

function dosIsHooked(apple2: Apple2Class): boolean {
  return peek(apple2, DOS_WARM) === 0x4c;
}

function looksLikeDosScreen(text: string): boolean {
  const up = text.toUpperCase();
  return (
    up.includes("DOS VERSION") ||
    up.includes("SYSTEM MASTER") ||
    up.includes("DOS 3.3") ||
    up.includes("DISK VOLUME")
  );
}

/** Drive has spun, gone quiet, and BASIC is back — DOS HELLO finished. */
async function waitForDosReady(
  apple2: Apple2Class,
  isCancelled: () => boolean,
  timeoutMs: number,
): Promise<boolean> {
  const start = Date.now();
  let sawSpin = useEmu.getState().drive1On;
  let sawDosText = false;

  while (Date.now() - start < timeoutMs) {
    if (isCancelled()) return false;
    if (useEmu.getState().drive1On) sawSpin = true;
    const text = screenText(apple2);
    if (looksLikeDosScreen(text)) sawDosText = true;

    const elapsed = Date.now() - start;
    const quiet = !useEmu.getState().drive1On;
    const prompt = readPrompt(text);
    const hooked = dosIsHooked(apple2);
    const booted = sawSpin || sawDosText || hooked;

    if (prompt === "]" && quiet && booted && elapsed > 1800) {
      await sleep(250);
      if (readPrompt(screenText(apple2)) === "]" && !useEmu.getState().drive1On) {
        return true;
      }
    }
    await sleep(80);
  }
  return readPrompt(screenText(apple2)) === "]";
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
    const text = screenText(apple2);
    if (readPrompt(text) === want) return true;
    await sleep(120);
  }
  return false;
}

async function breakToPrompt(
  apple2: Apple2Class,
  want: Prompt,
  isCancelled: () => boolean,
): Promise<boolean> {
  const io = apple2.getIO();
  io.setKeyBuffer("\u0003");
  await sleep(500);
  if (await waitForPrompt(apple2, want, isCancelled, 3000)) return true;
  io.setKeyBuffer("\u0003");
  await sleep(500);
  return waitForPrompt(apple2, want, isCancelled, 3000);
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
    onStatus("Waiting for DOS 3.3 to finish HELLO…");
    const ready = await waitForDosReady(apple2, isCancelled, 20000);
    if (isCancelled()) return;
    if (!ready) {
      throw new Error(
        "The System Master never reached BASIC. Eject, then Insert again.",
      );
    }
  }

  for (const [index, step] of steps.entries()) {
    if (isCancelled()) return;
    const timeout = step.timeoutMs ?? (index === 0 ? 12000 : 12000);
    onStatus(
      step.wait === ">"
        ? "Waiting for Integer BASIC…"
        : "Waiting for the BASIC prompt…",
    );
    let ready = await waitForPrompt(apple2, step.wait, isCancelled, timeout);
    if (!ready && !step.optional) {
      onStatus("Breaking into BASIC…");
      ready = await breakToPrompt(apple2, step.wait, isCancelled);
    }
    if (!ready) {
      if (step.optional) return;
      throw new Error(
        `The ${step.wait === ">" ? "Integer BASIC >" : "Applesoft ]"} prompt never came up`,
      );
    }
    if (isCancelled()) return;
    const payload = step.type.endsWith("\r") ? step.type : `${step.type}\r`;
    onStatus(`Typing ${payload.replace(/\r/g, "").trim()}…`);
    io.setKeyBuffer(payload);
    const typed = payload.replace(/\r/g, "").trim();
    const giveUp = Date.now() + 10000;
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
    await sleep(600);
  }
}
