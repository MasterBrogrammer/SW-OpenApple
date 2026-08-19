import { create } from "zustand";

type Pending = { id: string; nonce: number };

export type PaddleAxis = "x" | "y";

type EmuState = {
  loadedId: string | null;
  loadingId: string | null;
  pendingLoad: Pending | null;
  loadError: string | null;
  drive1On: boolean;
  drive2On: boolean;
  drive1Name: string;
  drive2Name: string;
  paddleAxis: PaddleAxis;
  paused: boolean;
  color: boolean;
  scanlines: boolean;
  invert: boolean;
  muted: boolean;
  focused: boolean;
  status: string;
  booted: boolean;
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
  setPaddleAxis: (axis: PaddleAxis) => void;
  setPaused: (paused: boolean) => void;
  setColor: (color: boolean) => void;
  setScanlines: (scanlines: boolean) => void;
  setInvert: (invert: boolean) => void;
  setMuted: (muted: boolean) => void;
  setFocused: (focused: boolean) => void;
  setStatus: (status: string) => void;
  setBooted: (booted: boolean) => void;
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
  paddleAxis: "x",
  paused: false,
  color: true,
  scanlines: true,
  invert: false,
  muted: true,
  focused: false,
  status: "Powering on…",
  booted: false,
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
      ...(paddleAxis ? { paddleAxis } : {}),
    }),
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
  setFocused: (focused) => set({ focused }),
  setStatus: (status) => set({ status }),
  setBooted: (booted) => set({ booted }),
}));
