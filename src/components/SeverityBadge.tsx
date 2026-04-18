import { cn } from "@/lib/utils";
import type { Severity } from "@/data/mock";

const styles: Record<Severity, string> = {
  Critical: "bg-severity-critical/15 text-severity-critical border-severity-critical/40 shadow-[0_0_12px_-2px_hsl(var(--severity-critical)/0.6)]",
  High: "bg-severity-high/15 text-severity-high border-severity-high/40",
  Medium: "bg-severity-medium/15 text-severity-medium border-severity-medium/40",
  Low: "bg-severity-low/15 text-severity-low border-severity-low/40",
};

export function SeverityBadge({ severity, className }: { severity: Severity; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider font-semibold",
        styles[severity],
        className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full bg-current", severity === "Critical" && "animate-pulse")} />
      {severity}
    </span>
  );
}
