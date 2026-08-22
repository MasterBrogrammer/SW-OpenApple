import Apple2IO from './apple2io';
import {
    HiresPage,
    LoresPage,
    VideoModes,
    VideoModesState,
} from './videomodes';
import { HiresPage2D, LoresPage2D, VideoModes2D } from './canvas';
import ROM from './roms/rom';
import Apple2eEnhancedROM from './roms/system/apple2enh';
import apple2enhChar from './roms/character/apple2enh_char';
import { Apple2IOState } from './apple2io';
import {
    CPU6502,
    CpuState,
    Debugger,
    DebuggerContainer,
    FLAVOR_6502,
    FLAVOR_ROCKWELL_65C02,
} from '@whscullin/cpu6502';
import MMU, { MMUState } from './mmu';
import RAM, { RAMState } from './ram';

import SYMBOLS from './symbols';

import { ReadonlyUint8Array, Restorable, rom } from './types';
import { processGamepad } from './ui/gamepad';

export interface Apple2Options {
    characterRom: string;
    enhanced: boolean;
    e: boolean;
    gl: boolean;
    rom: string;
    canvas: HTMLCanvasElement;
    tick: () => void;
}

export interface Stats {
    cycles: number;
    frames: number;
    renderedFrames: number;
}

export interface State {
    cpu: CpuState;
    vm: VideoModesState;
    io: Apple2IOState;
    mmu: MMUState | undefined;
    ram: RAMState[] | undefined;
}

export class Apple2 implements Restorable<State>, DebuggerContainer {
    private paused = false;

    private theDebugger: Debugger | undefined;

    private runTimer: number | null = null;
    private runAnimationFrame: number | null = null;
    private animationWindow: Window = window;
    private cpu: CPU6502;

    private gr: LoresPage;
    private gr2: LoresPage;
    private hgr: HiresPage;
    private hgr2: HiresPage;
    private vm: VideoModes;

    private io: Apple2IO;
    private mmu: MMU | undefined;
    private ram: RAM[] | undefined;
    private characterRom: rom;
    private rom: ROM;

    private tick: () => void;

    private stats: Stats = {
        cycles: 0,
        frames: 0,
        renderedFrames: 0,
    };

    public ready: Promise<void>;

    constructor(options: Apple2Options) {
        this.ready = this.init(options);
    }

    async init(options: Apple2Options) {
        const LoresPage = LoresPage2D;
        const HiresPage = HiresPage2D;
        const VideoModes = VideoModes2D;

        this.cpu = new CPU6502({
            flavor: options.enhanced ? FLAVOR_ROCKWELL_65C02 : FLAVOR_6502,
        });
        this.vm = new VideoModes(options.canvas, options.e);

        await this.vm.ready;

        this.rom = new Apple2eEnhancedROM();
        this.characterRom = apple2enhChar;

        this.ram = [new RAM(0x00, 0xbf)];
        if (options.e) {
            this.ram.push(new RAM(0x00, 0xbf));
        }
        this.gr = new LoresPage(
            this.vm,
            1,
            this.ram,
            this.characterRom,
            options.e
        );
        this.gr2 = new LoresPage(
            this.vm,
            2,
            this.ram,
            this.characterRom,
            options.e
        );
        this.hgr = new HiresPage(this.vm, 1, this.ram);
        this.hgr2 = new HiresPage(this.vm, 2, this.ram);
        this.io = new Apple2IO(this.cpu, this.vm);
        this.tick = options.tick;

        if (options.e) {
            this.mmu = new MMU(
                this.cpu,
                this.vm,
                this.gr,
                this.gr2,
                this.hgr,
                this.hgr2,
                this.io,
                this.ram,
                this.rom
            );
            this.cpu.addPageHandler(this.mmu);
        } else {
            this.cpu.addPageHandler(this.ram[0]);
            this.cpu.addPageHandler(this.gr);
            this.cpu.addPageHandler(this.gr2);
            this.cpu.addPageHandler(this.hgr);
            this.cpu.addPageHandler(this.hgr2);
            this.cpu.addPageHandler(this.io);
            this.cpu.addPageHandler(this.rom);
        }

        // Soft-switches and text mode must be valid before the first blit.
        this.vm.reset();
    }

