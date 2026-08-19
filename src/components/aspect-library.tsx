import { MagnifyingGlass } from "@phosphor-icons/react";
import { AspectToken } from "./aspect-token";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { aspectName } from "../lib/research";
import type { Combination } from "../lib/research-types";

type AspectLibraryProps = {
  aspects: string[];
  coreAspects: string[];
  combinations: Record<string, Combination>;
  available: Set<string>;
  query: string;
  previewAspect: string | null;
  onAvailabilityChange: (next: Set<string>) => void;
  onQueryChange: (query: string) => void;
  onPreviewChange: (aspect: string | null) => void;
};

export function AspectLibrary({
  aspects,
  coreAspects,
  combinations,
  available,
  query,
  previewAspect,
  onAvailabilityChange,
  onQueryChange,
  onPreviewChange,
}: AspectLibraryProps) {
  const normalizedQuery = query.trim().toLowerCase();
  const visibleAspects = normalizedQuery
    ? aspects.filter(
        (aspect) => aspect.includes(normalizedQuery) || aspectName(aspect).toLowerCase().includes(normalizedQuery),
      )
    : aspects;
  const previewRecipe = previewAspect ? combinations[previewAspect] : undefined;

  return (
    <section aria-labelledby="aspects-heading">
      <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 id="aspects-heading" className="text-lg font-semibold tracking-tight">
              Available aspects
            </h2>
            <Badge>
              {available.size} / {aspects.length}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Disable rare aspects to make the pathfinder avoid them.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => onAvailabilityChange(new Set(aspects))}>
            Select all
          </Button>
          <Button variant="outline" size="sm" onClick={() => onAvailabilityChange(new Set(coreAspects))}>
            Core only
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onAvailabilityChange(new Set())}>
            Clear
          </Button>
        </div>
      </div>

      <div className="relative mb-3 max-w-sm">
        <MagnifyingGlass
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]"
          size={16}
        />
        <Input
          className="pl-9"
          type="search"
          placeholder="Search aspects"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
        />
      </div>

      <div className="mb-3 min-h-14 rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2">
        {previewAspect && previewRecipe ? (
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <AspectToken aspect={previewRecipe[0]} compact />
            <span className="text-[var(--muted-foreground)]">+</span>
            <AspectToken aspect={previewRecipe[1]} compact />
            <span className="text-[var(--muted-foreground)]">=</span>
            <AspectToken aspect={previewAspect} compact />
          </div>
        ) : (
          <p className="py-2 text-xs text-[var(--muted-foreground)]">
            Focus or hover over a compound aspect to preview its recipe.
          </p>
        )}
      </div>

      {visibleAspects.length > 0 ? (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-4">
          {visibleAspects.map((aspect) => (
            <AspectToken
              key={aspect}
              aspect={aspect}
              active={available.has(aspect)}
              onClick={() => {
                const next = new Set(available);
                if (next.has(aspect)) next.delete(aspect);
                else next.add(aspect);
                onAvailabilityChange(next);
              }}
              onBlur={() => onPreviewChange(null)}
              onFocus={() => onPreviewChange(aspect)}
              onMouseEnter={() => onPreviewChange(aspect)}
              onMouseLeave={() => onPreviewChange(null)}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-[var(--border-strong)] px-4 py-12 text-center">
          <p className="text-sm font-medium">No matching aspects</p>
          <Button className="mt-3" variant="ghost" size="sm" onClick={() => onQueryChange("")}>
            Clear search
          </Button>
        </div>
      )}
    </section>
  );
}
