import { Link } from "react-router-dom";
import { TopBar } from "@/components/TopBar";
import { SeverityBadge } from "@/components/SeverityBadge";
import { StatusBadge } from "@/components/StatusBadge";
import { CveLink } from "@/components/CveLink";
import { severityHsl } from "@/data/mock";
import { useDashboardSummary, useDevices, useVulnerabilities } from "@/hooks/useOdinseyeData";
import { HardDrive, ShieldAlert, Flame, CheckCircle2, BellRing, ArrowUpRight, TrendingUp, Activity } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { cn } from "@/lib/utils";

export default function Dashboard() {
  const { data: summary, isLoading: sLoading, error: sErr } = useDashboardSummary();
  const { data: devices = [], isLoading: dLoading } = useDevices();
  const { data: cves = [], isLoading: cLoading } = useVulnerabilities();

  const loading = sLoading || dLoading || cLoading;
  const kpis = summary
    ? [
        { label: "Total Devices", value: summary.totalDevices, icon: HardDrive, sub: "inventory", tone: "text-foreground" },
        { label: "Critical CVEs", value: summary.criticalCves, icon: Flame, sub: "Action required", tone: "text-severity-critical", critical: true },
        { label: "High CVEs", value: summary.highCves, icon: ShieldAlert, sub: "Review queue", tone: "text-severity-high" },
        { label: "Patched Today", value: summary.patchedToday, icon: CheckCircle2, sub: "status updates", tone: "text-status-online" },
        { label: "Alerts Sent", value: summary.alerts24h, icon: BellRing, sub: "Last 24h window", tone: "text-primary" },
      ]
    : [];

  const donutData =
    summary?.severityDonut.map((d) => ({
      name: d.name,
      value: d.value,
      color: severityHsl(d.severity),
    })) ?? [];

  const totalCves = summary?.totalCves ?? 0;

  return (
    <>
      <TopBar title="Operations Dashboard" breadcrumb="OdinsEye / SOC" />
      <div className="p-6 space-y-6 animate-fade-in">
        {sErr && (
          <div className="rounded border border-destructive/50 bg-destructive/10 px-4 py-2 text-sm text-destructive">
            {(sErr as Error).message}
          </div>
        )}
        {loading && !summary && <div className="text-sm text-muted-foreground font-mono">Loading dashboard…</div>}

        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
          {kpis.map((k) => (
            <div
              key={k.label}
              className={cn(
                "panel p-4 group hover:border-primary/40 transition-all",
                k.critical && "border-severity-critical/40",
              )}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="data-label">{k.label}</div>
                <k.icon className={cn("h-4 w-4 opacity-60", k.tone)} />
              </div>
              <div className={cn("font-display text-3xl font-bold tabular-nums", k.tone)}>{k.value}</div>
              <div className="font-mono text-[10px] text-muted-foreground mt-1">{k.sub}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <div className="panel-glow p-5 scan-line">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="data-label">Severity Distribution</div>
                <div className="font-display text-sm font-semibold mt-0.5">Live CVE Mix</div>
              </div>
              <Activity className="h-4 w-4 text-primary animate-pulse" />
            </div>
            <div className="relative h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={donutData}
                    dataKey="value"
                    innerRadius={60}
                    outerRadius={88}
                    paddingAngle={3}
                    stroke="hsl(var(--background))"
                    strokeWidth={2}
                  >
                    {donutData.map((d, i) => (
                      <Cell key={i} fill={d.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      fontSize: 12,
                      fontFamily: "JetBrains Mono",
                    }}
                    cursor={false}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 grid place-items-center pointer-events-none">
                <div className="text-center">
                  <div className="font-display text-3xl font-bold tabular-nums">{totalCves}</div>
                  <div className="data-label">Total CVEs</div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-3">
              {donutData.map((d) => (
                <div key={d.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full" style={{ background: d.color }} />
                    <span className="text-muted-foreground">{d.name}</span>
                  </div>
                  <span className="font-mono tabular-nums">{d.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="panel xl:col-span-2 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div>
                <div className="data-label flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-status-online animate-blink" />
                  Live Feed
                </div>
                <div className="font-display text-sm font-semibold mt-0.5">Latest Vulnerabilities</div>
              </div>
              <Link to="/vulnerabilities" className="text-xs text-primary inline-flex items-center gap-1 hover:underline">
                View all <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="data-label text-left px-4 py-2">CVE ID</th>
                    <th className="data-label text-left px-4 py-2">Device</th>
                    <th className="data-label text-left px-4 py-2">Severity</th>
                    <th className="data-label text-right px-4 py-2">CVSS</th>
                    <th className="data-label text-left px-4 py-2">Discovered</th>
                    <th className="data-label text-left px-4 py-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {cves.slice(0, 7).map((c) => (
                    <tr key={c.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-2.5">
                        <CveLink id={c.id} />
                      </td>
                      <td className="px-4 py-2.5 font-mono text-xs">{c.device}</td>
                      <td className="px-4 py-2.5">
                        <SeverityBadge severity={c.severity} />
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono tabular-nums font-semibold">{c.cvss.toFixed(1)}</td>
                      <td className="px-4 py-2.5 font-mono text-[11px] text-muted-foreground">{c.discoveredAt}</td>
                      <td className="px-4 py-2.5">
                        <StatusBadge status={c.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="panel p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="data-label">Network Topology</div>
              <div className="font-display text-sm font-semibold mt-0.5">Device Health Map</div>
            </div>
            <div className="flex items-center gap-3 text-[10px] font-mono text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-status-online" /> Healthy
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-status-warning" /> Vulnerable
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-severity-critical" /> Critical
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-status-offline" /> Offline
              </span>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-7 gap-2.5">
            {devices.map((d) => {
              const dot =
                d.status === "healthy"
                  ? "bg-status-online"
                  : d.status === "vulnerable"
                    ? "bg-status-warning"
                    : d.status === "critical"
                      ? "bg-severity-critical pulse-critical"
                      : "bg-status-offline";
              const border =
                d.status === "critical"
                  ? "border-severity-critical/40 hover:border-severity-critical"
                  : d.status === "vulnerable"
                    ? "border-status-warning/30 hover:border-status-warning"
                    : d.status === "offline"
                      ? "border-border opacity-60"
                      : "border-border hover:border-primary/40";
              return (
                <div key={d.id} className={cn("rounded-md border p-3 bg-card/60 transition-all cursor-pointer", border)}>
                  <div className="flex items-center justify-between mb-2">
                    <span className={cn("h-2 w-2 rounded-full", dot)} />
                    <HardDrive className="h-3 w-3 text-muted-foreground" />
                  </div>
                  <div className="font-mono text-[11px] truncate font-medium">{d.hostname}</div>
                  <div className="font-mono text-[10px] text-muted-foreground truncate">{d.ip}</div>
                  {d.vulnerabilities > 0 && (
                    <div className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-mono text-severity-critical">
                      <TrendingUp className="h-2.5 w-2.5" />
                      {d.vulnerabilities} CVE
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
