import { cn } from "@/lib/utils";
import type { CveStatus } from "@/data/mock";

const styles: Record<CveStatus, string> = {
  New: "bg-primary/10 text-primary border-primary/40",
  Acknowledged: "bg-status-warning/10 text-status-warning border-status-warning/40",
  Patched: "bg-status-online/10 text-status-online border-status-online/40",
};

export function StatusBadge({ status, className }: { status: CveStatus; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-sm border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider",
        styles[status],
        className,
      )}
    >
      {status}
    </span>
  );
}
