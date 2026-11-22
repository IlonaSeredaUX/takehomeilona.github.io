import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { RotateCcw, Truck, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { countStatus } from "@/lib/yard/logic";
import { useYard } from "@/lib/yard/store";
import { Button } from "@/components/yard/button";
import { PalletDrawer } from "@/components/yard/pallet-drawer";

const noticeStyle = {
  ok: "border-ok bg-ok-soft text-ok-ink",
  info: "border-primary bg-primary-soft text-primary",
  danger: "border-danger bg-danger-soft text-danger-ink",
} as const;

export function AppShell({ children }: { children: ReactNode }) {
  const notice = useYard((state) => state.notice);
  const dismissNotice = useYard((state) => state.dismissNotice);
  const resetYard = useYard((state) => state.resetYard);
  const qaCount = useYard((state) => countStatus(state.pallets, "qa"));

  return (
    <div className="min-h-screen">
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-3 lg:px-6">
          <Link to="/" className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-md bg-primary text-on-solid">
              <Truck className="size-5" aria-hidden="true" />
            </span>
            <span>
              <span className="block text-sm font-semibold leading-tight">Frontline</span>
              <span className="block text-xs text-muted">Dock control · North warehouse</span>
            </span>
          </Link>
          <nav className="flex gap-1 sm:ml-4" aria-label="Primary">
            <Link
              to="/"
              activeOptions={{ exact: true }}
              className="inline-flex min-h-11 items-center rounded-md px-3 text-sm font-medium text-muted"
              activeProps={{ className: "bg-primary-soft text-primary" }}
            >
              Overview
            </Link>
            <Link
              to="/qa"
              className="inline-flex min-h-11 items-center gap-2 rounded-md px-3 text-sm font-medium text-muted"
              activeProps={{ className: "bg-primary-soft text-primary" }}
            >
              QA queue
              <span
                className={cn(
                  "inline-flex min-w-6 items-center justify-center rounded-md px-1.5 text-xs tabular-nums",
                  qaCount > 0 ? "bg-warn-soft text-warn-ink" : "bg-sunken text-muted",
                )}
              >
                {qaCount}
              </span>
            </Link>
          </nav>
          <Button variant="quiet" className="sm:ml-auto" onClick={() => resetYard()}>
            <RotateCcw className="size-4" aria-hidden="true" />
            Reset
          </Button>
        </div>
      </header>

      {notice ? (
        <div className={cn("border-b", noticeStyle[notice.tone])} role="status">
          <div className="mx-auto flex max-w-7xl items-start justify-between gap-3 px-4 py-3 lg:px-6">
            <p className="text-sm">{notice.text}</p>
            <div className="flex shrink-0 items-center gap-2">
              {notice.dockId ? (
                <Link
                  to="/docks/$dockId"
                  params={{ dockId: notice.dockId }}
                  className="inline-flex min-h-11 items-center text-sm font-medium underline-offset-2 hover:underline"
                >
                  View door
                </Link>
              ) : null}
              <button
                type="button"
                aria-label="Dismiss message"
                onClick={() => dismissNotice()}
                className="inline-flex size-11 items-center justify-center rounded-md hover:bg-ink/5"
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <main className="mx-auto w-full max-w-7xl px-4 py-4 lg:px-6">{children}</main>
      <PalletDrawer />
    </div>
  );
}
