import { useEffect, useMemo, useState } from "react";
import { Heart, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CATALOG, CATEGORIES, type Title } from "@/lib/catalog";
import { useEmu } from "@/lib/emu-store";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { listFavorites, toggleFavorite } from "@/lib/server/favorites";
import { cn } from "@/lib/utils";

export function SoftwareLibrary() {
  const loadedId = useEmu((s) => s.loadedId);
  const requestLoad = useEmu((s) => s.requestLoad);
  const { user } = useCurrentUserState();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("All");
  const [stars, setStars] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!user) {
      setStars(new Set());
      return;
    }
    listFavorites()
      .then((ids) => setStars(new Set(ids)))
      .catch(() => setStars(new Set()));
  }, [user]);

  const titles = useMemo(() => {
    return CATALOG.filter((title) => {
      if (category !== "All" && title.category !== category) return false;
      if (!query.trim()) return true;
      const q = query.toLowerCase();
      return (
        title.name.toLowerCase().includes(q) ||
        title.summary.toLowerCase().includes(q) ||
        title.category.toLowerCase().includes(q) ||
        title.license.toLowerCase().includes(q)
      );
    });
  }, [query, category]);

  return (
    <aside className="flex min-h-0 flex-col overflow-hidden rounded-lg bg-surface shadow-[var(--shadow-border)] lg:max-h-full">
      <div className="border-b border-border px-4 py-3">
        <h2 className="text-sm font-medium">FOSS library</h2>
        <p className="mt-1 text-xs text-muted">
          Games, adventures, and creative tools — plus the system disks. Sign in
          to star titles.
        </p>
        <label className="relative mt-3 block">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search disks"
            className="h-10 w-full rounded-md bg-raised pr-3 pl-9 text-sm text-fg outline-none placeholder:text-muted"
          />
        </label>
        <div className="mt-2 flex gap-1 overflow-x-auto pb-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={cn(
                "h-8 shrink-0 rounded-full px-3 text-xs",
                category === cat
                  ? "bg-accent text-accent-fg"
                  : "bg-raised text-muted hover:text-fg",
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>
      <ul className="min-h-0 flex-1 overflow-y-auto p-2">
        {titles.map((title) => (
          <TitleRow
            key={title.id}
            title={title}
            active={loadedId === title.id}
            starred={stars.has(title.id)}
            canStar={Boolean(user)}
            onBoot={() => requestLoad(title.id)}
            onStar={async () => {
              if (!user) return;
              try {
                const next = await toggleFavorite({ data: title.id });
                setStars((prev) => {
                  const copy = new Set(prev);
                  if (next.starred) copy.add(title.id);
                  else copy.delete(title.id);
                  return copy;
                });
              } catch {
                /* signed out mid-click */
              }
            }}
          />
        ))}
      </ul>
    </aside>
  );
}

function TitleRow({
  title,
  active,
  starred,
  canStar,
  onBoot,
  onStar,
}: {
  title: Title;
  active: boolean;
  starred: boolean;
  canStar: boolean;
  onBoot: () => void;
  onStar: () => void;
}) {
  return (
    <li
      className={cn(
        "mb-1 rounded-md p-3",
        active ? "bg-raised" : "hover:bg-raised/60",
      )}
    >
      <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate text-sm font-medium">{title.name}</p>
            <span className="shrink-0 text-[10px] tracking-wide text-muted uppercase">
              {title.category}
            </span>
          </div>
          <p className="mt-1 text-xs leading-relaxed text-muted">{title.summary}</p>
          <p className="mt-1 font-mono text-[10px] text-muted">
            {title.size} · {title.license}
          </p>
        </div>
        {canStar ? (
          <button
            type="button"
            className="grid size-9 shrink-0 place-items-center text-muted hover:text-fg"
            onClick={(e) => {
              e.stopPropagation();
              onStar();
            }}
            aria-label={starred ? "Unstar" : "Star"}
          >
            <Heart
              className={cn("size-4", starred && "fill-accent text-accent")}
            />
          </button>
        ) : null}
      </div>
      <Button
        type="button"
        size="sm"
        variant={active ? "outline" : "default"}
        className="mt-2 w-full"
        data-software-id={title.id}
        onClick={onBoot}
      >
        {active ? "Reboot this disk" : "Insert & boot"}
      </Button>
    </li>
  );
}
