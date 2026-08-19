import { useEffect, useRef } from "react";
import { ArrowDown, ArrowsLeftRight, Check, MagicWand } from "@phosphor-icons/react";
import { AspectSelect } from "./aspect-select";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { addons, versions } from "../lib/research";

type ConnectionSetupProps = {
  version: string;
  aspects: string[];
  from: string;
  to: string;
  minimumSteps: number;
  available: Set<string>;
  onVersionChange: (version: string) => void;
  onFromChange: (aspect: string) => void;
  onToChange: (aspect: string) => void;
  onMinimumStepsChange: (steps: number) => void;
  onSwap: () => void;
  onAddConnection: () => void;
  onToggleAddon: (addonId: string, enabled: boolean) => void;
};

export function ConnectionSetup({
  version,
  aspects,
  from,
  to,
  minimumSteps,
  available,
  onVersionChange,
  onFromChange,
  onToChange,
  onMinimumStepsChange,
  onSwap,
  onAddConnection,
  onToggleAddon,
}: ConnectionSetupProps) {
  const minimumStepsInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const input = minimumStepsInputRef.current;
    if (!input) return;

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();

      const nextValue = minimumSteps + (event.deltaY < 0 ? 1 : -1);
      if (nextValue < 1 || nextValue > 99) return;

      onMinimumStepsChange(nextValue);
    };

    input.addEventListener("wheel", handleWheel, { passive: false });
    return () => input.removeEventListener("wheel", handleWheel);
  }, [minimumSteps, onMinimumStepsChange]);

  return (
    <aside className="h-fit rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 lg:sticky lg:top-6">
      <div className="mb-5">
        <h2 className="text-sm font-semibold">Connection setup</h2>
        <p className="mt-1 text-xs leading-relaxed text-[var(--muted-foreground)]">
          Choose two aspects and the blank spaces between them.
        </p>
      </div>

      <div className="space-y-4">
        <label className="block" htmlFor="version">
          <span className="mb-2 block text-xs font-medium text-[var(--muted-foreground)]">Version</span>
          <span className="relative block">
            <select
              id="version"
              className="h-10 w-full appearance-none rounded-md border border-[var(--border)] bg-[var(--input)] px-3 pr-8 text-sm outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--ring)]"
              value={version}
              onChange={(event) => onVersionChange(event.target.value)}
            >
              {Object.keys(versions).map((versionNumber) => (
                <option key={versionNumber} value={versionNumber}>
                  Thaumcraft {versionNumber}
                </option>
              ))}
            </select>
            <ArrowDown
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]"
              size={14}
            />
          </span>
        </label>

        <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-2 lg:grid-cols-1">
          <AspectSelect id="from" label="From" value={from} aspects={aspects} onChange={onFromChange} />
          <Button
            className="mb-1 lg:mx-auto lg:-my-1"
            variant="ghost"
            size="icon"
            aria-label="Swap from and to aspects"
            title="Swap aspects"
            onClick={onSwap}
          >
            <ArrowsLeftRight className="lg:rotate-90" size={18} />
          </Button>
          <AspectSelect id="to" label="To" value={to} aspects={aspects} onChange={onToChange} />
        </div>

        <label className="block" htmlFor="steps">
          <span className="mb-2 block text-xs font-medium text-[var(--muted-foreground)]">Minimum steps</span>
          <Input
            id="steps"
            ref={minimumStepsInputRef}
            type="number"
            min={1}
            max={99}
            step={1}
            value={minimumSteps}
            onChange={(event) => {
              const value = Math.min(99, Math.max(1, Number(event.target.value) || 1));
              onMinimumStepsChange(value);
            }}
          />
        </label>

        <Button className="w-full" onClick={onAddConnection}>
          <MagicWand size={17} weight="bold" />
          Add connection
        </Button>
      </div>

      <div className="my-5 h-px bg-[var(--border)]" />

      <fieldset>
        <legend className="text-xs font-medium text-[var(--muted-foreground)]">Addon aspects</legend>
        <div className="mt-3 space-y-2.5">
          {Object.entries(addons).map(([addonId, addon]) => {
            const enabled = addon.aspects.every((aspect) => available.has(aspect));
            return (
              <label key={addonId} className="flex cursor-pointer items-center gap-2.5 text-sm">
                <span className="relative grid size-4 place-items-center">
                  <input
                    className="peer size-4 appearance-none rounded border border-[var(--border-strong)] bg-[var(--input)] checked:border-[var(--primary)] checked:bg-[var(--primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
                    type="checkbox"
                    checked={enabled}
                    onChange={(event) => onToggleAddon(addonId, event.target.checked)}
                  />
                  <Check
                    className="pointer-events-none absolute hidden text-[var(--primary-foreground)] peer-checked:block"
                    size={11}
                    weight="bold"
                  />
                </span>
                <span>{addon.name}</span>
                <span className="ml-auto text-xs tabular-nums text-[var(--muted-foreground)]">
                  {addon.aspects.length}
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>
    </aside>
  );
}