    /**
     * Runs the emulator. If the emulator is already running, this does
     * nothing. When this function exits either `runTimer` or
     * `runAnimationFrame` will be non-null.
     */
    run() {
        this.paused = false;
        if (this.runTimer || this.runAnimationFrame) {
            return; // already running
        }

        this.theDebugger = new Debugger(this.cpu, this);
        this.theDebugger.addSymbols(SYMBOLS);

        const interval = 30;

        let now,
            last = Date.now();
        const runFn = () => {
            try {
                const kHz = this.io.getKHz();
                now = Date.now();

                const stepMax = kHz * interval;
                let step = (now - last) * kHz;
                last = now;
                if (step > stepMax) {
                    step = stepMax;
                }

                // Apply host input (mouse paddle) *before* the CPU runs so
                // this frame's paddle reads see the current stick, not last frame's.
                this.tick();

                // Direct CPU steps — Debugger.stepCycles traces every
                // instruction and a throw there kills rAF, leaving a black CRT.
                this.cpu.stepCycles(step);
                if (this.mmu) {
                    this.mmu.resetVB();
                }
                if (this.io.annunciator(0)) {
                    const imageData = this.io.blit();
                    if (imageData) {
                        this.vm.blit(imageData);
                        this.stats.renderedFrames++;
                    }
                } else {
                    if (this.vm.blit()) {
                        this.stats.renderedFrames++;
                    }
                }
                this.stats.cycles = this.cpu.getCycles();
                this.stats.frames++;
                this.io.tick();
                processGamepad(this.io);

                if (!this.paused && this.animationWindow.requestAnimationFrame) {
                    this.runAnimationFrame = this.animationWindow.requestAnimationFrame(runFn);
                }
            } catch (err) {
                console.error('[apple2] run loop', err);
                this.runAnimationFrame = null;
                this.runTimer = null;
                // A throw used to leave the CRT dead and Eject/Reboot inert.
                if (!this.paused) {
                    window.setTimeout(() => {
                        if (!this.paused && !this.runTimer && !this.runAnimationFrame) {
                            this.run();
                        }
                    }, 50);
                }
            }
        };
        if (this.animationWindow.requestAnimationFrame) {
            this.runAnimationFrame = this.animationWindow.requestAnimationFrame(runFn);
        } else {
            this.runTimer = window.setInterval(runFn, interval);
        }
    }

    setAnimationWindow(win: Window | null) {
        const next = win && !win.closed ? win : window;
        if (next === this.animationWindow) return;
        const keepGoing = !this.paused;
        if (this.runAnimationFrame != null) {
            this.animationWindow.cancelAnimationFrame(this.runAnimationFrame);
            this.runAnimationFrame = null;
        }
        this.animationWindow = next;
        if (keepGoing) this.run();
    }

    stop() {
        this.paused = true;
        if (this.runTimer) {
            clearInterval(this.runTimer);
        }
        if (this.runAnimationFrame) {
            this.animationWindow.cancelAnimationFrame(this.runAnimationFrame);
        }
        this.runTimer = null;
        this.runAnimationFrame = null;
    }

    isRunning() {
        return !this.paused;
    }

    getState(): State {
        const state: State = {
            cpu: this.cpu.getState(),
            vm: this.vm.getState(),
            io: this.io.getState(),
            mmu: this.mmu?.getState(),
            ram: this.ram?.map((bank) => bank.getState()),
        };

        return state;
    }

    setState(state: State) {
        this.cpu.setState(state.cpu);
        this.vm.setState(state.vm);
        this.io.setState(state.io);
        if (this.mmu && state.mmu) {
            this.mmu.setState(state.mmu);
        }
        if (this.ram) {
            this.ram.forEach((bank, idx) => {
                if (state.ram) {
                    bank.setState(state.ram[idx]);
                }
            });
        }
    }

    reset() {
        this.cpu.reset();
    }

    getStats(): Stats {
        return this.stats;
    }

    getCPU() {
        return this.cpu;
    }

    getIO() {
        return this.io;
    }

    getMMU() {
        return this.mmu;
    }

    getROM() {
        return this.rom;
    }

    getVideoModes() {
        return this.vm;
    }
}
