import { useQuery } from "@tanstack/react-query";
import {
  BadgeCheck,
  Clock3,
  FileText,
  TrendingUp,
  CheckCircle2,
  FilePlus,
  UserCheck,
} from "lucide-react";
import { useMemo } from "react";
import Link from "next/link";

import StatCard from "@/components/dashboard/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthGuard } from "@/hooks/use-auth-guard";
import DashboardLayout from "@/layouts/DashboardLayout";
import { fetchDissertations } from "@/services/api";
import { useI18n } from "@/lib/i18n";
import type { Dissertation } from "@/types";

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "hozir";
  if (m < 60) return `${m} daq oldin`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} soat oldin`;
  return `${Math.floor(h / 24)} kun oldin`;
}

const STATUS_COLOR: Record<string, string> = {
  pending: "text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20",
  approved: "text-green-600 bg-green-50 dark:bg-green-900/20",
  rejected: "text-red-600 bg-red-50 dark:bg-red-900/20",
  defended: "text-blue-600 bg-blue-50 dark:bg-blue-900/20",
  draft: "text-gray-500 bg-gray-50 dark:bg-gray-900/20",
};

const ACTIVITY_ICON: Record<string, React.FC<{ className?: string }>> = {
  pending: Clock3,
  approved: CheckCircle2,
  defended: BadgeCheck,
  default: FilePlus,
};

export default function DashboardPage() {
  const { hasHydrated, isAuthenticated } = useAuthGuard();
  const { t } = useI18n();
  const allowed = hasHydrated && isAuthenticated;

  const dissertationsQuery = useQuery({
    queryKey: ["dissertations", "dashboard-overview"],
    queryFn: () => fetchDissertations({}),
    enabled: allowed,
  });

  const stats = useMemo(() => {
    const items: Dissertation[] = dissertationsQuery.data || [];
    const total = items.length;
    const pending = items.filter((d) => d.status === "pending").length;
    const defended = items.filter((d) => d.status === "defended").length;
    const defenseRate = total > 0 ? Math.round((defended / total) * 100) : 0;
    return { total, pending, defended, defenseRate };
  }, [dissertationsQuery.data]);

  const recentActivity = useMemo(() => {
    const items: Dissertation[] = dissertationsQuery.data || [];
    return [...items]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 8);
  }, [dissertationsQuery.data]);

  if (!hasHydrated) {
    return (
      <div className="grid min-h-screen place-items-center text-sm text-muted-foreground">
        Session tekshirilmoqda...
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <DashboardLayout>
      {/* Stats */}
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Registry"
          value={String(stats.total)}
          icon={FileText}
          trend="+12%"
          status="Active"
        />
        <StatCard
          title="Under Review"
          value={String(stats.pending)}
          icon={Clock3}
          trend="+3%"
          status="Review"
        />
        <StatCard
          title="Defense Rate"
          value={`${stats.defenseRate}%`}
          icon={TrendingUp}
          trend={stats.defenseRate > 0 ? `+${stats.defenseRate}%` : "0%"}
          status="Active"
        />
        <StatCard
          title={t("dashboard.approvedProposals")}
          value={String(stats.defended)}
          icon={BadgeCheck}
          trend="+9%"
          status="Stable"
        />
      </section>

      {/* Activity Panel */}
      <Card className="mt-4 animate-slide-up">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <UserCheck className="h-4 w-4 text-primary" />
            {t("dashboard.recentActivity")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentActivity.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("common.noData")}</p>
          ) : (
            <ul className="space-y-0.5">
              {recentActivity.map((d) => {
                const Icon = ACTIVITY_ICON[d.status] ?? ACTIVITY_ICON.default;
                return (
                  <li key={d.id}>
                    <Link
                      href={`/dashboard/dissertations/${d.id}`}
                      className="flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-primary/5"
                    >
                      <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${STATUS_COLOR[d.status] ?? "bg-muted"}`}>
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{d.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {d.author_name ?? "—"}{d.scientific_direction_name ? ` · ${d.scientific_direction_name}` : ""}
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <span className={`inline-block rounded px-1.5 py-0.5 text-xs font-medium ${STATUS_COLOR[d.status] ?? ""}`}>
                          {d.status}
                        </span>
                        <p className="mt-0.5 text-xs text-muted-foreground">{timeAgo(d.created_at)}</p>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
          {recentActivity.length > 0 && (
            <div className="mt-3 border-t border-border/40 pt-2">
              <Link href="/dashboard/dissertations" className="text-xs text-primary hover:underline">
                Barcha dissertatsiyalarni ko&apos;rish →
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
