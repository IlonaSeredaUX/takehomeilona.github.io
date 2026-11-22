import { createFileRoute } from "@tanstack/react-router";
import { QaQueue } from "@/components/yard/qa-queue";

export const Route = createFileRoute("/qa")({
  head: () => ({
    meta: [{ title: "QA queue · Frontline Dock Control" }],
  }),
  component: QaQueue,
});
