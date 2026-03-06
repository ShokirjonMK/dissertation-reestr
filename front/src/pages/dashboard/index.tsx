import { useQuery } from "@tanstack/react-query";
import { BadgeCheck, Clock3, FileText, UserRoundCheck } from "lucide-react";
import { useMemo } from "react";

import AIAssistantChat from "@/components/dashboard/AIAssistantChat";
import StatCard from "@/components/dashboard/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuthGuard } from "@/hooks/use-auth-guard";
import DashboardLayout from "@/layouts/DashboardLayout";
import { fetchDissertations } from "@/services/api";

export default function DashboardPage() {
  const { hasHydrated, isAuthenticated } = useAuthGuard();
  const allowed = hasHydrated && isAuthenticated;

  const dissertationsQuery = useQuery({
    queryKey: ["dissertations", "dashboard-overview"],
    queryFn: () => fetchDissertations({}),
    enabled: allowed,
  });

  const stats = useMemo(() => {
    const items = dissertationsQuery.data || [];
    const supervisors = new Set(items.map((item) => item.supervisor_id).filter(Boolean));
    return {
      total: items.length,
      pending: items.filter((item) => item.status === "pending").length,
      approved: items.filter((item) => item.status === "approved").length,
      mentors: supervisors.size,
    };
  }, [dissertationsQuery.data]);

  if (!hasHydrated) {
    return <div className="grid min-h-screen place-items-center text-sm text-muted-foreground">Session tekshirilmoqda...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <DashboardLayout title="Registry Dashboard" subtitle="Glass UI layout with right widget panel">
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Dissertations" value={String(stats.total)} icon={FileText} trend="+12%" status="Active" />
        <StatCard title="Pending Review" value={String(stats.pending)} icon={Clock3} trend="+3%" status="Review" />
        <StatCard title="Approved Proposals" value={String(stats.approved)} icon={BadgeCheck} trend="+9%" status="Active" />
        <StatCard title="Expert Mentors" value={String(stats.mentors)} icon={UserRoundCheck} trend="+2%" status="Stable" />
      </section>

      <Tabs defaultValue="assistant" className="w-full">
        <TabsList>
          <TabsTrigger value="assistant">AI Assistant</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="assistant" className="space-y-3">
          <AIAssistantChat />
        </TabsContent>

        <TabsContent value="insights">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Operational Insights</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Qidiruv va filtrlar orqali dissertatsiya oqimi monitoringi, tasdiqlash tezligi hamda amaliyotga tadbiq
              ehtimoli ko&apos;rsatkichlari shu panelda kengaytiriladi.
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
