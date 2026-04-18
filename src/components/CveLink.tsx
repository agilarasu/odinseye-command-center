import { ExternalLink } from "lucide-react";

export function CveLink({ id, className = "" }: { id: string; className?: string }) {
  return (
    <a
      href={`https://nvd.nist.gov/vuln/detail/${id}`}
      target="_blank"
      rel="noreferrer"
      className={`group inline-flex items-center gap-1 font-mono text-xs text-primary hover:text-primary/80 transition-colors ${className}`}
    >
      {id}
      <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
    </a>
  );
}
