import { useAuthGuard } from "@/hooks/use-auth-guard";
import DashboardLayout from "@/layouts/DashboardLayout";
import { SimpleProblemSearch } from "@/components/search/SimpleProblemSearch";

export default function ProblemsSearchPage() {
  const { hasHydrated, isAuthenticated } = useAuthGuard();

  if (!hasHydrated) {
    return (
      <div className="grid min-h-screen place-items-center text-sm text-muted-foreground">Session tekshirilmoqda...</div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <DashboardLayout title="Muammo va takliflar qidiruvi">
      <div className="container py-8">
        <SimpleProblemSearch />
      </div>
    </DashboardLayout>
  );
}
