export type FloppyFmt = "dsk" | "po" | "do" | "nib" | "woz";
export type BlockFmt = "2mg" | "po" | "hdv";

export type Sniffed =
  | { kind: "floppy"; format: FloppyFmt }
  | { kind: "block"; format: BlockFmt };

const FLOPPY_140K = 143360;
const BLOCK_800K = 819200;

export function sniffDisk(filename: string, byteLength: number): Sniffed | null {
  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  if (ext === "woz" || ext === "nib") return { kind: "floppy", format: ext };
  if (ext === "2mg" || ext === "2img") return { kind: "block", format: "2mg" };
  if (ext === "hdv") return { kind: "block", format: "hdv" };
  if (ext === "dsk") return { kind: "floppy", format: "dsk" };
  if (ext === "do") return { kind: "floppy", format: "do" };
  if (ext === "po") {
    if (byteLength > FLOPPY_140K) return { kind: "block", format: "po" };
    return { kind: "floppy", format: "po" };
  }
  if (byteLength === FLOPPY_140K) return { kind: "floppy", format: "dsk" };
  if (byteLength === BLOCK_800K) return { kind: "block", format: "po" };
  return null;
}

export function formatSize(bytes: number): string {
  if (bytes <= FLOPPY_140K) return "140K floppy";
  if (bytes <= BLOCK_800K) return "800K disk";
  if (bytes < 1_048_576) return `${Math.round(bytes / 1024)}K`;
  return `${(bytes / 1_048_576).toFixed(1)}MB`;
}

export const DISK_ACCEPT =
  ".dsk,.po,.do,.nib,.woz,.2mg,.2img,.hdv,application/octet-stream";
