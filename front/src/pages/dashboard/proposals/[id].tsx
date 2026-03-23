import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/router";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { ProposalStatusBadge } from "@/components/proposals/ProposalStatusBadge";
import { StatusHistoryTimeline } from "@/components/proposals/StatusHistoryTimeline";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuthGuard } from "@/hooks/use-auth-guard";
import DashboardLayout from "@/layouts/DashboardLayout";
import { useAuthStore } from "@/store/auth-store";
import { API_BASE_URL, buildAuthHeaders, fetchImplementationProposal } from "@/services/api";
import { PRIORITY_LABELS } from "@/types/implementation-proposal";

async function postProposalAction(path: string, body: Record<string, unknown> = {}) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...buildAuthHeaders(true) },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    try {
      const j = JSON.parse(text) as { detail?: string };
      throw new Error(j.detail || text);
    } catch {
      throw new Error(text || "So'rov muvaffaqiyatsiz");
    }
  }
  return (await res.json()) as import("@/types/implementation-proposal").ImplementationProposal;
}

export default function ProposalDetailPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { hasHydrated, isAuthenticated } = useAuthGuard();
  const user = useAuthStore((s) => s.user);
  const [rejectComment, setRejectComment] = useState("");
  const [revisionNotes, setRevisionNotes] = useState("");
  const [approveComment, setApproveComment] = useState("");

  const proposalId = useMemo(() => {
    const raw = router.query.id;
    if (!raw || Array.isArray(raw)) return null;
    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
  }, [router.query.id]);

  const detailQuery = useQuery({
    queryKey: ["implementation-proposal", proposalId],
    queryFn: () => fetchImplementationProposal(proposalId as number),
    enabled: hasHydrated && isAuthenticated && proposalId != null,
  });

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ["implementation-proposal", proposalId] });
    void queryClient.invalidateQueries({ queryKey: ["my-proposals"] });
  };

  const startReview = useMutation({
    mutationFn: () => postProposalAction(`/proposals/${proposalId}/start-review`),
    onSuccess: () => {
      toast.success("Ko'rib chiqish boshlandi");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const approve = useMutation({
    mutationFn: () =>
      postProposalAction(`/proposals/${proposalId}/approve`, { comment: approveComment || null }),
    onSuccess: () => {
      toast.success("Tasdiqlandi");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const reject = useMutation({
    mutationFn: () => postProposalAction(`/proposals/${proposalId}/reject`, { comment: rejectComment }),
    onSuccess: () => {
      toast.success("Rad etildi");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const revision = useMutation({
    mutationFn: () =>
      postProposalAction(`/proposals/${proposalId}/request-revision`, { revision_notes: revisionNotes }),
    onSuccess: () => {
      toast.success("Qayta ishlash so'raldi");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const submit = useMutation({
    mutationFn: () => postProposalAction(`/proposals/${proposalId}/submit`),
    onSuccess: () => {
      toast.success("Yuborildi");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (!hasHydrated) {
    return (
      <div className="grid min-h-screen place-items-center text-sm text-muted-foreground">Session tekshirilmoqda...</div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (!proposalId) {
    return (
      <DashboardLayout title="Taklif">
        <p className="text-sm text-destructive">Noto&apos;g&apos;ri ID</p>
      </DashboardLayout>
    );
  }

  const p = detailQuery.data;
  const role = user?.role.name;
  const isMod = role === "admin" || role === "moderator";
  const isOwner = p && user && p.proposed_by === user.id;

  return (
    <DashboardLayout title="Taklif tafsilotlari" subtitle={p ? p.title : ""}>
      {detailQuery.isLoading && <p className="text-sm text-muted-foreground">Yuklanmoqda...</p>}
      {detailQuery.isError && (
        <p className="text-sm text-destructive">
          {detailQuery.error instanceof Error ? detailQuery.error.message : "Xato"}
        </p>
      )}
      {p && (
        <div className="grid gap-4">
          <Card>
            <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-2">
              <CardTitle className="text-lg">{p.title}</CardTitle>
              <ProposalStatusBadge status={p.status} />
            </CardHeader>
            <CardContent className="grid gap-3 text-sm">
              <p className="text-muted-foreground">
                Dissertatsiya:{" "}
                <Link className="text-primary hover:underline" href={`/dashboard/dissertations/${p.dissertation_id}`}>
                  #{p.dissertation_id}
                </Link>
              </p>
              <p>
                <span className="text-muted-foreground">Muhimlik:</span> {PRIORITY_LABELS[p.priority]}
              </p>
              <div>
                <p className="text-muted-foreground">Muammo</p>
                <p className="whitespace-pre-wrap">{p.problem_description}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Taklif</p>
                <p className="whitespace-pre-wrap">{p.proposal_text}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Kutilayotgan natija</p>
                <p className="whitespace-pre-wrap">{p.expected_result}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Status tarixi</CardTitle>
            </CardHeader>
            <CardContent>
              <StatusHistoryTimeline history={p.status_history || []} />
            </CardContent>
          </Card>

          <div className="flex flex-wrap gap-2">
            {isOwner && (p.status === "draft" || p.status === "revision_required") && (
              <Button type="button" onClick={() => submit.mutate()} disabled={submit.isPending}>
                Yuborish
              </Button>
            )}
            {isMod && p.status === "submitted" && (
              <Button type="button" onClick={() => startReview.mutate()} disabled={startReview.isPending}>
                Ko&apos;rib chiqishni boshlash
              </Button>
            )}
          </div>

          {isMod && p.status === "under_review" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Moderatsiya</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid gap-2">
                  <label className="text-sm text-muted-foreground">Tasdiqlash izohi (ixtiyoriy)</label>
                  <Input value={approveComment} onChange={(e) => setApproveComment(e.target.value)} />
                  <Button type="button" variant="default" onClick={() => approve.mutate()} disabled={approve.isPending}>
                    Tasdiqlash
                  </Button>
                </div>
                <div className="grid gap-2">
                  <label className="text-sm text-muted-foreground">Rad etish izohi (min 10 belgi)</label>
                  <Textarea value={rejectComment} onChange={(e) => setRejectComment(e.target.value)} />
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => reject.mutate()}
                    disabled={reject.isPending || rejectComment.length < 10}
                  >
                    Rad etish
                  </Button>
                </div>
                <div className="grid gap-2">
                  <label className="text-sm text-muted-foreground">Qayta ishlash eslatmalari (min 10 belgi)</label>
                  <Textarea value={revisionNotes} onChange={(e) => setRevisionNotes(e.target.value)} />
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => revision.mutate()}
                    disabled={revision.isPending || revisionNotes.length < 10}
                  >
                    Qayta ishlash so&apos;rash
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}
