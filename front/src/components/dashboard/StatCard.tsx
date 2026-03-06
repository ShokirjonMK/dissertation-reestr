import { ArrowUpRight, type LucideIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type StatCardProps = {
  title: string;
  value: string;
  icon: LucideIcon;
  trend: string;
  status: "Active" | "Stable" | "Review";
};

export default function StatCard({ title, value, icon: Icon, trend, status }: StatCardProps) {
  const badgeVariant = status === "Active" ? "success" : status === "Review" ? "warning" : "secondary";

  return (
    <Card className="animate-slide-up">
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <div>
          <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
          <p className="mt-1 text-3xl font-medium text-foreground">{value}</p>
        </div>
        <div className="rounded-lg bg-primary/15 p-2 text-primary">
          <Icon className="h-5 w-5" />
        </div>
      </CardHeader>
      <CardContent className="flex items-center justify-between">
        <div className="flex items-center gap-1 text-xs text-success">
          <ArrowUpRight className="h-3.5 w-3.5" />
          <span>{trend}</span>
        </div>
        <Badge variant={badgeVariant}>{status}</Badge>
      </CardContent>
    </Card>
  );
}
