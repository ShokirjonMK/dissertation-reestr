import { AlertTriangle, CheckCircle2, Info } from "lucide-react";

import { cn } from "@/lib/utils";

type NotificationProps = {
  type?: "info" | "success" | "warning";
  title: string;
  description: string;
  className?: string;
};

export function Notification({ type = "info", title, description, className }: NotificationProps) {
  const Icon = type === "success" ? CheckCircle2 : type === "warning" ? AlertTriangle : Info;
  const theme =
    type === "success"
      ? "border-green-500/30 bg-green-500/10 text-green-700 dark:text-green-300"
      : type === "warning"
        ? "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300"
        : "border-primary/30 bg-primary/10 text-primary";

  return (
    <div className={cn("rounded-lg border px-3 py-2", theme, className)}>
      <div className="flex items-start gap-2">
        <Icon className="mt-0.5 h-4 w-4" />
        <div>
          <p className="text-sm font-semibold">{title}</p>
          <p className="text-xs opacity-90">{description}</p>
        </div>
      </div>
    </div>
  );
}
