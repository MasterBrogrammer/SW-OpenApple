# OpenApple — handoff (2026-08-19)

Private repo: https://github.com/MasterBrogrammer/SW-OpenApple  
Local clone on this machine: `C:\Users\Shako\SW-OpenApple`  
Latest commit on `main`: `d80d4da` (forced Disk II boot at `$C600`).

## How to run on another computer

Windows: double-click `launch.bat`. First run may download portable Node into `.tools/` (gitignored).  
Then open http://127.0.0.1:8080 and **Ctrl+F5**.

If Node 20+ is already installed: `npm install` then `npm run dev`. Port **8080**. If the launcher says the port is in use, just open that URL.

## What this is

Browser Apple IIe (Enhanced, 65C02) using vendored [Apple ][js](https://github.com/whscullin/apple2js) + `vendor/cpu6502` (the GitHub export originally left cpu6502 as an **empty gitlink** — that is fixed).

Library is FOSS / historic System Master only. Commercial titles (Choplifter, Karateka, Lode Runner, Oregon Trail, Pac-Man, …) are **not** bundled. Users drop `.dsk` / `.woz` / `.2mg` / `.hdv` onto the window; they stay in IndexedDB.

## What works (last verified this session)

- App launches; Insert **Little Brick Out** after the `$C600` jump was reported to **seem to work**.
- Little Brick Out is **sideways on purpose** (Woz): paddle on the left, bricks on the right. Mouse **up/down** is paddle 0. Click to serve. Flip-arrows button swaps axes.
- CRT letterboxes so the bottom of the 280×192 picture is not clipped.
- Drive bay: D1 = `DOS 3.3`, D2 = program name for System Master files. **Eject / reset** unmounts both and cold-starts empty Applesoft.
- Stars / recents are `localStorage` (no sign-in required).

## Boot chain (current design)

System Master titles (Brick Out, Animals, Apple-Vision, …) are **files on DOS 3.3**, not self-booting games.

`src/components/emulator-screen.tsx` `loadTitle`:

1. Put Disk II in **slot 6**, a dummy card (reads `0`) in **slot 7** so Autostart cannot execute random bytes or SmartPort’s `JMP $E000`.
2. `reset()`, write `$C006` (INTCXROM off), `setPC(0xC600)` — same as `PR#6`.
3. `src/lib/boot-exec.ts`: wait for drive motor, wait for it to go quiet, Ctrl-C out of HELLO, wait for `]`, then `setKeyBuffer("RUN LITTLE BRICK OUT\r")`.
4. Integer titles: after DOS, type `INT`, wait for `>`, then `RUN ANIMALS` / `RUN APPLEVISION`.

Real catalog of this System Master JSON (`scripts/dump-dos-catalog.mjs`):

| File | Type | How to run |
|---|---|---|
| LITTLE BRICK OUT | A | `RUN LITTLE BRICK OUT` |
| COLOR DEMOSOFT | A | `RUN COLOR DEMOSOFT` |
| BRIAN'S THEME | A | `RUN BRIAN'S THEME` |
| ANIMALS, APPLEVISION, BIORHYTHM | I | `INT` then `RUN …` at `>` |
| APPLE-TREK | — | **not on this disk** (removed) |

Self-booting floppies (Mystery House, Tom Bombem, Painter, …) skip the DOS steps unless they stop at `]`, then optional `RUN HELLO`.

## Bugs we hit (do not reintroduce)

1. **`vendor/cpu6502` was an empty git submodule.** Must stay vendored source.
2. **Typing `RUN` at the ROM `]`** is Applesoft, not DOS. Wait for a real disk boot.
3. **`$3D0 == $4C` is not a reliable DOS-ready check** on this IIe MMU. Do not fail the boot on it.
4. **Empty slot 7 = `garbage()`** (random bytes). Autostart treats that as a ROM and hangs. Use `emptySlot` that returns 0.
5. **SmartPort in slot 7 with no volume** can `JMP $E000` (BASIC) and skip Disk II. For floppy titles, do not leave live SmartPort in 7.
6. **Insert crash** after drive-bay work: HMR called `setPaddleAxis` that was not on the store. Paddle axis is set inside `setLoaded`.
7. Little Brick Out is **Applesoft (`RUN`)**, not `BRUN`.

## Likely next work

- Confirm DOS HELLO actually appears on screen after `$C600` (user had not seen DOS loading before that fix).
- Harden `boot-exec` if RUN still fires too early/late; `PR#6` from ROM BASIC is a fallback chain.
- Self-booting FOSS games (Painter, Tom Bombem) after System Master titles are solid.
- Library UX: D1/D2 vs “selected forever” is started; may still want auto-eject on new Insert (Insert already swaps disks).
- `src/routeTree.gen.ts` often shows as dirty from CRLF only — do not commit unless content changed.
- Login/OAuth is Grok-preview only; local starring does not need it.

## Key files

| Path | Role |
|---|---|
| `src/lib/catalog.ts` | Titles, `bootSteps`, `paddleAxis` |
| `src/lib/boot-exec.ts` | Motor wait, Ctrl-C, `setKeyBuffer` |
| `src/components/emulator-screen.tsx` | Machine, slots, `$C600` jump, CRT, drives, eject |
| `src/components/software-library.tsx` | Search, drop, Insert |
| `src/lib/emu-store.ts` | Drives, paddle, eject |
| `public/json/disks/dos33master.json` | DOS 3.3 System Master |
| `launch.bat` / `launch.ps1` | Portable Windows start |
| `vendor/cpu6502/` | Must remain real files, not a gitlink |
