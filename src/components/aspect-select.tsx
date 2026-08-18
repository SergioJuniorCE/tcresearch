import { useEffect, useMemo, useRef, useState, type FocusEvent, type KeyboardEvent } from "react";
import { CaretDown, Check } from "@phosphor-icons/react";
import { aspectImage, aspectName } from "../lib/research";
import { cn } from "../lib/utils";

type AspectSelectProps = {
  id: string;
  label: string;
  value: string;
  aspects: string[];
  onChange: (value: string) => void;
};

function aspectLabel(aspect: string) {
  return `${aspectName(aspect)} (${aspect})`;
}

export function AspectSelect({ id, label, value, aspects, onChange }: AspectSelectProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [isFiltering, setIsFiltering] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const listboxId = `${id}-listbox`;
  const selectedIndex = Math.max(0, aspects.indexOf(value));

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (containerRef.current?.contains(event.target as Node)) return;
      setIsOpen(false);
      setIsFiltering(false);
      setQuery("");
      setActiveIndex(0);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [isOpen, value]);

  const filteredAspects = useMemo(() => {
    if (!isFiltering) return aspects;

    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return aspects;

    return aspects.filter((aspect) => {
      const name = aspectName(aspect).toLowerCase();
      return (
        aspect.toLowerCase().includes(normalizedQuery) ||
        name.includes(normalizedQuery) ||
        aspectLabel(aspect).toLowerCase().includes(normalizedQuery)
      );
    });
  }, [aspects, query, isFiltering]);

  const highlightedIndex = filteredAspects.length ? Math.min(activeIndex, filteredAspects.length - 1) : 0;
  const activeAspect = filteredAspects[highlightedIndex];

  const closeMenu = () => {
    setIsOpen(false);
    setIsFiltering(false);
    setQuery("");
    setActiveIndex(0);
  };

  const selectAspect = (aspect: string) => {
    setIsOpen(false);
    setIsFiltering(false);
    setQuery("");
    setActiveIndex(Math.max(0, aspects.indexOf(aspect)));
    onChange(aspect);
  };

  const openMenu = () => {
    setIsOpen(true);
    setIsFiltering(false);
    setActiveIndex(selectedIndex);
  };

  const handleBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (!event.relatedTarget || !containerRef.current?.contains(event.relatedTarget as Node)) closeMenu();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (!isOpen) {
        openMenu();
        return;
      }
      setActiveIndex((index) => Math.min(index + 1, Math.max(0, filteredAspects.length - 1)));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      if (!isOpen) {
        openMenu();
        return;
      }
      setActiveIndex((index) => Math.max(index - 1, 0));
    } else if (event.key === "Home" && isOpen) {
      event.preventDefault();
      setActiveIndex(0);
    } else if (event.key === "End" && isOpen) {
      event.preventDefault();
      setActiveIndex(Math.max(0, filteredAspects.length - 1));
    } else if (event.key === "Enter" && isOpen && activeAspect) {
      event.preventDefault();
      selectAspect(activeAspect);
    } else if (event.key === "Escape" && isOpen) {
      event.preventDefault();
      closeMenu();
    }
  };

  return (
    <div ref={containerRef} className="block" onBlur={handleBlur}>
      <label className="mb-2 block text-xs font-medium text-[var(--muted-foreground)]" htmlFor={id}>
        {label}
      </label>
      <div className="relative">
        <div
          className={cn(
            "relative flex h-12 items-center rounded-md border border-[var(--border)] bg-[var(--input)] focus-within:border-[var(--primary)] focus-within:ring-2 focus-within:ring-[var(--ring)]",
            isOpen && "border-[var(--primary)]",
          )}
        >
          <img className="ml-3 size-8 shrink-0 object-contain" src={aspectImage(value)} alt="" />
          <input
            id={id}
            className="min-w-0 flex-1 truncate bg-transparent px-2 text-sm font-medium text-[var(--foreground)] outline-none placeholder:text-[var(--muted-foreground)]"
            value={isFiltering ? query : aspectLabel(value)}
            placeholder="Search aspects"
            role="combobox"
            aria-autocomplete="list"
            aria-controls={listboxId}
            aria-expanded={isOpen}
            aria-haspopup="listbox"
            aria-activedescendant={isOpen && activeAspect ? `${id}-option-${activeAspect}` : undefined}
            autoComplete="off"
            onChange={(event) => {
              setQuery(event.target.value);
              setIsFiltering(true);
              setIsOpen(true);
              setActiveIndex(0);
            }}
            onFocus={(event) => {
              event.currentTarget.select();
              openMenu();
            }}
            onClick={() => {
              if (!isOpen) openMenu();
            }}
            onKeyDown={handleKeyDown}
          />
          <button
            type="button"
            className="mr-1 grid size-9 shrink-0 place-items-center rounded text-[var(--muted-foreground)] outline-none hover:bg-[var(--muted)] focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
            aria-label={`${isOpen ? "Close" : "Open"} ${label.toLowerCase()} aspect list`}
            tabIndex={-1}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => (isOpen ? closeMenu() : openMenu())}
          >
            <CaretDown className={cn(isOpen && "rotate-180")} size={16} weight="bold" />
          </button>
        </div>

        {isOpen && (
          <div
            id={listboxId}
            className="absolute z-30 mt-1 max-h-64 w-full overflow-y-auto rounded-md border border-[var(--border-strong)] bg-[var(--surface)] p-1 shadow-xl"
            role="listbox"
            aria-label={`${label} aspect options`}
          >
            {filteredAspects.length > 0 ? (
              filteredAspects.map((aspect, index) => (
                <button
                  id={`${id}-option-${aspect}`}
                  key={aspect}
                  type="button"
                  role="option"
                  aria-selected={aspect === value}
                  tabIndex={-1}
                  className={cn(
                    "flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-sm outline-none",
                    index === highlightedIndex
                      ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                      : "hover:bg-[var(--muted)]",
                  )}
                  onMouseDown={(event) => event.preventDefault()}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => selectAspect(aspect)}
                >
                  <img className="size-8 shrink-0 object-contain" src={aspectImage(aspect)} alt="" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium">{aspectName(aspect)}</span>
                    <span
                      className={cn(
                        "block truncate text-xs",
                        index === highlightedIndex ? "text-[var(--primary-foreground)]/75" : "text-[var(--muted-foreground)]",
                      )}
                    >
                      {aspect}
                    </span>
                  </span>
                  {aspect === value && <Check className="shrink-0" size={16} weight="bold" />}
                </button>
              ))
            ) : (
              <p className="px-2 py-3 text-xs text-[var(--muted-foreground)]">No matching aspects</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
