import { createFileRoute } from "@tanstack/react-router";
import { Overview } from "@/components/yard/overview";

export const Route = createFileRoute("/")({
  component: Overview,
});
