const STARS_KEY = "oa-stars";
const RECENT_KEY = "oa-recent";

function readList(key: string): string[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((x): x is string => typeof x === "string");
  } catch {
    return [];
  }
}

function writeList(key: string, ids: string[]) {
  try {
    localStorage.setItem(key, JSON.stringify(ids));
  } catch {
    /* quota / private mode */
  }
}

export function readStars(): string[] {
  return readList(STARS_KEY);
}

export function toggleStar(id: string): string[] {
  const cur = readStars();
  const next = cur.includes(id) ? cur.filter((x) => x !== id) : [id, ...cur];
  writeList(STARS_KEY, next);
  return next;
}

export function readRecent(): string[] {
  return readList(RECENT_KEY);
}

export function pushRecent(id: string): string[] {
  const next = [id, ...readRecent().filter((x) => x !== id)].slice(0, 12);
  writeList(RECENT_KEY, next);
  return next;
}
