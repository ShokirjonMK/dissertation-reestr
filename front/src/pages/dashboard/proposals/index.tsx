import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";

import { ProposalStatusBadge } from "@/components/proposals/ProposalStatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthGuard } from "@/hooks/use-auth-guard";
import DashboardLayout from "@/layouts/DashboardLayout";
import { fetchMyProposals } from "@/services/api";
import type { ProposalStatus } from "@/types/implementation-proposal";
import { PRIORITY_LABELS } from "@/types/implementation-proposal";

const STATUS_OPTIONS: { value: ProposalStatus | ""; label: string }[] = [
  { value: "", label: "Barchasi" },
  { value: "draft", label: "Qoralama" },
  { value: "submitted", label: "Yuborildi" },
  { value: "under_review", label: "Ko'rib chiqilmoqda" },
  { value: "approved", label: "Tasdiqlandi" },
  { value: "rejected", label: "Rad etildi" },
  { value: "revision_required", label: "Qayta ishlash" },
];

export default function MyProposalsPage() {
  const { hasHydrated, isAuthenticated } = useAuthGuard();
  const [status, setStatus] = useState<ProposalStatus | "">("");

  const listQuery = useQuery({
    queryKey: ["my-proposals", status],
    queryFn: () => fetchMyProposals({ status: status || undefined, page: 1, size: 50 }),
    enabled: hasHydrated && isAuthenticated,
  });

  if (!hasHydrated) {
    return (
      <div className="grid min-h-screen place-items-center text-sm text-muted-foreground">Session tekshirilmoqda...</div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <DashboardLayout title="Mening takliflarim" subtitle="Amaliyotga joriy etish bo‘yicha">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">Status:</span>
          <select
            className="rounded-md border border-input bg-background px-2 py-1.5 text-sm"
            value={status}
            onChange={(e) => setStatus(e.target.value as ProposalStatus | "")}
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value || "all"} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <Button asChild>
          <Link href="/dashboard/proposals/new">Yangi taklif</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Ro‘yxat</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {listQuery.isLoading && <p className="text-sm text-muted-foreground">Yuklanmoqda...</p>}
          {listQuery.isError && (
            <p className="text-sm text-destructive">
              {listQuery.error instanceof Error ? listQuery.error.message : "Xato"}
            </p>
          )}
          {listQuery.data && listQuery.data.items.length === 0 && (
            <p className="text-sm text-muted-foreground">Hozircha taklif yo‘q</p>
          )}
          {listQuery.data?.items.map((p) => (
            <Link
              key={p.id}
              href={`/dashboard/proposals/${p.id}`}
              className="block rounded-lg border border-border/60 p-4 transition-colors hover:bg-muted/40"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-medium text-foreground">{p.title}</p>
                  <p className="text-xs text-muted-foreground">
                    Dissertatsiya #{p.dissertation_id} · {PRIORITY_LABELS[p.priority]}
                  </p>
                </div>
                <ProposalStatusBadge status={p.status} />
              </div>
            </Link>
          ))}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
