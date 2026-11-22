import { cn } from "@/lib/cn";
import { isBlocking, isEligible, isHeld, slotOf } from "@/lib/yard/logic";
import type { Pallet } from "@/lib/yard/types";
import { PalletPill } from "@/components/yard/status-pill";

export function TruckLayout({
  pallets,
  selectedId,
  onSelect,
}: {
  pallets: Pallet[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const rows: Pallet[][] = [];
  for (let index = 0; index < pallets.length; index += 2) {
    rows.push(pallets.slice(index, index + 2));
  }

  return (
    <div className="overflow-hidden rounded-md border border-line bg-surface">
      <div className="flex items-center justify-between border-b-4 border-ink bg-sunken px-3 py-2">
        <p className="text-xs font-medium uppercase tracking-wide text-muted">Nose · first in</p>
        <p className="text-xs text-faint">Last delivery stop</p>
      </div>
      <div className="grid grid-cols-[auto_1fr_1fr] gap-x-2 px-3 pt-2 text-xs text-faint">
        <span />
        <span>Left</span>
        <span>Right</span>
      </div>
      <div className="flex flex-col gap-2 p-3">
        {rows.map((row) => {
          const rowNumber = slotOf(row[0]!.sequence).row;
          return (
            <div key={rowNumber} className="grid grid-cols-[auto_1fr_1fr] items-stretch gap-2">
              <span className="flex w-6 items-center text-xs tabular-nums text-faint">{rowNumber}</span>
              <Slot pallet={row[0]} mates={pallets} selectedId={selectedId} onSelect={onSelect} />
              <Slot pallet={row[1]} mates={pallets} selectedId={selectedId} onSelect={onSelect} />
            </div>
          );
        })}
      </div>
      <div className="flex items-center gap-3 border-t border-dashed border-line-strong px-3 py-2">
        <span className="h-px flex-1 bg-line-strong" />
        <p className="text-xs font-medium uppercase tracking-wide text-muted">Door · last out</p>
        <span className="h-px flex-1 bg-line-strong" />
      </div>
    </div>
  );
}

function Slot({
  pallet,
  mates,
  selectedId,
  onSelect,
}: {
  pallet: Pallet | undefined;
  mates: Pallet[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  if (!pallet) {
    return (
      <div className="flex min-h-24 items-center justify-center rounded-md border border-dashed border-line text-xs text-faint">
        Open bay
      </div>
    );
  }

  const blocking = isBlocking(pallet, mates);
  const eligible = isEligible(pallet, mates);
  const held = isHeld(pallet, mates);
  const next = blocking || eligible || (pallet.status === "picking" && isLoadFront(pallet, mates));

  return (
    <button
      type="button"
      onClick={() => onSelect(pallet.id)}
      data-pallet={pallet.id}
      className={cn(
        "flex min-h-24 flex-col items-start gap-1 rounded-md border px-2 py-2 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
        slotClass(pallet, blocking, eligible, held),
        selectedId === pallet.id && "ring-2 ring-primary",
        next && selectedId !== pallet.id && "ring-2 ring-primary/50",
      )}
    >
      <span className="flex w-full items-center justify-between gap-2">
        <span className="font-mono text-xs text-muted">#{pallet.sequence}</span>
        {next ? <span className="text-xs font-medium text-primary">Next</span> : null}
      </span>
      <span className="font-mono text-base font-semibold tracking-wide">{pallet.id}</span>
      <PalletPill pallet={pallet} mates={mates} />
      <span className="text-xs text-muted">
        Stop {pallet.stop} · {pallet.stopName}
      </span>
    </button>
  );
}

function isLoadFront(pallet: Pallet, mates: Pallet[]): boolean {
  const open = mates.find((item) => item.status !== "loaded");
  return open?.id === pallet.id;
}

function slotClass(pallet: Pallet, blocking: boolean, eligible: boolean, held: boolean): string {
  if (pallet.status === "loaded") return "border-ok bg-ok-soft";
  if (blocking) return "border-danger bg-danger-soft";
  if (pallet.status === "qa") return "border-warn bg-warn-soft";
  if (eligible) return "border-primary bg-primary-soft";
  if (held) return "border-danger bg-surface";
  if (pallet.status === "picking") return "border-dashed border-line-strong bg-sunken";
  return "border-line bg-surface";
}
