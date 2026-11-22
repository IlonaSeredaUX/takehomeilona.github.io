import {
  AlertTriangle,
  Check,
  Layers,
  Package,
  PackageCheck,
  ShieldAlert,
  Truck,
} from "lucide-react";
import type { ComponentType } from "react";
import { cn } from "@/lib/cn";
import { isBlocking, isEligible, isHeld, phaseLabel } from "@/lib/yard/logic";
import type { DockPhase, Pallet, PalletStatus } from "@/lib/yard/types";

const phaseStyles: Record<DockPhase, string> = {
  blocked: "bg-danger-soft text-danger-ink",
  loading: "bg-primary-soft text-primary",
  waiting_pick: "bg-warn-soft text-warn-ink",
  finishing: "bg-ok-soft text-ok-ink",
  complete: "bg-ok-soft text-ok-ink",
};

const phaseIcons: Record<DockPhase, ComponentType<{ className?: string }>> = {
  blocked: AlertTriangle,
  loading: Truck,
  waiting_pick: Package,
  finishing: PackageCheck,
  complete: Check,
};

export function PhasePill({ phase }: { phase: DockPhase }) {
  const Icon = phaseIcons[phase];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium",
        phaseStyles[phase],
      )}
    >
      <Icon className="size-3.5" aria-hidden="true" />
      {phaseLabel(phase)}
    </span>
  );
}

export function PalletPill({ pallet, mates }: { pallet: Pallet; mates: Pallet[] }) {
  const blocking = isBlocking(pallet, mates);
  const eligible = isEligible(pallet, mates);
  const held = isHeld(pallet, mates);
  const view = palletView(pallet.status, blocking, eligible, held);
  const Icon = view.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium",
        view.className,
      )}
    >
      <Icon className="size-3.5" aria-hidden="true" />
      {view.label}
    </span>
  );
}

function palletView(
  status: PalletStatus,
  blocking: boolean,
  eligible: boolean,
  held: boolean,
): { label: string; className: string; icon: ComponentType<{ className?: string }> } {
  if (status === "loaded") {
    return { label: "Loaded", className: "bg-ok-soft text-ok-ink", icon: PackageCheck };
  }
  if (status === "picking") {
    return { label: "Picking", className: "bg-sunken text-muted", icon: Package };
  }
  if (status === "qa" && blocking) {
    return { label: "QA blocking", className: "bg-danger-soft text-danger-ink", icon: AlertTriangle };
  }
  if (status === "qa") {
    return { label: "Awaiting QA", className: "bg-warn-soft text-warn-ink", icon: ShieldAlert };
  }
  if (eligible) {
    return { label: "Ready", className: "bg-primary-soft text-primary", icon: Layers };
  }
  if (held) {
    return { label: "Held", className: "bg-danger-soft text-danger-ink", icon: AlertTriangle };
  }
  return { label: "Staging", className: "border border-line bg-surface text-ink", icon: Layers };
}

const swatch: Record<PalletStatus, string> = {
  loaded: "bg-ok",
  picking: "bg-line-strong",
  qa: "bg-warn",
  staging: "bg-primary",
};

export function LoadStrip({ pallets, compact = false }: { pallets: Pallet[]; compact?: boolean }) {
  return (
    <div aria-hidden="true">
      <div className="flex gap-0.5">
        {pallets.map((pallet) => (
          <span
            key={pallet.id}
            className={cn(
              "h-2 flex-1 rounded-sm",
              isBlocking(pallet, pallets) ? "bg-danger" : swatch[pallet.status],
            )}
          />
        ))}
      </div>
      {!compact ? (
        <div className="mt-1 flex justify-between text-xs text-faint">
          <span>Nose</span>
          <span>Door</span>
        </div>
      ) : null}
    </div>
  );
}

export function Legend() {
  const items = [
    { label: "Loaded", className: "bg-ok", icon: PackageCheck },
    { label: "Picking", className: "bg-line-strong", icon: Package },
    { label: "QA", className: "bg-warn", icon: ShieldAlert },
    { label: "Staging", className: "bg-primary", icon: Layers },
    { label: "Blocked", className: "bg-danger", icon: AlertTriangle },
  ];
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted">
      {items.map((item) => (
        <li key={item.label} className="inline-flex items-center gap-1.5">
          <span className={cn("size-2.5 rounded-sm", item.className)} aria-hidden="true" />
          <item.icon className="size-3.5" aria-hidden="true" />
          {item.label}
        </li>
      ))}
    </ul>
  );
}
