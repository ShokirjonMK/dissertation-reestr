import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";

import { ProposalStatusBadge } from "@/components/proposals/ProposalStatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthGuard } from "@/hooks/use-auth-guard";
import DashboardLayout from "@/layouts/DashboardLayout";
import { useAuthStore } from "@/store/auth-store";
import { fetchAllProposals, fetchPendingProposals } from "@/services/api";
import type { ProposalStatus } from "@/types/implementation-proposal";
import { PRIORITY_LABELS } from "@/types/implementation-proposal";

export default function AdminProposalsPage() {
  const { hasHydrated, isAuthenticated } = useAuthGuard();
  const user = useAuthStore((s) => s.user);
  const [tab, setTab] = useState<"pending" | "all">("pending");
  const [status, setStatus] = useState<ProposalStatus | "">("");

  const allowed =
    user?.role.name === "admin" || user?.role.name === "moderator" || user?.role.name === "employee";

  const pendingQuery = useQuery({
    queryKey: ["admin-proposals-pending"],
    queryFn: () => fetchPendingProposals(1, 100),
    enabled: hasHydrated && isAuthenticated && allowed && tab === "pending",
  });

  const allQuery = useQuery({
    queryKey: ["admin-proposals-all", status],
    queryFn: () => fetchAllProposals({ status: status || undefined, page: 1, size: 100 }),
    enabled: hasHydrated && isAuthenticated && allowed && tab === "all",
  });

  if (!hasHydrated) {
    return (
      <div className="grid min-h-screen place-items-center text-sm text-muted-foreground">Session tekshirilmoqda...</div>
    );
  }

  if (!isAuthenticated || !allowed) {
    return (
      <DashboardLayout title="Takliflar (admin)">
        <p className="text-sm text-destructive">Ruxsat yo&apos;q</p>
      </DashboardLayout>
    );
  }

  const data = tab === "pending" ? pendingQuery.data : allQuery.data;
  const loading = tab === "pending" ? pendingQuery.isLoading : allQuery.isLoading;

  return (
    <DashboardLayout title="Takliflar" subtitle="Adliya xodimi / moderator / admin">
      <div className="mb-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setTab("pending")}
          className={`rounded-md px-3 py-1.5 text-sm ${tab === "pending" ? "bg-primary text-primary-foreground" : "bg-muted"}`}
        >
          Kutilayotganlar
        </button>
        <button
          type="button"
          onClick={() => setTab("all")}
          className={`rounded-md px-3 py-1.5 text-sm ${tab === "all" ? "bg-primary text-primary-foreground" : "bg-muted"}`}
        >
          Barchasi
        </button>
      </div>

      {tab === "all" && (
        <div className="mb-4 flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Status:</span>
          <select
            className="rounded-md border border-input bg-background px-2 py-1.5 text-sm"
            value={status}
            onChange={(e) => setStatus(e.target.value as ProposalStatus | "")}
          >
            <option value="">Barchasi</option>
            <option value="draft">Qoralama</option>
            <option value="submitted">Yuborildi</option>
            <option value="under_review">Ko&apos;rib chiqilmoqda</option>
            <option value="approved">Tasdiqlandi</option>
            <option value="rejected">Rad etildi</option>
            <option value="revision_required">Qayta ishlash</option>
          </select>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Jadval</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {loading && <p className="text-sm text-muted-foreground">Yuklanmoqda...</p>}
          {data?.items.map((p) => (
            <Link
              key={p.id}
              href={`/dashboard/proposals/${p.id}`}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border/60 p-3 text-sm hover:bg-muted/40"
            >
              <div className="min-w-0">
                <p className="font-medium">{p.title}</p>
                <p className="text-xs text-muted-foreground">
                  #{p.id} ·{" "}
                  {p.dissertation_id != null ? `diss. ${p.dissertation_id}` : "dissertatsiyasiz"} ·{" "}
                  {PRIORITY_LABELS[p.priority]}
                </p>
              </div>
              <ProposalStatusBadge status={p.status} />
            </Link>
          ))}
          {!loading && data && data.items.length === 0 && (
            <p className="text-sm text-muted-foreground">Ma&apos;lumot yo&apos;q</p>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
