import { useEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Maximize2, Minimize2, PanelLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/display")({ ssr: false, component: DisplayPage });

type Input = {
  keyDown: (code: number) => void;
  keyUp: () => void;
  buttonDown: (n: number) => void;
  buttonUp: (n: number) => void;
  pointer?: (x: number, y: number) => void;
};
type Opener = Window & {
  __oa?: { apple2: { getIO: () => Input }; audio: AudioBits; diskSfx: AudioBits };
  __oaInput?: Input;
};
type AudioBits = { resume: () => void; reattach?: (win: Window) => void };

function sendPointer(
  input: Input | undefined,
  canvas: HTMLCanvasElement | null,
  clientX: number,
  clientY: number,
) {
  if (!input?.pointer || !canvas) return;
  const r = canvas.getBoundingClientRect();
  if (r.width <= 0 || r.height <= 0) return;
  input.pointer((clientX - r.left) / r.width, (clientY - r.top) / r.height);
}

function DisplayPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [full, setFull] = useState(false);
  const [style, setStyle] = useState({
    color: true,
    scanlines: true,
    invert: false,
  });
  const [openerOk, setOpenerOk] = useState(false);

  useEffect(() => {
    const opener = window.opener as Opener | null;
    setOpenerOk(Boolean(opener && !opener.closed));
    if (!opener || opener.closed) return;
    const origin = window.location.origin;
    const announce = window.requestAnimationFrame(() => {
      opener.postMessage({ type: "oa-display-ready" }, origin);
      canvasRef.current?.focus();
    });

    const onMsg = (event: MessageEvent) => {
      if (event.origin !== origin) return;
      const data = event.data as {
        type?: string;
        color?: boolean;
        scanlines?: boolean;
        invert?: boolean;
      };
      if (!data || typeof data !== "object") return;
      if (data.type === "oa-display-style") {
        setStyle({
          color: data.color !== false,
          scanlines: data.scanlines !== false,
          invert: Boolean(data.invert),
        });
      }
      if (data.type === "oa-display-close") window.close();
    };
    const onGone = () => {
      opener.postMessage({ type: "oa-display-gone" }, origin);
    };
    const onFs = () => setFull(Boolean(document.fullscreenElement));

    window.addEventListener("message", onMsg);
    window.addEventListener("beforeunload", onGone);
    document.addEventListener("fullscreenchange", onFs);
    return () => {
      window.cancelAnimationFrame(announce);
      window.removeEventListener("message", onMsg);
      window.removeEventListener("beforeunload", onGone);
      document.removeEventListener("fullscreenchange", onFs);
    };
  }, []);

  useEffect(() => {
    const opener = window.opener as Opener | null;

    function io() {
      if (!opener || opener.closed) return undefined;
      return opener.__oaInput ?? opener.__oa?.apple2.getIO();
    }

    function onKeyDown(event: KeyboardEvent) {
      const port = io();
      if (!port) return;
      if (event.repeat) {
        event.preventDefault();
        return;
      }
      if (event.ctrlKey && (event.key === "Delete" || event.key === "F12")) {
        event.preventDefault();
        return;
      }
      const code = mapKey(event);
      if (code == null) return;
      event.preventDefault();
      port.keyDown(code);
      if (event.metaKey || event.getModifierState("OS")) port.buttonDown(0);
      if (event.altKey) port.buttonDown(1);
    }
    function onKeyUp() {
      const port = io();
      if (!port) return;
      port.keyUp();
      port.buttonUp(0);
      port.buttonUp(1);
    }
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  async function toggleFull() {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await document.documentElement.requestFullscreen();
    } catch {
      /* */
    }
  }

  function dock() {
    const opener = window.opener as Opener | null;
    if (opener && !opener.closed) {
      opener.focus();
      opener.postMessage({ type: "oa-display-gone" }, window.location.origin);
    }
    window.close();
  }

  const machine = () => (window.opener as Opener | null)?.__oa;

  return (
    <div className="flex h-dvh flex-col bg-bg text-fg">
      <header
        className={cn(
          "flex shrink-0 items-center gap-2 border-b border-border px-3 py-2",
          full && "hidden",
        )}
      >
        <span className="font-mono text-xs tracking-wide text-accent">][</span>
        <span className="text-sm font-medium">SW-OpenApple display</span>
        <span className="hidden text-xs text-muted sm:inline">Keys and paddle go to the IIe</span>
        <div className="ml-auto flex items-center gap-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 gap-1.5"
            onClick={() => void toggleFull()}
          >
            {full ? <Minimize2 className="size-3.5" /> : <Maximize2 className="size-3.5" />}
            {full ? "Windowed" : "Fullscreen"}
          </Button>
          <Button type="button" variant="outline" size="sm" className="h-8 gap-1.5" onClick={dock}>
            <PanelLeft className="size-3.5" />
            Back to interface
          </Button>
        </div>
      </header>
      <main className="relative min-h-0 flex-1 bg-bg">
        <div className="flex h-full w-full items-center justify-center p-3">
          <div
            className={cn(
              "screen-bezel overflow-hidden rounded-md",
              style.scanlines && "scanlines",
            )}
            style={{
              aspectRatio: "560 / 384",
              height: "100%",
              width: "auto",
              maxWidth: "100%",
            }}
          >
            <canvas
              ref={canvasRef}
              width={560}
              height={384}
              tabIndex={0}
              className={cn(
                "apple-screen block h-full w-full outline-none",
                !style.color && "mono",
                style.invert && "invert",
              )}
              onPointerMove={(event) => {
                const opener = window.opener as Opener | null;
                sendPointer(
                  opener && !opener.closed ? opener.__oaInput : undefined,
                  canvasRef.current,
                  event.clientX,
                  event.clientY,
                );
              }}
              onPointerDown={(event) => {
                event.preventDefault();
                const opener = window.opener as Opener | null;
                const input =
                  opener && !opener.closed ? opener.__oaInput : undefined;
                const canvas = canvasRef.current;
                canvas?.focus();
                canvas?.setPointerCapture(event.pointerId);
                const m = machine();
                m?.audio.resume();
                m?.diskSfx.resume();
                sendPointer(input, canvas, event.clientX, event.clientY);
                input?.buttonDown(event.button === 0 ? 0 : 1);
              }}
              onPointerUp={(event) => {
                const opener = window.opener as Opener | null;
                opener?.__oaInput?.buttonUp(event.button === 0 ? 0 : 1);
              }}
              onContextMenu={(event) => event.preventDefault()}
            />
          </div>
        </div>
        {!openerOk ? (
          <div className="absolute inset-0 grid place-items-center bg-bg px-6 text-center">
            <p className="max-w-sm text-sm text-muted">
              Open this from SW-OpenApple with Pop out display. The CRT lives in the
              main window until then.
            </p>
          </div>
        ) : null}
      </main>
    </div>
  );
}

function mapKey(event: KeyboardEvent): number | null {
  switch (event.key) {
    case "Enter":
      return 0x0d;
    case "Escape":
      return 0x1b;
    case "Tab":
      return 0x09;
    case "Backspace":
    case "Delete":
      return 0x7f;
    case "ArrowLeft":
      return 0x08;
    case "ArrowRight":
      return 0x15;
    case "ArrowUp":
      return 0x0b;
    case "ArrowDown":
      return 0x0a;
    default:
      break;
  }
  if (event.key.length !== 1) return null;
  let code = event.key.charCodeAt(0);
  if (event.ctrlKey) {
    const up = event.key.toUpperCase().charCodeAt(0);
    if (up >= 65 && up <= 90) return up - 64;
  }
  if (code >= 97 && code <= 122 && !event.shiftKey) code -= 32;
  return code;
}
