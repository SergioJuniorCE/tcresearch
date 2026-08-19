import { useMemo, useReducer, useRef } from "react";
import { ConnectionSetup } from "./components/connection-setup";
import { ConnectionResults } from "./components/connection-results";
import { AspectLibrary } from "./components/aspect-library";
import { Badge } from "./components/ui/badge";
import {
  addons,
  aspectImage,
  createResearchData,
  defaultVersion,
  findConnection,
} from "./lib/research";
import type { ConnectionRoute } from "./lib/app-types";

type AppState = {
  version: string;
  from: string;
  to: string;
  minimumSteps: number;
  available: Set<string>;
  query: string;
  previewAspect: string | null;
  routes: ConnectionRoute[];
  searchMessage: string | null;
};

type AppAction =
  | { type: "version-changed"; version: string; available: Set<string>; from: string; to: string }
  | { type: "set-from"; value: string }
  | { type: "set-to"; value: string }
  | { type: "set-minimum-steps"; value: number }
  | { type: "set-availability"; value: Set<string> }
  | { type: "set-query"; value: string }
  | { type: "set-preview-aspect"; value: string | null }
  | { type: "swap-aspects" }
  | { type: "add-route"; route: ConnectionRoute }
  | { type: "remove-route"; routeId: string }
  | { type: "clear-routes" }
  | { type: "set-search-message"; value: string | null };

function createInitialAppState(): AppState {
  const initialData = createResearchData(defaultVersion);
  return {
    version: defaultVersion,
    from: "air",
    to: "air",
    minimumSteps: 1,
    available: new Set(initialData.allAspects),
    query: "",
    previewAspect: null,
    routes: [],
    searchMessage: null,
  };
}

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "version-changed":
      return {
        ...state,
        version: action.version,
        available: action.available,
        from: action.from,
        to: action.to,
        previewAspect: null,
        routes: [],
        searchMessage: null,
      };
    case "set-from":
      return { ...state, from: action.value, searchMessage: null };
    case "set-to":
      return { ...state, to: action.value, searchMessage: null };
    case "set-minimum-steps":
      return { ...state, minimumSteps: action.value, searchMessage: null };
    case "set-availability":
      return { ...state, available: action.value, searchMessage: null };
    case "set-query":
      return { ...state, query: action.value, previewAspect: null };
    case "set-preview-aspect":
      return { ...state, previewAspect: action.value };
    case "swap-aspects":
      return { ...state, from: state.to, to: state.from, searchMessage: null };
    case "add-route":
      return { ...state, routes: [...state.routes, action.route], searchMessage: null };
    case "remove-route":
      return { ...state, routes: state.routes.filter((route) => route.id !== action.routeId) };
    case "clear-routes":
      return { ...state, routes: [], searchMessage: null };
    case "set-search-message":
      return { ...state, searchMessage: action.value };
  }
}

