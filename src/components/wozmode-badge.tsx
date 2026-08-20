import { useEffect, useState } from "react";
import { useEmu } from "@/lib/emu-store";
import { cn } from "@/lib/utils";

export function WozModeBadge() {
  const live = useEmu((s) => s.mcpLive);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (live) {
      setShown(true);
      return;
    }
    const t = window.setTimeout(() => setShown(false), 1600);
    return () => window.clearTimeout(t);
  }, [live]);

  return (
    <img
      src="/wozmode.png"
      alt=""
      width={480}
      height={607}
      data-wozmode={shown ? "live" : "idle"}
      aria-hidden={!shown}
      className={cn("wozmode-badge w-full", shown && "wozmode-badge-live")}
    />
  );
}
