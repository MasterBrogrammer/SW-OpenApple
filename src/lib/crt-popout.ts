import { notePaddleNorm } from "@/lib/paddle-input";

const DISPLAY_NAME = "sw-openapple-display";
const ROW = 560 * 4;

type VideoModes = {
  textMode: boolean;
  mixedMode: boolean;
  hiresMode: boolean;
  pageMode: 1 | 2;
  getHiresPage: (page: 1 | 2) => { imageData: ImageData };
  getLoresPage: (page: 1 | 2) => { imageData: ImageData };
};

export type PopoutMachine = {
  apple2: {
    getVideoModes: () => VideoModes;
    setAnimationWindow?: (win: Window | null) => void;
  };
  audio: { resume: () => void; reattach: (win: Window) => void };
  diskSfx: { resume: () => void; reattach: (win: Window) => void };
};

type Session = {
  win: Window;
  canvas: HTMLCanvasElement;
  off: HTMLCanvasElement;
  local: ImageData;
  raf: number;
};

let session: Session | null = null;
let getMachine: () => PopoutMachine | null = () => null;

export function crtPopoutFeatures() {
  const aw = window.screen.availWidth || 1280;
  const ah = window.screen.availHeight || 800;
  const aspect = 560 / 384;
  const chrome = 72;
  let width = Math.min(aw - 64, 1200);
  let height = Math.round(width / aspect) + chrome;
  if (height > ah - 64) {
    height = ah - 64;
    width = Math.round((height - chrome) * aspect);
  }
  const left = Math.max(0, Math.round((aw - width) / 2));
  const top = Math.max(24, Math.round((ah - height) / 2));
  return `popup=yes,width=${Math.round(width)},height=${Math.round(height)},left=${left},top=${top}`;
}

export function openCrtPopout() {
  const url = new URL("display", window.location.href);
  url.searchParams.set("pop", "1");
  return window.open(url.toString(), DISPLAY_NAME, crtPopoutFeatures());
}

export function bindPopoutMachine(fn: () => PopoutMachine | null) {
  getMachine = fn;
}

export async function attachPopout(win: Window, canvas: HTMLCanvasElement) {
  stopPopout();
  if (canvas.width !== 560) canvas.width = 560;
  if (canvas.height !== 384) canvas.height = 384;
  const off = win.document.createElement("canvas");
  off.width = 560;
  off.height = 192;
  const offCtx = off.getContext("2d");
  if (!offCtx) return;
  session = {
    win,
    canvas,
    off,
    local: offCtx.createImageData(560, 192),
    raf: 0,
  };
  const machine = getMachine();
  if (machine) {
    machine.audio.reattach(win);
    machine.diskSfx.reattach(win);
    machine.audio.resume();
    machine.diskSfx.resume();
    machine.apple2.setAnimationWindow?.(win);
  }
  try {
    const { setGamepadNavigator } = await import("js/ui/gamepad");
    setGamepadNavigator(win.navigator);
  } catch {
    /* */
  }
  const resume = () => {
    const m = getMachine();
    m?.audio.resume();
    m?.diskSfx.resume();
  };
  win.addEventListener("pointerdown", resume);
  win.addEventListener("keydown", resume);
  tick();
}

export function stopPopout() {
  const s = session;
  if (!s) return;
  s.win.cancelAnimationFrame(s.raf);
  window.cancelAnimationFrame(s.raf);
  session = null;
  const machine = getMachine();
  machine?.apple2.setAnimationWindow?.(window);
  void import("js/ui/gamepad")
    .then(({ setGamepadNavigator }) => setGamepadNavigator(null))
    .catch(() => {});
}

function tick() {
  const s = session;
  if (!s || s.win.closed) {
    if (s) stopPopout();
    else session = null;
    return;
  }
  const machine = getMachine();
  try {
    const gp =
      s.win.navigator.getGamepads?.()[0] ?? navigator.getGamepads?.()[0];
    if (gp) {
      const ax = gp.axes[0] ?? 0;
      const ay = gp.axes[1] ?? 0;
      if (Math.abs(ax) > 0.08 || Math.abs(ay) > 0.08) {
        notePaddleNorm((ax + 1) / 2, (ay + 1) / 2);
      }
    }
  } catch {
    /* */
  }
  const vm = machine?.apple2.getVideoModes();
  const out = s.canvas.getContext("2d");
  const offCtx = s.off.getContext("2d");
  if (vm && out && offCtx) {
    try {
      const page = vm.pageMode;
      const hgr = vm.getHiresPage(page);
      const gr = vm.getLoresPage(page);
      const main = vm.hiresMode && !vm.textMode ? hgr.imageData : gr.imageData;
      const mix =
        vm.hiresMode && !vm.textMode && vm.mixedMode ? gr.imageData : null;
      if (main) {
        s.local.data.set(main.data);
        if (mix) {
          s.local.data.set(mix.data.subarray(160 * ROW, 192 * ROW), 160 * ROW);
        }
        offCtx.putImageData(s.local, 0, 0);
        out.imageSmoothingEnabled = false;
        out.drawImage(s.off, 0, 0, 560, 192, 0, 0, 560, 384);
      }
    } catch (err) {
      console.warn("oa popout blit", err);
    }
  }
  s.raf = s.win.requestAnimationFrame(tick);
}

export function popoutWindow() {
  return session && !session.win.closed ? session.win : null;
}
