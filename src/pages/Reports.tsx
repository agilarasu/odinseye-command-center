import { TopBar } from "@/components/TopBar";
import { useReportHistory, useWeeklyTrend } from "@/hooks/useOdinseyeData";
import { FileText, Download, ShieldCheck, ClipboardList } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";
import { toast } from "sonner";

const reportTypes = [
  { name: "Weekly Summary", desc: "Top vulnerabilities + trend deltas, last 7 days", icon: ClipboardList },
  { name: "Full Vulnerability Report", desc: "Complete CVE export across all assets", icon: FileText },
  { name: "Device Compliance Report", desc: "Patch status & compliance posture per device", icon: ShieldCheck },
];

async function downloadExport(format: "csv" | "pdf") {
  const r = await fetch(`/api/reports/export?format=${format}`, { credentials: "include" });
  if (!r.ok) {
    toast.error("Export failed");
    return;
  }
  const blob = await r.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = format === "pdf" ? "summary.pdf" : "export.csv";
  a.click();
  URL.revokeObjectURL(url);
  toast.success("Download started");
}

export default function Reports() {
  const { data: reportHistory = [], isLoading: hLoad } = useReportHistory();
  const { data: weeklyVulnData = [], isLoading: tLoad } = useWeeklyTrend();
  const chartData = weeklyVulnData.length ? weeklyVulnData : [{ week: "—", count: 0 }];

  return (
    <>
      <TopBar title="Reports" breadcrumb="OdinsEye / Reporting" />
      <div className="p-6 space-y-6 animate-fade-in">
        {(hLoad || tLoad) && <div className="text-sm text-muted-foreground font-mono">Loading…</div>}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {reportTypes.map((r) => (
            <button
              key={r.name}
              type="button"
              onClick={() => {
                toast.success(`Generating ${r.name}…`);
                void downloadExport("pdf");
              }}
              className="panel p-5 text-left hover:border-primary/40 transition group"
            >
              <div className="flex items-start justify-between">
                <r.icon className="h-5 w-5 text-primary" />
                <span className="data-label group-hover:text-primary transition">Generate →</span>
              </div>
              <h3 className="font-display font-semibold mt-3">{r.name}</h3>
              <p className="text-xs text-muted-foreground mt-1">{r.desc}</p>
            </button>
          ))}
        </div>

        <div className="panel p-5">
          <div className="data-label">Trend Analysis</div>
          <h2 className="font-display text-sm font-semibold mb-4">Vulnerabilities Discovered — Last 8 Weeks</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis
                  dataKey="week"
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11, fontFamily: "JetBrains Mono" }}
                  axisLine={{ stroke: "hsl(var(--border))" }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11, fontFamily: "JetBrains Mono" }}
                  axisLine={{ stroke: "hsl(var(--border))" }}
                  tickLine={false}
                />
                <Tooltip
                  cursor={{ fill: "hsl(var(--muted) / 0.4)" }}
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    fontSize: 12,
                    fontFamily: "JetBrains Mono",
                  }}
                />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="panel overflow-hidden">
          <div className="p-4 border-b border-border">
            <div className="data-label">Archive</div>
            <h2 className="font-display text-sm font-semibold">Report History</h2>
          </div>
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="data-label text-left px-4 py-2.5">Name</th>
                <th className="data-label text-left px-4 py-2.5">Type</th>
                <th className="data-label text-left px-4 py-2.5">Generated</th>
                <th className="data-label text-left px-4 py-2.5">Size</th>
                <th className="data-label text-right px-4 py-2.5">Download</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {reportHistory.map((r) => (
                <tr key={r.id} className="hover:bg-muted/20 transition">
                  <td className="px-4 py-2.5 font-medium">{r.name}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{r.type}</td>
                  <td className="px-4 py-2.5 font-mono">{r.generated}</td>
                  <td className="px-4 py-2.5 font-mono text-muted-foreground">{r.size}</td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => void downloadExport("pdf")}
                        className="px-2 py-1 rounded text-[10px] font-mono uppercase border border-border hover:border-primary/40 hover:text-primary inline-flex items-center gap-1"
                      >
                        <Download className="h-3 w-3" />
                        PDF
                      </button>
                      <button
                        type="button"
                        onClick={() => void downloadExport("csv")}
                        className="px-2 py-1 rounded text-[10px] font-mono uppercase border border-border hover:border-primary/40 hover:text-primary inline-flex items-center gap-1"
                      >
                        <Download className="h-3 w-3" />
                        CSV
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
