import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import Link from "next/link";

import AdvancedFilters from "@/components/dashboard/AdvancedFilters";
import DissertationTable from "@/components/dashboard/DissertationTable";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthGuard } from "@/hooks/use-auth-guard";
import DashboardLayout from "@/layouts/DashboardLayout";
import { fetchCatalog, fetchDissertations } from "@/services/api";
import { useAuthStore } from "@/store/auth-store";
import { useFiltersStore } from "@/store/filters-store";
import type { SearchQueryParams } from "@/types";

export default function DissertationsPage() {
  const { hasHydrated, isAuthenticated } = useAuthGuard();
  const allowed = hasHydrated && isAuthenticated;
  const currentUser = useAuthStore((state) => state.user);
  const canCreate = currentUser?.role.name === "admin" || currentUser?.role.name === "doctorant";
  const filters = useFiltersStore((state) => state.filters);
  const [appliedFilters, setAppliedFilters] = useState<SearchQueryParams>({ ...filters });

  const directionsQuery = useQuery({
    queryKey: ["catalog", "directions"],
    queryFn: () => fetchCatalog("scientific-directions"),
    enabled: allowed,
  });

  const universitiesQuery = useQuery({
    queryKey: ["catalog", "universities"],
    queryFn: () => fetchCatalog("universities"),
    enabled: allowed,
  });

  const regionsQuery = useQuery({
    queryKey: ["catalog", "regions"],
    queryFn: () => fetchCatalog("regions"),
    enabled: allowed,
  });

  const dissertationsQuery = useQuery({
    queryKey: ["dissertations", appliedFilters],
    queryFn: () => fetchDissertations(appliedFilters),
    enabled: allowed,
  });

  if (!hasHydrated) {
    return <div className="grid min-h-screen place-items-center text-sm text-muted-foreground">Session tekshirilmoqda...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <DashboardLayout title="Dissertations Registry" subtitle="Sorting, filtering, pagination, status indicators">
      <AdvancedFilters
        directions={directionsQuery.data || []}
        universities={universitiesQuery.data || []}
        regions={regionsQuery.data || []}
        onApply={() => setAppliedFilters({ ...filters })}
      />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <CardTitle className="text-base">Search Results</CardTitle>
            {canCreate ? (
              <Button asChild>
                <Link href="/dashboard/dissertations/new">Dissertatsiya qo&apos;shish</Link>
              </Button>
            ) : null}
          </div>
        </CardHeader>
        <CardContent>
          <DissertationTable items={dissertationsQuery.data || []} />
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
