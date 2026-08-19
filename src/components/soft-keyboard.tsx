import { useState } from "react";
import { cn } from "@/lib/utils";

const ROWS: { label: string; code: number; grow?: boolean }[][] = [
  [
    { label: "ESC", code: 0x1b },
    { label: "1", code: 0x31 },
    { label: "2", code: 0x32 },
    { label: "3", code: 0x33 },
    { label: "4", code: 0x34 },
    { label: "5", code: 0x35 },
    { label: "6", code: 0x36 },
    { label: "7", code: 0x37 },
    { label: "8", code: 0x38 },
    { label: "9", code: 0x39 },
    { label: "0", code: 0x30 },
    { label: "-", code: 0x2d },
    { label: "DEL", code: 0x7f },
  ],
  [
    { label: "TAB", code: 0x09 },
    { label: "Q", code: 0x51 },
    { label: "W", code: 0x57 },
    { label: "E", code: 0x45 },
    { label: "R", code: 0x52 },
    { label: "T", code: 0x54 },
    { label: "Y", code: 0x59 },
    { label: "U", code: 0x55 },
    { label: "I", code: 0x49 },
    { label: "O", code: 0x4f },
    { label: "P", code: 0x50 },
    { label: "RETURN", code: 0x0d, grow: true },
  ],
  [
    { label: "A", code: 0x41 },
    { label: "S", code: 0x53 },
    { label: "D", code: 0x44 },
    { label: "F", code: 0x46 },
    { label: "G", code: 0x47 },
    { label: "H", code: 0x48 },
    { label: "J", code: 0x4a },
    { label: "K", code: 0x4b },
    { label: "L", code: 0x4c },
    { label: ";", code: 0x3b },
    { label: "←", code: 0x08 },
    { label: "→", code: 0x15 },
  ],
  [
    { label: "Z", code: 0x5a },
    { label: "X", code: 0x58 },
    { label: "C", code: 0x43 },
    { label: "V", code: 0x56 },
    { label: "B", code: 0x42 },
    { label: "N", code: 0x4e },
    { label: "M", code: 0x4d },
    { label: ",", code: 0x2c },
    { label: ".", code: 0x2e },
    { label: "/", code: 0x2f },
    { label: "↑", code: 0x0b },
    { label: "↓", code: 0x0a },
  ],
];

export function SoftKeyboard({
  onKey,
  onUp,
}: {
  onKey: (code: number) => void;
  onUp: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        type="button"
        className="mt-3 h-10 w-full rounded-md bg-raised text-sm text-muted hover:text-fg"
        onClick={() => setOpen((v) => !v)}
      >
        {open ? "Hide keyboard" : "Show keyboard"}
      </button>
      {open ? (
        <div className="mt-2 space-y-1 rounded-md bg-raised p-2">
          {ROWS.map((row, i) => (
            <div key={i} className="flex gap-1">
              {row.map((key) => (
                <button
                  key={key.label}
                  type="button"
                  className={cn(
                    "h-9 min-w-0 flex-1 rounded-sm bg-surface font-mono text-[10px] text-fg active:bg-accent active:text-accent-fg",
                    key.grow && "flex-[1.6]",
                  )}
                  onPointerDown={(e) => {
                    e.preventDefault();
                    onKey(key.code);
                  }}
                  onPointerUp={onUp}
                  onPointerLeave={onUp}
                >
                  {key.label}
                </button>
              ))}
            </div>
          ))}
          <button
            type="button"
            className="h-9 w-full rounded-sm bg-surface font-mono text-xs text-fg active:bg-accent active:text-accent-fg"
            onPointerDown={(e) => {
              e.preventDefault();
              onKey(0x20);
            }}
            onPointerUp={onUp}
          >
            SPACE
          </button>
          <p className="pt-1 text-center text-[10px] text-muted">
            Open Apple = Win/⌘ · Closed Apple = Alt · mouse on the CRT is the
            paddle
          </p>
        </div>
      ) : null}
    </div>
  );
}
