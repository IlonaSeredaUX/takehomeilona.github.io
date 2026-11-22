import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/yard/button";
import { Legend, LoadStrip, PalletPill, PhasePill } from "@/components/yard/status-pill";
import { TruckLayout } from "@/components/yard/truck-layout";
import {
  countStatus,
  dockPhase,
  downstreamStaged,
  isHeld,
  nextAction,
  palletsForDock,
  QA_REASON_LABEL,
} from "@/lib/yard/logic";
import { docks, useYard } from "@/lib/yard/store";

export function DockDetail({ dockId }: { dockId: string }) {
  const pallets = useYard((state) => state.pallets);
  const selectedPalletId = useYard((state) => state.selectedPalletId);
  const openPallet = useYard((state) => state.openPallet);
  const loadPallet = useYard((state) => state.loadPallet);
  const finishPick = useYard((state) => state.finishPick);
  const dock = docks.find((item) => item.id === dockId);

  if (!dock) {
    return (
      <div className="rounded-md border border-line bg-surface p-6">
        <h1 className="text-lg font-semibold">Door not found</h1>
        <p className="mt-1 text-sm text-muted">This warehouse has doors 1 to 5.</p>
        <Link to="/" className="mt-4 inline-flex min-h-11 items-center text-sm font-medium text-primary">
          Back to the yard
        </Link>
      </div>
    );
  }

  const mates = palletsForDock(pallets, dock.id);
  const phase = dockPhase(mates);
  const loaded = countStatus(mates, "loaded");
  const action = nextAction(mates);
  const maxStop = Math.max(...dock.truck.stops.map((stop) => stop.number));
  let lastStop = -1;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3">
        <Link
          to="/"
          className="inline-flex min-h-11 w-fit items-center gap-1 text-sm font-medium text-primary"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          All doors
        </Link>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted">Door {dock.id}</p>
            <h1 className="text-xl font-semibold tracking-tight">
              <span className="font-mono">{dock.truck.code}</span>
              <span className="text-muted"> · {dock.truck.route}</span>
            </h1>
            <p className="mt-1 text-sm text-muted">
              Driver {dock.truck.driver} · departs {dock.truck.departs} · {mates.length} pallets planned
            </p>
          </div>
          <PhasePill phase={phase} />
        </div>
        <div>
          <div className="mb-1 flex items-baseline justify-between text-sm">
            <span className="font-medium tabular-nums">
              {loaded} / {mates.length} loaded
            </span>
            <span className="text-muted">
              Picking {countStatus(mates, "picking")} · QA {countStatus(mates, "qa")} · Staging{" "}
              {countStatus(mates, "staging")}
            </span>
          </div>
          <div
            role="progressbar"
            aria-valuenow={loaded}
            aria-valuemin={0}
            aria-valuemax={mates.length}
            aria-label={`${loaded} of ${mates.length} pallets loaded`}
            className="h-2 overflow-hidden rounded-full bg-sunken"
          >
            <div
              className={phase === "blocked" ? "h-full bg-danger" : "h-full bg-ok"}
              style={{ width: `${mates.length === 0 ? 0 : (loaded / mates.length) * 100}%` }}
            />
          </div>
        </div>
        <LoadStrip pallets={mates} />
      </div>

      <div className="grid items-start gap-4 lg:grid-cols-5">
        <div className="flex flex-col gap-3 lg:col-span-3">
          <div className="flex items-end justify-between gap-3">
            <h2 className="text-sm font-semibold">Truck layout</h2>
            <p className="text-xs text-muted">Two pallets per row · max 20</p>
          </div>
          <TruckLayout pallets={mates} selectedId={selectedPalletId} onSelect={openPallet} />
          <p className="text-sm text-muted">
            The nose is loaded first so the last stop sits deepest. The door end unloads first.
          </p>
          <Legend />
        </div>

        <div className="flex flex-col gap-3 lg:col-span-2 lg:sticky lg:top-4">
          <h2 className="text-sm font-semibold">Load sequence</h2>
          {phase === "blocked" && action.kind === "inspect" ? (
            <div className="rounded-md border border-danger bg-danger-soft px-3 py-3 text-sm text-danger-ink">
              <p className="font-semibold">Loading is blocked</p>
              <p className="mt-1">
                Next pallet {action.pallet.id} is in the QA area
                {action.pallet.qaReason
                  ? ` for ${QA_REASON_LABEL[action.pallet.qaReason].toLowerCase()}`
                  : ""}
                . {downstreamStaged(action.pallet, mates).length} staged pallets cannot load until QA
                clears and {action.pallet.id} is on the truck.
              </p>
            </div>
          ) : null}
          {action.kind === "load" ? (
            <div className="rounded-md border border-primary bg-primary-soft px-3 py-3 text-sm text-primary">
              <p className="font-semibold">Ready to load</p>
              <p className="mt-1">
                {action.pallet.id} is staged and is next in sequence.
              </p>
            </div>
          ) : null}
          {action.kind === "pick" ? (
            <div className="rounded-md border border-warn bg-warn-soft px-3 py-3 text-sm text-warn-ink">
              <p className="font-semibold">Waiting on the pick</p>
              <p className="mt-1">
                {action.pallet.id} is next, but it is still being picked by {action.pallet.picker}.
              </p>
            </div>
          ) : null}
          {action.kind === "complete" ? (
            <div className="rounded-md border border-ok bg-ok-soft px-3 py-3 text-sm text-ok-ink">
              <p className="font-semibold">Truck is fully loaded</p>
              <p className="mt-1">All planned pallets are on {dock.truck.code}.</p>
            </div>
          ) : null}

          {action.kind === "load" ? (
            <Button className="w-full" onClick={() => loadPallet(action.pallet.id)}>
              Load {action.pallet.id}
            </Button>
          ) : null}
          {action.kind === "inspect" ? (
            <Button className="w-full" variant="danger" onClick={() => openPallet(action.pallet.id)}>
              Inspect {action.pallet.id}
            </Button>
          ) : null}
          {action.kind === "pick" ? (
            <Button className="w-full" variant="quiet" onClick={() => finishPick(action.pallet.id)}>
              Confirm pick {action.pallet.id}
            </Button>
          ) : null}

          <ol className="overflow-hidden rounded-md border border-line bg-surface">
            {mates.map((pallet) => {
              const showStop = pallet.stop !== lastStop;
              lastStop = pallet.stop;
              const held = isHeld(pallet, mates);
              return (
                <li key={pallet.id}>
                  {showStop ? (
                    <div className="border-b border-line bg-sunken px-3 py-1.5 text-xs font-medium text-muted">
                      Stop {pallet.stop} · {pallet.stopName}
                      {pallet.stop === maxStop ? " · loads first" : ""}
                      {pallet.stop === 1 ? " · unloads first" : ""}
                    </div>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => openPallet(pallet.id)}
                    className="flex min-h-11 w-full items-center gap-3 border-b border-line px-3 py-2 text-left last:border-b-0 hover:bg-sunken focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                  >
                    <span className="w-6 text-xs tabular-nums text-muted">{pallet.sequence}</span>
                    <span className="w-14 font-mono text-sm font-semibold">{pallet.id}</span>
                    <span className="min-w-0 flex-1 truncate text-xs text-muted">
                      {pallet.status === "loaded"
                        ? "On truck"
                        : pallet.status === "qa"
                          ? "QA area"
                          : pallet.status === "picking"
                            ? "Being picked"
                            : held
                              ? "Staging · held"
                              : "Staging"}
                    </span>
                    <PalletPill pallet={pallet} mates={mates} />
                  </button>
                </li>
              );
            })}
          </ol>
        </div>
      </div>

      <p className="text-sm text-muted">
        Delivery order:{" "}
        {dock.truck.stops
          .slice()
          .sort((a, b) => a.number - b.number)
          .map((stop) => `${stop.number} ${stop.name}`)
          .join(" → ")}
        . Load order is the reverse.
      </p>
    </div>
  );
}
