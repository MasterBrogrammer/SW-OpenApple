export type Prompt = "]" | ">";

export function lastMeaningfulLine(text: string): string {
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

export function looksLikeDos(text: string): boolean {
  const up = text.toUpperCase();
  return up.includes("DOS VERSION 3.3") || up.includes("SYSTEM MASTER");
}

export function isIdleBasicPrompt(text: string): boolean {
  const compact = text.replace(/[\s\u007f]+/g, "");
  if (compact === "]" || compact === ">" || compact === "][") return true;
  return readPrompt(text) !== null && compact.length <= 8;
}

/** True when the typed command is on the prompt line — not a substring of HELLO. */
export function commandEchoed(
  text: string,
  prompt: Prompt,
  typed: string,
): boolean {
  const cmd = typed.replace(/\r/g, "").trim();
  if (!cmd) return true;
  const line = lastMeaningfulLine(text).toUpperCase();
  const cmdUp = cmd.toUpperCase();
  const want = `${prompt}${cmdUp}`;
  if (line === want || line === cmdUp) return true;
  if (line.startsWith(want)) return true;
  return false;
}

export function bootError(text: string): string | null {
  const up = text.toUpperCase();
  if (up.includes("FILE NOT FOUND")) {
    return "FILE NOT FOUND — that name is not on this disk";
  }
  if (up.includes("SYNTAX ERROR") || up.includes("?SYNTAX")) {
    return "SYNTAX ERROR from the typed command";
  }
  if (up.includes("REENTER")) return "Integer BASIC rejected the line";
  return null;
}
