import type { ProposalStatus } from "@/types/implementation-proposal";
import { STATUS_COLORS, STATUS_LABELS } from "@/types/implementation-proposal";

export function ProposalStatusBadge({ status }: { status: ProposalStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
