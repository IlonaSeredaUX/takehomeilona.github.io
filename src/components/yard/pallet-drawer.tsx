import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { Button } from "@/components/yard/button";
import { PalletPill } from "@/components/yard/status-pill";
import {
  downstreamStaged,
  eligibilityLabel,
  isBlocking,
  isEligible,
  locationLabel,
  palletsForDock,
  QA_REASON_LABEL,
} from "@/lib/yard/logic";
import { docks, useYard } from "@/lib/yard/store";

export function PalletDrawer() {
  const pallets = useYard((state) => state.pallets);
  const selectedPalletId = useYard((state) => state.selectedPalletId);
  const closePallet = useYard((state) => state.closePallet);
  const openPallet = useYard((state) => state.openPallet);
  const completeQa = useYard((state) => state.completeQa);
  const loadPallet = useYard((state) => state.loadPallet);
  const finishPick = useYard((state) => state.finishPick);

  const pallet = pallets.find((item) => item.id === selectedPalletId) ?? null;
  const dock = pallet ? docks.find((item) => item.id === pallet.dockId) ?? null : null;
  const mates = pallet ? palletsForDock(pallets, pallet.dockId) : [];
  const held = pallet && isBlocking(pallet, mates) ? downstreamStaged(pallet, mates) : [];

  return (
    <Dialog.Root open={Boolean(pallet && dock)} onOpenChange={(open) => { if (!open) closePallet(); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-ink/40" />
        <Dialog.Content className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-surface shadow-lg focus:outline-none">
          {pallet && dock ? (
            <>
              <div className="flex items-start justify-between gap-3 border-b border-line px-4 py-4">
                <div>
                  <Dialog.Description className="text-xs font-medium uppercase tracking-wide text-muted">
                    Door {dock.id} · {dock.truck.code}
                  </Dialog.Description>
                  <Dialog.Title className="font-mono text-2xl font-semibold tracking-wide">
                    {pallet.id}
                  </Dialog.Title>
                </div>
                <Dialog.Close asChild>
                  <Button variant="quiet" aria-label="Close pallet details" className="size-11 px-0">
                    <X className="size-4" aria-hidden="true" />
                  </Button>
                </Dialog.Close>
              </div>

              <div className="flex-1 overflow-y-auto px-4 py-4">
                <PalletPill pallet={pallet} mates={mates} />
                <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                  <Field label="Route" value={dock.truck.route} />
                  <Field label="Delivery stop" value={`${pallet.stop} · ${pallet.stopName}`} />
                  <Field label="Load sequence" value={`${pallet.sequence} of ${mates.length}`} />
                  <Field label="Position" value={positionText(pallet.sequence)} />
                  <Field label="Location" value={locationLabel(pallet, dock)} />
                  <Field label="Picker" value={pallet.picker} />
                  <Field label="Cases" value={String(pallet.items)} />
                  <Field label="Weight" value={`${pallet.weightKg} kg`} />
                </dl>

                <div className="mt-4 rounded-md border border-line bg-sunken px-3 py-3 text-sm">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted">Loading eligibility</p>
                  <p className="mt-1">{eligibilityLabel(pallet, mates)}</p>
                </div>

                {pallet.qaReason ? (
                  <div
                    className={
                      pallet.status === "qa"
                        ? "mt-3 rounded-md border border-warn bg-warn-soft px-3 py-3 text-sm text-warn-ink"
                        : "mt-3 rounded-md border border-ok bg-ok-soft px-3 py-3 text-sm text-ok-ink"
                    }
                  >
                    <p className="text-xs font-medium uppercase tracking-wide">
                      {pallet.status === "qa" ? "QA reason" : "QA passed"}
                    </p>
                    <p className="mt-1 font-semibold">{QA_REASON_LABEL[pallet.qaReason]}</p>
                    {pallet.note ? <p className="mt-1">{pallet.note}</p> : null}
                  </div>
                ) : null}

                {held.length > 0 ? (
                  <div className="mt-3 rounded-md border border-danger bg-danger-soft px-3 py-3 text-sm text-danger-ink">
                    <p className="font-semibold">
                      Holds {held.length} downstream {held.length === 1 ? "pallet" : "pallets"}
                    </p>
                    <ul className="mt-2 flex flex-col gap-1">
                      {held.map((item) => (
                        <li key={item.id}>
                          <button
                            type="button"
                            className="font-mono font-semibold underline-offset-2 hover:underline"
                            onClick={() => openPallet(item.id)}
                          >
                            {item.id}
                          </button>
                          <span>
                            {" "}
                            · stop {item.stop} · sequence {item.sequence} · staging
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {pallet.status === "picking" ? (
                  <p className="mt-3 text-xs text-muted">
                    Pick confirmation is simulated here. In the warehouse it comes from the forklift scan.
                  </p>
                ) : null}
              </div>

              <div className="flex flex-col gap-2 border-t border-line px-4 py-3">
                {pallet.status === "qa" ? (
                  <Button className="w-full" onClick={() => completeQa(pallet.id)}>
                    Complete QA inspection
                  </Button>
                ) : null}
                {isEligible(pallet, mates) ? (
                  <Button className="w-full" onClick={() => loadPallet(pallet.id)}>
                    Load onto {dock.truck.code}
                  </Button>
                ) : null}
                {pallet.status === "picking" ? (
                  <Button className="w-full" variant="quiet" onClick={() => finishPick(pallet.id)}>
                    Confirm pick complete
                  </Button>
                ) : null}
                {pallet.status === "loaded" ? (
                  <p className="text-sm text-muted">This pallet is already on the truck.</p>
                ) : null}
              </div>
            </>
          ) : (
            <Dialog.Title className="sr-only">Pallet</Dialog.Title>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="truncate font-medium">{value}</dd>
    </div>
  );
}

function positionText(sequence: number): string {
  const row = Math.ceil(sequence / 2);
  const side = sequence % 2 === 1 ? "left" : "right";
  return `Row ${row}, ${side}`;
}
