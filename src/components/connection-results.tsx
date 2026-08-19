import { MagicWand, X } from "@phosphor-icons/react";
import { AspectToken } from "./aspect-token";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { aspectImage, aspectName } from "../lib/research";
import type { ConnectionRoute } from "../lib/app-types";

type ConnectionResultsProps = {
  routes: ConnectionRoute[];
  searchMessage: string | null;
  available: Set<string>;
  onClear: () => void;
  onRemove: (routeId: string) => void;
};

function getPathItems(path: string[]) {
  const occurrences = new Map<string, number>();
  return path.map((aspect, index) => {
    const occurrence = (occurrences.get(aspect) ?? 0) + 1;
    occurrences.set(aspect, occurrence);
    return { aspect, isLast: index === path.length - 1, key: `${aspect}-${occurrence}` };
  });
}

function getIntermediateAspectCounts(path: string[]) {
  const counts = new Map<string, number>();
  path.slice(1, -1).forEach((aspect) => counts.set(aspect, (counts.get(aspect) ?? 0) + 1));
  return [...counts.entries()];
}

export function ConnectionResults({
  routes,
  searchMessage,
  available,
  onClear,
  onRemove,
}: ConnectionResultsProps) {
  return (
    <section aria-labelledby="result-heading">
      <div className="mb-3 flex items-end justify-between gap-4">
        <div>
          <h2 id="result-heading" className="text-lg font-semibold tracking-tight">
            Connections
          </h2>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Add each route you need, then follow the vertical columns in-game.
          </p>
        </div>
        {routes.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs tabular-nums text-[var(--muted-foreground)]">
              {routes.length} route{routes.length === 1 ? "" : "s"}
            </span>
            <Button variant="ghost" size="sm" onClick={onClear}>
              <X size={14} />
              Clear all
            </Button>
          </div>
        )}
      </div>

      {routes.length === 0 && !searchMessage && (
        <div className="grid min-h-40 place-items-center rounded-xl border border-dashed border-[var(--border-strong)] px-6 text-center">
          <div>
            <MagicWand className="mx-auto mb-3 text-[var(--primary)]" size={24} />
            <p className="text-sm font-medium">Ready to build your route list</p>
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">Set a pair of aspects, add the connection, then repeat.</p>
          </div>
        </div>
      )}

      {searchMessage && (
        <div className="rounded-xl border border-[var(--danger-border)] bg-[var(--danger-muted)] px-4 py-5 text-sm text-[var(--danger)]">
          {searchMessage}
        </div>
      )}

      {routes.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-3">
          {routes.map((route, routeIndex) => {
            const pathItems = getPathItems(route.path);
            const usedAspects = getIntermediateAspectCounts(route.path);
            return (
              <article key={route.id} className="min-w-0 rounded-xl border border-[var(--border)] bg-[var(--surface)]">
                <div className="flex items-start justify-between gap-2 border-b border-[var(--border)] px-3 py-3">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold">Connection {routeIndex + 1}</p>
                    <p className="mt-1 truncate text-xs text-[var(--muted-foreground)]">
                      {aspectName(route.from)} â†’ {aspectName(route.to)}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="-mr-1 -mt-1 shrink-0"
                    aria-label={`Remove connection ${routeIndex + 1}`}
                    title={`Remove connection ${routeIndex + 1}`}
                    onClick={() => onRemove(route.id)}
                  >
                    <X size={14} />
                  </Button>
                </div>

                <div className="space-y-2 p-3">
                  {pathItems.map(({ aspect, isLast, key }) => (
                    <div className="relative" key={key}>
                      {!isLast && <div className="absolute bottom-0 left-1/2 h-2 w-px translate-y-full bg-[var(--border-strong)]" aria-hidden="true" />}
                      <div className="rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2.5">
                        <AspectToken aspect={aspect} active={available.has(aspect)} compact />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap items-center gap-2 border-t border-[var(--border)] px-3 py-3">
                  <span className="mr-1 text-xs font-medium text-[var(--muted-foreground)]">
                    {route.path.length - 2} step{route.path.length - 2 === 1 ? "" : "s"}
                  </span>
                  {usedAspects.map(([aspect, count]) => (
                    <Badge key={aspect} className="gap-1.5">
                      <img className="size-4" src={aspectImage(aspect)} alt="" />
                      {aspectName(aspect)}{count > 1 ? ` Ã—${count}` : ""}
                    </Badge>
                  ))}
                  {route.path.some((aspect) => !available.has(aspect)) && (
                    <Badge className="border-[var(--warning-border)] text-[var(--warning)]">Uses unavailable aspects</Badge>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
