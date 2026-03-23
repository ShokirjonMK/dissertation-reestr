import type { StatusHistory } from "@/types/implementation-proposal";
import { STATUS_LABELS } from "@/types/implementation-proposal";

function formatDt(iso: string) {
  try {
    return new Date(iso).toLocaleString("uz-UZ", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export function StatusHistoryTimeline({ history }: { history: StatusHistory[] }) {
  if (!history.length) {
    return <p className="text-sm text-muted-foreground">Tarix bo&apos;sh</p>;
  }
  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {history.map((item, idx) => (
          <li key={item.id}>
            <div className="relative pb-8">
              {idx !== history.length - 1 && (
                <span className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200 dark:bg-slate-700" />
              )}
              <div className="relative flex space-x-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                  {idx + 1}
                </div>
                <div className="min-w-0 flex-1 pt-1.5">
                  <div className="text-sm text-foreground">
                    <span className="font-medium">{STATUS_LABELS[item.to_status]}</span>
                    {item.from_status && (
                      <span className="text-muted-foreground"> ← {STATUS_LABELS[item.from_status]}</span>
                    )}
                  </div>
                  {item.comment && <p className="mt-1 text-sm text-muted-foreground">{item.comment}</p>}
                  <p className="mt-0.5 text-xs text-muted-foreground">{formatDt(item.changed_at)}</p>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
