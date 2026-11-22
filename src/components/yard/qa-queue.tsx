import { Link } from "@tanstack/react-router";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/yard/button";
import { QA_REASON_LABEL, qaQueue } from "@/lib/yard/logic";
import { docks, useYard } from "@/lib/yard/store";

export function QaQueue() {
  const pallets = useYard((state) => state.pallets);
  const openPallet = useYard((state) => state.openPallet);
  const completeQa = useYard((state) => state.completeQa);
  const rows = qaQueue(docks, pallets);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">QA queue</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted">
          Pallets waiting in the QA area beside each door. A check blocks the truck only when that
          pallet is next to load. Clear those first.
        </p>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-md border border-ok bg-ok-soft px-4 py-6 text-sm text-ok-ink">
          <p className="font-semibold">QA queue is clear</p>
          <p className="mt-1">No pallets are waiting for inspection.</p>
        </div>
      ) : (
        <ol className="flex flex-col gap-3">
          {rows.map((row, index) => (
            <li
              key={row.pallet.id}
              className={
                row.blocking
                  ? "rounded-md border border-danger bg-surface p-3"
                  : "rounded-md border border-line bg-surface p-3"
              }
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted">
                    {row.blocking ? "Blocking · priority" : "Not blocking"} · {index + 1}
                  </p>
                  <p className="font-mono text-xl font-semibold tracking-wide">{row.pallet.id}</p>
                  <p className="text-sm text-muted">
                    Door {row.dock.id} · {row.dock.truck.code} · {row.dock.truck.route}
                  </p>
                </div>
                <span
                  className={
                    row.blocking
                      ? "inline-flex items-center gap-1 rounded-md bg-danger-soft px-2 py-1 text-xs font-medium text-danger-ink"
                      : "inline-flex items-center gap-1 rounded-md bg-warn-soft px-2 py-1 text-xs font-medium text-warn-ink"
                  }
                >
                  <ShieldAlert className="size-3.5" aria-hidden="true" />
                  {row.pallet.qaReason ? QA_REASON_LABEL[row.pallet.qaReason] : "QA"}
                </span>
              </div>

              <dl className="mt-3 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                <div>
                  <dt className="text-xs text-muted">Stop</dt>
                  <dd>
                    {row.pallet.stop} · {row.pallet.stopName}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted">Sequence</dt>
                  <dd className="tabular-nums">{row.pallet.sequence}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted">Blocking</dt>
                  <dd>{row.blocking ? "Yes" : "No"}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted">Downstream held</dt>
                  <dd className="tabular-nums">{row.downstream.length}</dd>
                </div>
              </dl>

              {row.pallet.note ? <p className="mt-3 text-sm text-muted">{row.pallet.note}</p> : null}
              {row.downstream.length > 0 ? (
                <p className="mt-2 text-sm">
                  Held in staging:{" "}
                  <span className="font-mono font-semibold">
                    {row.downstream.map((pallet) => pallet.id).join(", ")}
                  </span>
                </p>
              ) : null}

              <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                <Button className="sm:flex-1" onClick={() => completeQa(row.pallet.id)}>
                  Complete inspection
                </Button>
                <Button variant="quiet" className="sm:flex-1" onClick={() => openPallet(row.pallet.id)}>
                  Pallet details
                </Button>
                <Link
                  to="/docks/$dockId"
                  params={{ dockId: row.dock.id }}
                  className="inline-flex min-h-11 items-center justify-center rounded-md border border-line px-3 text-sm font-medium hover:bg-sunken"
                >
                  Open door
                </Link>
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
