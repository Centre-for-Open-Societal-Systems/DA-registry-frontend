import { PageHeader } from "@/components/ui/PageHeader";

// Shared by every Agents module screen (master registry, DA-ID, Fayda, Registry sync): the header always names
// the parent module; the active tab's name lives on its table section instead.
export function AgentsPageHeader() {
  return (
    <PageHeader
      title="Agents"
      description="Single source of truth for Development Agents. Records enter by bulk import or MoA sync and are published after Woreda approval."
    />
  );
}
