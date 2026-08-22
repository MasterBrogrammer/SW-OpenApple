import type Apple2IO from "js/apple2io";
import type { PaddleAxis } from "@/lib/emu-store";

let targetX = 0.5;
let targetY = 0.5;
let smoothX = 0.5;
let smoothY = 0.5;
let fromPointer = false;
let lastApply = 0;

function clamp01(n: number) {
  return Math.min(1, Math.max(0, n));
}

export function notePointerOnCanvas(
  clientX: number,
  clientY: number,
  canvas: HTMLCanvasElement,
) {
  const r = canvas.getBoundingClientRect();
  if (r.width <= 0 || r.height <= 0) return;
  notePaddleNorm((clientX - r.left) / r.width, (clientY - r.top) / r.height);
}

export function notePaddleNorm(x: number, y: number) {
  targetX = clamp01(x);
  targetY = clamp01(y);
  fromPointer = true;
}

export function applyPaddles(io: Apple2IO, axis: PaddleAxis) {
  if (!fromPointer) return;
  const now = performance.now();
  const dt = Math.min(0.05, Math.max(0.001, (now - lastApply) / 1000));
  lastApply = now;
  // ~40ms analog-pot feel. Raw mouse steps are 1px digital; the IIe paddle
  // is an RC timer, so a little lag reads as smooth rather than choppy.
  const a = 1 - Math.exp(-dt / 0.04);
  smoothX += (targetX - smoothX) * a;
  smoothY += (targetY - smoothY) * a;
  if (axis === "y") {
    io.paddle(0, smoothY);
    io.paddle(1, smoothX);
  } else {
    io.paddle(0, smoothX);
    io.paddle(1, smoothY);
  }
}

export function resetPaddlePointer() {
  fromPointer = false;
  targetX = 0.5;
  targetY = 0.5;
  smoothX = 0.5;
  smoothY = 0.5;
  lastApply = 0;
}
