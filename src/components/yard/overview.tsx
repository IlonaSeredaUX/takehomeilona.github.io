import { Link } from "@tanstack/react-router";
import { ChevronRight, Eye } from "lucide-react";
import { Legend, LoadStrip, PhasePill } from "@/components/yard/status-pill";
import { cn } from "@/lib/cn";
import {
  attentionItems,
  countStatus,
  dockPhase,
  nextPallet,
  palletsForDock,
  yardSummary,
} from "@/lib/yard/logic";
import { docks, useYard } from "@/lib/yard/store";

const severityStyle = {
  critical: "border-danger bg-danger-soft text-danger-ink",
  warning: "border-warn bg-warn-soft text-warn-ink",
  watch: "border-line bg-surface text-ink",
} as const;

const severityLabel = {
  critical: "Critical",
  warning: "Attention",
  watch: "Watch",
} as const;

export function Overview() {
  const pallets = useYard((state) => state.pallets);
  const closePallet = useYard((state) => state.closePallet);
  const summary = yardSummary(docks, pallets);
  const attention = attentionItems(docks, pallets);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Yard overview</h1>
          <p className="mt-1 text-sm text-muted">Shift A · load order is FILO, nose first</p>
        </div>
        <Legend />
      </div>

      <dl className="grid grid-cols-2 overflow-hidden rounded-md border border-line bg-surface sm:grid-cols-5">
        <Stat label="Doors" value={String(summary.doors)} />
        <Stat
          label="Blocked"
          value={String(summary.blocked)}
          tone={summary.blocked > 0 ? "danger" : "ok"}
        />
        <Stat label="Ready to load" value={String(summary.ready)} />
        <Stat
          label="Awaiting QA"
          value={String(summary.qa)}
          tone={summary.qa > 0 ? "warn" : "default"}
        />
        <Stat label="On trucks" value={`${summary.loaded}/${summary.planned}`} />
      </dl>

      <section className="flex flex-col gap-2">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="text-sm font-semibold">Needs attention</h2>
          <span className="text-xs tabular-nums text-muted">{attention.length}</span>
        </div>
        {attention.length === 0 ? (
          <p className="rounded-md border border-line bg-surface px-3 py-3 text-sm text-muted">
            No blockers. Every door can keep moving.
          </p>
        ) : (
          <ul className="grid gap-2 lg:grid-cols-3">
            {attention.map((item) => {
              const className = cn(
                "block h-full rounded-md border px-3 py-3 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
                severityStyle[item.severity],
              );
              const body = (
                <>
                  <span className="text-xs font-medium uppercase tracking-wide">
                    {severityLabel[item.severity]}
                  </span>
                  <span className="mt-1 block text-sm font-semibold">{item.title}</span>
                  <span className="mt-1 block text-sm font-normal leading-snug">{item.detail}</span>
                  <span className="mt-2 inline-flex items-center gap-1 text-xs font-medium">
                    {item.dockId ? `Open door ${item.dockId}` : "Open QA queue"}
                    <ChevronRight className="size-3.5" aria-hidden="true" />
                  </span>
                </>
              );
              return (
                <li key={item.id}>
                  {item.dockId ? (
                    <Link
                      to="/docks/$dockId"
                      params={{ dockId: item.dockId }}
                      onClick={() => closePallet()}
                      className={className}
                    >
                      {body}
                    </Link>
                  ) : (
                    <Link to="/qa" onClick={() => closePallet()} className={className}>
                      {body}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {docks.map((dock) => {
          const mates = palletsForDock(pallets, dock.id);
          const phase = dockPhase(mates);
          const loaded = countStatus(mates, "loaded");
          const next = nextPallet(mates);
          const held = countStatus(mates, "staging");
          return (
            <Link
              key={dock.id}
              to="/docks/$dockId"
              params={{ dockId: dock.id }}
              onClick={() => closePallet()}
              className={cn(
                "flex flex-col gap-2 rounded-md border border-line bg-surface p-3 transition-colors hover:border-line-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
                phase === "blocked" && "border-danger",
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted">Door {dock.id}</p>
                  <p className="truncate font-mono text-sm font-semibold tracking-wide">{dock.truck.code}</p>
                  <p className="truncate text-xs text-muted">
                    {dock.truck.route} · {dock.truck.departs}
                  </p>
                </div>
                <PhasePill phase={phase} />
              </div>
              <div>
                <p className="mb-1 text-sm font-medium tabular-nums">
                  {loaded} / {mates.length} loaded
                </p>
                <div
                  role="progressbar"
                  aria-valuenow={loaded}
                  aria-valuemin={0}
                  aria-valuemax={mates.length}
                  aria-label={`${loaded} of ${mates.length} pallets loaded on door ${dock.id}`}
                  className="h-2 overflow-hidden rounded-full bg-sunken"
                >
                  <div
                    className={cn("h-full", phase === "blocked" ? "bg-danger" : "bg-ok")}
                    style={{ width: `${mates.length === 0 ? 0 : (loaded / mates.length) * 100}%` }}
                  />
                </div>
              </div>
              <LoadStrip pallets={mates} compact />
              <p className="text-xs text-muted">
                Picking {countStatus(mates, "picking")} · QA {countStatus(mates, "qa")} · Staging {held}
              </p>
              <p className="border-t border-line pt-2 text-sm">
                {next ? (
                  <>
                    <span className="text-muted">Next </span>
                    <span className="font-mono font-semibold">{next.id}</span>
                    <span className="text-muted">
                      {" "}
                      · {next.status === "qa" ? "in QA" : next.status === "staging" ? "staged" : "picking"}
                      {phase === "blocked" ? ` · holds ${held}` : ""}
                      {phase === "loading" || phase === "finishing" ? " · ready" : ""}
                    </span>
                  </>
                ) : (
                  <span className="text-muted">Truck is full</span>
                )}
              </p>
            </Link>
          );
        })}
      </section>

      <details className="rounded-md border border-line bg-surface px-3 py-3 text-sm">
        <summary className="font-medium text-ink">How loading order works</summary>
        <p className="mt-2 max-w-3xl leading-relaxed text-muted">
          Pallets load in reverse delivery order (FILO). The last stop goes in first, toward the nose,
          two pallets per row, up to 20. The first stop stays at the door so it unloads first. A pallet
          loads only when it is next in that sequence and is not awaiting QA. If the next pallet is in
          QA, later pallets that are already picked wait in that door’s staging area.
        </p>
      </details>
      <p className="inline-flex items-start gap-2 text-sm text-muted">
        <Eye className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        <span>
          Open a blocked door to see the load front. The pallet in QA that is next in sequence is the
          one holding the truck.
        </span>
      </p>
    </div>
  );
}

function Stat({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: "default" | "danger" | "ok" | "warn";
}) {
  const toneClass = {
    default: "text-ink",
    danger: "text-danger-ink",
    ok: "text-ok-ink",
    warn: "text-warn-ink",
  }[tone];
  return (
    <div className="border-b border-line px-3 py-3 sm:border-b-0 sm:border-r sm:last:border-r-0">
      <dt className="text-xs text-muted">{label}</dt>
      <dd className={cn("text-lg font-semibold tabular-nums", toneClass)}>{value}</dd>
    </div>
  );
}
