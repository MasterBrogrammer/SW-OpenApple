import { create } from "zustand";

type Pending = { id: string; nonce: number };

export type PaddleAxis = "x" | "y";
export type BootPhase = "off" | "loading" | "booting" | "running" | "error";
export type DiskSide = "a" | "b";

type EmuState = {
  loadedId: string | null;
  loadingId: string | null;
  pendingLoad: Pending | null;
  loadError: string | null;
  drive1On: boolean;
  drive2On: boolean;
  drive1Name: string;
  drive2Name: string;
  drive1Side: DiskSide | null;
  drive2Side: DiskSide | null;
  drive1Flip: boolean;
  drive2Flip: boolean;
  paddleAxis: PaddleAxis;
  paused: boolean;
  color: boolean;
  scanlines: boolean;
  invert: boolean;
  muted: boolean;
  volume: number;
  focused: boolean;
  status: string;
  booted: boolean;
  bootPhase: BootPhase;
  mcpLive: boolean;
  uplinkLive: boolean;
  diskDirty: boolean;
  nonce: number;
  requestLoad: (id: string) => void;
  requestEject: () => void;
  clearPending: () => void;
  setLoaded: (
    id: string | null,
    drives: { d1: string; d2: string },
    paddleAxis?: PaddleAxis,
  ) => void;
  setLoading: (id: string | null) => void;
  setLoadError: (error: string | null) => void;
  setDrive: (drive: 1 | 2, on: boolean) => void;
  setDriveFace: (
    drive: 1 | 2,
    face: { name: string; side: DiskSide | null; flip: boolean },
  ) => void;
  setPaddleAxis: (axis: PaddleAxis) => void;
  setPaused: (paused: boolean) => void;
  setColor: (color: boolean) => void;
  setScanlines: (scanlines: boolean) => void;
  setInvert: (invert: boolean) => void;
  setMuted: (muted: boolean) => void;
  setVolume: (volume: number) => void;
  setFocused: (focused: boolean) => void;
  setStatus: (status: string) => void;
  setBooted: (booted: boolean) => void;
  setBootPhase: (phase: BootPhase) => void;
  beginMcp: () => void;
  endMcp: () => void;
  beginUplink: () => void;
  endUplink: () => void;
  setDiskDirty: (dirty: boolean) => void;
};

export const useEmu = create<EmuState>((set) => ({
  loadedId: null,
  loadingId: null,
  pendingLoad: null,
  loadError: null,
  drive1On: false,
  drive2On: false,
  drive1Name: "Empty",
  drive2Name: "Empty",
  drive1Side: null,
  drive2Side: null,
  drive1Flip: false,
  drive2Flip: false,
  paddleAxis: "x",
  paused: false,
  color: true,
  scanlines: true,
  invert: false,
  muted: false,
  volume: 50,
  focused: false,
  status: "Powering on…",
  booted: false,
  bootPhase: "off",
  mcpLive: false,
  uplinkLive: false,
  diskDirty: false,
  nonce: 0,
  requestLoad: (id) =>
    set((s) => ({
      pendingLoad: { id, nonce: s.nonce + 1 },
      nonce: s.nonce + 1,
      loadError: null,
    })),
  requestEject: () =>
    set((s) => ({
      pendingLoad: { id: "applesoft", nonce: s.nonce + 1 },
      nonce: s.nonce + 1,
      loadError: null,
    })),
  clearPending: () => set({ pendingLoad: null }),
  setLoaded: (id, drives, paddleAxis) =>
    set({
      loadedId: id,
      drive1Name: drives?.d1 ?? "Empty",
      drive2Name: drives?.d2 ?? "Empty",
      pendingLoad: null,
      loadingId: null,
      loadError: null,
      diskDirty: false,
      ...(paddleAxis ? { paddleAxis } : {}),
    }),
  setDriveFace: (drive, face) =>
    set(
      drive === 1
        ? { drive1Name: face.name, drive1Side: face.side, drive1Flip: face.flip }
        : { drive2Name: face.name, drive2Side: face.side, drive2Flip: face.flip },
    ),
  setPaddleAxis: (axis) => set({ paddleAxis: axis }),
  setLoading: (id) => set({ loadingId: id }),
  setLoadError: (error) => set({ loadError: error, loadingId: null }),
  setDrive: (drive, on) =>
    set(drive === 1 ? { drive1On: on } : { drive2On: on }),
  setPaused: (paused) => set({ paused }),
  setColor: (color) => set({ color }),
  setScanlines: (scanlines) => set({ scanlines }),
  setInvert: (invert) => set({ invert }),
  setMuted: (muted) => set({ muted }),
  setVolume: (volume) => set({ volume: Math.min(100, Math.max(0, volume)) }),
  setFocused: (focused) => set({ focused }),
  setStatus: (status) => set({ status }),
  setBooted: (booted) => set({ booted }),
  setBootPhase: (bootPhase) => set({ bootPhase }),
  beginMcp: () => set({ mcpLive: true }),
  endMcp: () => set({ mcpLive: false }),
  beginUplink: () => set({ uplinkLive: true }),
  endUplink: () => set({ uplinkLive: false }),
  setDiskDirty: (diskDirty) => set({ diskDirty }),
}));
