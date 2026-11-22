import { createFileRoute } from "@tanstack/react-router";
import { DockDetail } from "@/components/yard/dock-detail";

export const Route = createFileRoute("/docks/$dockId")({
  head: () => ({
    meta: [{ title: "Door · Frontline Dock Control" }],
  }),
  component: DockRoute,
});

function DockRoute() {
  const { dockId } = Route.useParams();
  return <DockDetail dockId={dockId} />;
}
