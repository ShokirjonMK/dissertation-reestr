export type ProposalStatus =
  | "draft"
  | "submitted"
  | "under_review"
  | "approved"
  | "rejected"
  | "revision_required";

export type ProposalPriority = "low" | "medium" | "high" | "critical";

export interface StatusHistory {
  id: number;
  from_status: ProposalStatus | null;
  to_status: ProposalStatus;
  comment: string | null;
  changed_at: string;
  changed_by: number;
}

export interface ImplementationProposal {
  id: number;
  dissertation_id: number | null;
  proposed_by: number;
  reviewed_by: number | null;
  title: string;
  problem_description: string;
  proposal_text: string;
  expected_result: string;
  implementation_area: string;
  implementation_org: string;
  priority: ProposalPriority;
  source_chapter: string | null;
  source_pages: string | null;
  status: ProposalStatus;
  submitted_at: string | null;
  reviewed_at: string | null;
  deadline: string | null;
  reviewer_comment: string | null;
  revision_notes: string | null;
  attachment_url: string | null;
  created_at: string;
  updated_at: string;
  status_history: StatusHistory[];
}

export interface ImplementationProposalList {
  items: ImplementationProposal[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export const STATUS_LABELS: Record<ProposalStatus, string> = {
  draft: "Qoralama",
  submitted: "Yuborildi",
  under_review: "Ko'rib chiqilmoqda",
  approved: "Tasdiqlandi",
  rejected: "Rad etildi",
  revision_required: "Qayta ishlash kerak",
};

export const STATUS_COLORS: Record<ProposalStatus, string> = {
  draft: "bg-gray-100 text-gray-700",
  submitted: "bg-blue-100 text-blue-700",
  under_review: "bg-yellow-100 text-yellow-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
  revision_required: "bg-orange-100 text-orange-700",
};

export const PRIORITY_LABELS: Record<ProposalPriority, string> = {
  low: "Past",
  medium: "O'rta",
  high: "Yuqori",
  critical: "Kritik",
};

export interface ProblemItem {
  id?: number;
  order_num: number;
  problem_text: string;
  source_page?: string;
}

export interface ProposalItem {
  id?: number;
  order_num: number;
  proposal_text: string;
  source_page?: string;
}

export interface SearchResult {
  id: string;
  title: string;
  author: string;
  university: string;
  year: number | null;
  degree: string;
  matched_problems: { text: string; page?: string }[];
  matched_proposals: { text: string; page?: string }[];
}
