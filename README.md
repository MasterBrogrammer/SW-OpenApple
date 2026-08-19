# OpenApple

A browser Apple IIe (Enhanced, 65C02) with a disk library you can actually use.

Emulator core is [Apple ][js](https://github.com/whscullin/apple2js) by Will Scullin (MIT). Disk II + SmartPort. Mouse on the CRT is the paddle / joystick.

## Run it on this machine

**Windows:** double-click `launch.bat`.

The first run will:

1. Use Node.js if you already have it, or download a portable copy into `.tools/` (gitignored)
2. `npm install`
3. Start the app at [http://127.0.0.1:8080](http://127.0.0.1:8080) and open your browser

If you already have Node 20+:

```
npm install
npm run dev
```

Then open `http://127.0.0.1:8080`. Port **8080** must be free.

## Library

The bundled library is only titles we can legally ship:

- **Arcade / school-disk:** Little Brick Out (Woz), Apple Trek, Animals, Painter, Tom Bombem, MazezaM
- **Adventure:** Mystery House, Eamon, Colossal Cave, Beneath Apple Manor, Silvern Castle
- **Creative / system / workshop:** Apple Writer, Electric Duet, DOS 3.3, ProDOS, A2DeskTop, …

**Choplifter, Karateka, Lode Runner, Oregon Trail, Pac-Man, Donkey Kong, etc.** are still copyrighted. OpenApple will not bundle them.

To play those: drop a `.dsk` / `.po` / `.woz` / `.2mg` / `.hdv` on the window, or use **Open disk image…**. Your copies stay in this browser (IndexedDB). They never upload anywhere.

Stars are stored locally. Sign-in is optional and only used on the hosted Grok build.

## Keys

| | |
|---|---|
| Click the screen | Focus + audio |
| Mouse on CRT | Paddle 0/1 (joystick) |
| Click / right-click | Button 0 / 1 |
| Ctrl+Delete | Reset |
| ⌘ / Win | Open Apple |
| Alt | Closed Apple |

## License

- Emulator: MIT (Will Scullin / contributors) — see `vendor/apple2js/LICENSE` and `vendor/cpu6502/LICENSE`
- Bundled disks: their own grants, listed in `public/disks/FOSS-DISKS.txt`