function App() {
  const [state, dispatch] = useReducer(appReducer, undefined, createInitialAppState);
  const { version, from, to, minimumSteps, available, query, previewAspect, routes, searchMessage } = state;
  const data = useMemo(() => createResearchData(version), [version]);
  const routeIdRef = useRef(0);

  const setFrom = (value: string) => dispatch({ type: "set-from", value });
  const setTo = (value: string) => dispatch({ type: "set-to", value });
  const setMinimumSteps = (value: number) => dispatch({ type: "set-minimum-steps", value });
  const setQuery = (value: string) => dispatch({ type: "set-query", value });
  const setPreviewAspect = (value: string | null) => dispatch({ type: "set-preview-aspect", value });
  const setSearchMessage = (value: string | null) => dispatch({ type: "set-search-message", value });

  const updateVersion = (nextVersion: string) => {
    const nextData = createResearchData(nextVersion);
    const nextDefaultAspect = nextData.allAspects.includes("air") ? "air" : nextData.allAspects[0];
    dispatch({
      type: "version-changed",
      version: nextVersion,
      available: new Set(nextData.allAspects),
      from: nextDefaultAspect,
      to: nextDefaultAspect,
    });
  };

  const updateAvailability = (next: Set<string>) => {
    dispatch({ type: "set-availability", value: next });
  };

  const toggleAddon = (addonId: string, enabled: boolean) => {
    const next = new Set(available);
    addons[addonId].aspects.forEach((aspect) => {
      if (enabled) next.add(aspect);
      else next.delete(aspect);
    });
    updateAvailability(next);
  };

  const runSearch = () => {
    const path = findConnection(from, to, minimumSteps, data.combinations, available);
    if (!path) {
      setSearchMessage("No connection could be found with this version and step count.");
      return;
    }

    const route: ConnectionRoute = {
      id: `route-${routeIdRef.current++}`,
      from,
      to,
      path,
    };
    dispatch({ type: "add-route", route });
  };

  const clearRoutes = () => {
    dispatch({ type: "clear-routes" });
  };

  return (
    <div className="min-h-[100dvh] bg-[var(--background)] text-[var(--foreground)]">
      <header className="border-b border-[var(--border)]">
        <div className="mx-auto flex max-w-[1400px] items-center gap-3 px-4 py-4 sm:px-6 lg:px-8">
          <div className="grid size-10 place-items-center rounded-md border border-[var(--border)] bg-[var(--surface)]">
            <img className="size-7 object-contain" src={aspectImage("magic")} alt="" />
          </div>
          <div>
            <h1 className="text-base font-semibold tracking-tight sm:text-lg">Thaumcraft Research Helper</h1>
            <p className="text-xs text-[var(--muted-foreground)]">Aspect pathfinder for Thaumcraft 4.x and 5.x</p>
          </div>
          <Badge className="ml-auto hidden sm:inline-flex">Community tool</Badge>
        </div>
      </header>

      <main className="mx-auto grid max-w-[1400px] gap-8 px-4 py-6 sm:px-6 lg:grid-cols-[340px_minmax(0,1fr)] lg:px-8 lg:py-8">
        <ConnectionSetup
          version={version}
          aspects={data.allAspects}
          from={from}
          to={to}
          minimumSteps={minimumSteps}
          available={available}
          onVersionChange={updateVersion}
          onFromChange={setFrom}
          onToChange={setTo}
          onMinimumStepsChange={setMinimumSteps}
          onSwap={() => dispatch({ type: "swap-aspects" })}
          onAddConnection={runSearch}
          onToggleAddon={toggleAddon}
        />

        <div className="min-w-0 space-y-8">
          <ConnectionResults
            routes={routes}
            searchMessage={searchMessage}
            available={available}
            onClear={clearRoutes}
            onRemove={(routeId) => dispatch({ type: "remove-route", routeId })}
          />

          <AspectLibrary
            aspects={data.allAspects}
            coreAspects={data.coreAspects}
            combinations={data.combinations}
            available={available}
            query={query}
            previewAspect={previewAspect}
            onAvailabilityChange={updateAvailability}
            onQueryChange={setQuery}
            onPreviewChange={setPreviewAspect}
          />

          <section className="border-t border-[var(--border)] pt-6 text-sm text-[var(--muted-foreground)]">
            <details>
              <summary className="cursor-pointer font-medium text-[var(--foreground)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]">
                How to use this helper
              </summary>
              <div className="mt-3 max-w-3xl space-y-3 leading-relaxed">
                <p>
                  Match the From and To fields to the fixed aspects on your research note. Set Minimum steps to the
                  number of blank spaces between them, then select Add connection. Repeat for every route you need.
                </p>
                <p>
                  If a route uses an aspect you cannot craft, disable it in the library and add it again. When no fully
                  available route exists, the helper returns the route using the fewest unavailable aspects.
                </p>
              </div>
            </details>
          </section>
        </div>
      </main>

      <footer className="border-t border-[var(--border)] px-4 py-5 text-center text-xs text-[var(--muted-foreground)]">
        <p>
          Licensed under{" "}
          <a className="underline underline-offset-4 hover:text-[var(--foreground)]" href="https://creativecommons.org/licenses/by/4.0/">
            CC BY 4.0
          </a>
          . Source on{" "}
          <a className="underline underline-offset-4 hover:text-[var(--foreground)]" href="https://github.com/SergioJuniorCE/tcresearch">
            GitHub
          </a>
          . Original project by ythri.
        </p>
      </footer>
    </div>
  );
}

export default App;
