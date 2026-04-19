import { Fragment, useState, useMemo } from "react";
import { TopBar } from "@/components/TopBar";
import { SeverityBadge } from "@/components/SeverityBadge";
import { StatusBadge } from "@/components/StatusBadge";
import { CveLink } from "@/components/CveLink";
import type { Severity, CveStatus } from "@/types/odinseye";
import { useVulnerabilities, useBulkAcknowledge, downloadFilteredCsv, useBulkAssign } from "@/hooks/useOdinseyeData";
import { Search, ChevronDown, ChevronRight, ExternalLink, Download, CheckCheck, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const severities: Severity[] = ["Critical", "High", "Medium", "Low"];
const statuses: CveStatus[] = ["New", "Acknowledged", "Patched"];

function selectedVulnIds(cves: { id: string; vulnIds?: number[] }[], selected: Set<string>) {
  const ids: number[] = [];
  for (const id of selected) {
    const row = cves.find((c) => c.id === id);
    if (row?.vulnIds?.length) ids.push(...row.vulnIds);
  }
  return ids;
}

export default function Vulnerabilities() {
  const { data: cves = [], isLoading } = useVulnerabilities();
  const bulk = useBulkAcknowledge();
  const bulkAssign = useBulkAssign();
  const [q, setQ] = useState("");
  const [sevFilter, setSev] = useState<Severity | "All">("All");
  const [statFilter, setStat] = useState<CveStatus | "All">("All");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [assignOpen, setAssignOpen] = useState(false);
  const [assignTo, setAssignTo] = useState("Blue Team");

  const filtered = useMemo(
    () =>
      cves.filter(
        (c) =>
          (sevFilter === "All" || c.severity === sevFilter) &&
          (statFilter === "All" || c.status === statFilter) &&
          (q === "" ||
            c.id.toLowerCase().includes(q.toLowerCase()) ||
            c.device.toLowerCase().includes(q.toLowerCase())),
      ),
    [cves, q, sevFilter, statFilter],
  );

  const toggle = (id: string) => {
    const n = new Set(selected);
    if (n.has(id)) n.delete(id);
    else n.add(id);
    setSelected(n);
  };

  const ackSelected = async () => {
    const ids = selectedVulnIds(cves, selected);
    if (!ids.length) {
      toast.error("Nothing to acknowledge");
      return;
    }
    try {
      await bulk.mutateAsync(ids);
      toast.success(`${ids.length} rows updated`);
      setSelected(new Set());
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  };

  const exportSelected = async () => {
    const ids = selectedVulnIds(cves, selected);
    if (!ids.length) {
      toast.error("Nothing to export");
      return;
    }
    try {
      await downloadFilteredCsv(ids);
      toast.success("CSV downloaded");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Export failed");
    }
  };

  const submitAssign = async () => {
    const ids = selectedVulnIds(cves, selected);
    if (!ids.length) {
      toast.error("Nothing to assign");
      return;
    }
    const name = assignTo.trim();
    if (!name) {
      toast.error("Enter assignee name");
      return;
    }
    try {
      await bulkAssign.mutateAsync({ ids, assigned_to: name });
      toast.success(`Assigned ${ids.length} row(s) to ${name}`);
      setAssignOpen(false);
      setSelected(new Set());
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Assign failed");
    }
  };

  return (
    <>
      <TopBar title="Vulnerabilities" breadcrumb="OdinsEye / CVE Registry" />
      <div className="p-6 space-y-4 animate-fade-in">
        {isLoading && <div className="text-sm text-muted-foreground font-mono">Loading…</div>}
        <div className="panel p-3 flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-background border border-border min-w-[240px] flex-1 max-w-md">
            <Search className="h-3.5 w-3.5 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search CVE-ID or device…"
              className="bg-transparent outline-none text-xs flex-1"
            />
          </div>
          <div className="flex items-center gap-1 bg-background border border-border rounded p-0.5">
            {(["All", ...severities] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSev(s)}
                className={cn(
                  "px-2.5 py-1 text-[10px] font-mono uppercase rounded transition",
                  sevFilter === s ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {s}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1 bg-background border border-border rounded p-0.5">
            {(["All", ...statuses] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStat(s)}
                className={cn(
                  "px-2.5 py-1 text-[10px] font-mono uppercase rounded transition",
                  statFilter === s ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {s}
              </button>
            ))}
          </div>
          <input type="date" className="bg-background border border-border rounded px-2 py-1 text-xs font-mono text-muted-foreground" />
        </div>

        {selected.size > 0 && (
          <div className="panel-glow p-3 flex items-center gap-3 animate-fade-in">
            <span className="font-mono text-xs">
              <span className="text-primary font-bold">{selected.size}</span> selected
            </span>
            <div className="flex-1" />
            <button
              type="button"
              onClick={ackSelected}
              className="px-3 py-1.5 rounded text-xs font-mono inline-flex items-center gap-1.5 border border-border hover:border-primary/40 hover:text-primary transition"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Acknowledge
            </button>
            <button
              type="button"
              onClick={() => void exportSelected()}
              className="px-3 py-1.5 rounded text-xs font-mono inline-flex items-center gap-1.5 border border-border hover:border-primary/40 hover:text-primary transition"
            >
              <Download className="h-3.5 w-3.5" />
              Export
            </button>
            <button
              type="button"
              onClick={() => setAssignOpen(true)}
              className="px-3 py-1.5 rounded text-xs font-mono inline-flex items-center gap-1.5 border border-border hover:border-primary/40 hover:text-primary transition"
            >
              <Users className="h-3.5 w-3.5" />
              Assign
            </button>
          </div>
        )}

        <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Assign to team / owner</DialogTitle>
            </DialogHeader>
            <div className="space-y-2 py-2">
              <Label htmlFor="assign">Assignee</Label>
              <Input id="assign" value={assignTo} onChange={(e) => setAssignTo(e.target.value)} placeholder="e.g. Blue Team" />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAssignOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => void submitAssign()}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <div className="panel overflow-hidden">
          {filtered.length === 0 ? (
            <div className="p-16 text-center">
              <div className="data-label mb-2">Empty registry</div>
              <h3 className="font-display text-lg font-semibold">No vulnerabilities found</h3>
              <p className="text-sm text-muted-foreground mt-1">Your devices are clean — keep them that way.</p>
            </div>
          ) : (
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-3 py-2.5 w-8" />
                  <th className="px-3 py-2.5 w-8" />
                  <th className="data-label text-left px-3 py-2.5">CVE ID</th>
                  <th className="data-label text-left px-3 py-2.5">Device</th>
                  <th className="data-label text-left px-3 py-2.5">Severity</th>
                  <th className="data-label text-right px-3 py-2.5">CVSS</th>
                  <th className="data-label text-left px-3 py-2.5">Vendor</th>
                  <th className="data-label text-left px-3 py-2.5">Discovered</th>
                  <th className="data-label text-left px-3 py-2.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((c) => (
                  <Fragment key={c.id}>
                    <tr
                      className={cn(
                        "hover:bg-muted/20 transition-colors cursor-pointer",
                        expanded === c.id && "bg-muted/30",
                      )}
                      onClick={() => setExpanded(expanded === c.id ? null : c.id)}
                    >
                      <td className="px-3 py-2.5" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selected.has(c.id)}
                          onChange={() => toggle(c.id)}
                          className="accent-primary"
                        />
                      </td>
                      <td className="px-3 py-2.5">
                        {expanded === c.id ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                      </td>
                      <td className="px-3 py-2.5">
                        <CveLink id={c.id} />
                      </td>
                      <td className="px-3 py-2.5 font-mono">{c.device}</td>
                      <td className="px-3 py-2.5">
                        <SeverityBadge severity={c.severity} />
                      </td>
                      <td className="px-3 py-2.5 text-right font-mono tabular-nums font-semibold">{c.cvss.toFixed(1)}</td>
                      <td className="px-3 py-2.5">{c.vendor}</td>
                      <td className="px-3 py-2.5 font-mono text-[11px] text-muted-foreground">{c.discoveredAt}</td>
                      <td className="px-3 py-2.5">
                        <StatusBadge status={c.status} />
                      </td>
                    </tr>
                    {expanded === c.id && (
                      <tr className="bg-background/60">
                        <td colSpan={9} className="p-5">
                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 animate-fade-in">
                            <div className="lg:col-span-2 space-y-3">
                              <div>
                                <div className="data-label mb-1">Description</div>
                                <p className="text-sm leading-relaxed">{c.description}</p>
                              </div>
                              <div>
                                <div className="data-label mb-1">Mitigation</div>
                                <p className="text-sm leading-relaxed text-muted-foreground">{c.mitigation}</p>
                              </div>
                              <div>
                                <div className="data-label mb-1">CVSS Vector</div>
                                <code className="font-mono text-xs bg-muted px-2 py-1 rounded inline-block">{c.vector}</code>
                              </div>
                            </div>
                            <div className="space-y-3">
                              {c.assignedTo ? (
                                <div>
                                  <div className="data-label mb-1">Assigned to</div>
                                  <p className="font-mono text-sm">{c.assignedTo}</p>
                                </div>
                              ) : null}
                              <div>
                                <div className="data-label mb-1.5">Affected Devices</div>
                                <ul className="space-y-1">
                                  {c.affectedDevices.map((d) => (
                                    <li key={d} className="font-mono text-xs px-2 py-1.5 rounded bg-muted border border-border">
                                      {d}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                              <a
                                href={`https://nvd.nist.gov/vuln/detail/${c.id}`}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 px-3 py-2 rounded border border-primary/40 text-primary text-xs hover:bg-primary/10 transition"
                              >
                                <ExternalLink className="h-3.5 w-3.5" />
                                NVD Reference
                              </a>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}
