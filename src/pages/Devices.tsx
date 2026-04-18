import { useState } from "react";
import { TopBar } from "@/components/TopBar";
import { devices } from "@/data/mock";
import { Plus, Eye, Pencil, Trash2, ScanLine, Search, Server, Cpu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

function StatusDot({ status }: { status: string }) {
  const map: Record<string, string> = {
    healthy: "bg-status-online", vulnerable: "bg-status-warning",
    critical: "bg-severity-critical pulse-critical", offline: "bg-status-offline",
  };
  return <span className={cn("h-2 w-2 rounded-full inline-block", map[status])} />;
}

type SortKey = "hostname" | "vulnerabilities" | "lastHeartbeat";

function DeviceTable({ rows, manual = false }: { rows: typeof devices; manual?: boolean }) {
  const [sort, setSort] = useState<SortKey>("hostname");
  const [dir, setDir] = useState<"asc" | "desc">("asc");
  const sorted = [...rows].sort((a, b) => {
    const av = a[sort] as any; const bv = b[sort] as any;
    if (av < bv) return dir === "asc" ? -1 : 1;
    if (av > bv) return dir === "asc" ? 1 : -1;
    return 0;
  });
  const toggle = (k: SortKey) => { if (sort === k) setDir(dir === "asc" ? "desc" : "asc"); else { setSort(k); setDir("asc"); } };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-border bg-muted/30">
            <th className="data-label text-left px-4 py-2.5 cursor-pointer" onClick={() => toggle("hostname")}>Hostname</th>
            <th className="data-label text-left px-4 py-2.5">OS</th>
            <th className="data-label text-left px-4 py-2.5">IP Address</th>
            <th className="data-label text-left px-4 py-2.5 cursor-pointer" onClick={() => toggle("lastHeartbeat")}>Heartbeat</th>
            <th className="data-label text-left px-4 py-2.5">Agent</th>
            <th className="data-label text-right px-4 py-2.5 cursor-pointer" onClick={() => toggle("vulnerabilities")}>CVEs</th>
            <th className="data-label text-left px-4 py-2.5">Status</th>
            <th className="data-label text-right px-4 py-2.5">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {sorted.map(d => (
            <tr key={d.id} className="hover:bg-muted/20 transition-colors">
              <td className="px-4 py-2.5 font-mono font-medium">{d.hostname}</td>
              <td className="px-4 py-2.5 text-muted-foreground">{d.os}</td>
              <td className="px-4 py-2.5 font-mono">{d.ip}</td>
              <td className="px-4 py-2.5 font-mono text-muted-foreground">{d.lastHeartbeat}</td>
              <td className="px-4 py-2.5 font-mono">{d.agentVersion}</td>
              <td className={cn("px-4 py-2.5 text-right font-mono tabular-nums font-semibold", d.vulnerabilities > 0 ? "text-severity-critical" : "text-status-online")}>{d.vulnerabilities}</td>
              <td className="px-4 py-2.5"><span className="inline-flex items-center gap-1.5"><StatusDot status={d.status} /><span className="capitalize text-[11px]">{d.status}</span></span></td>
              <td className="px-4 py-2.5">
                <div className="flex items-center justify-end gap-1">
                  {manual && (
                    <button onClick={() => toast.success(`CVE lookup queued for ${d.hostname}`)} className="px-2 py-1 rounded text-[10px] font-mono uppercase border border-primary/40 text-primary hover:bg-primary/10 transition">CVE Lookup</button>
                  )}
                  <button title="View" className="h-7 w-7 grid place-items-center rounded hover:bg-muted text-muted-foreground hover:text-foreground"><Eye className="h-3.5 w-3.5" /></button>
                  <button title="Edit" className="h-7 w-7 grid place-items-center rounded hover:bg-muted text-muted-foreground hover:text-foreground"><Pencil className="h-3.5 w-3.5" /></button>
                  <button title="Scan" onClick={() => toast.info(`Running CVE scan on ${d.hostname}…`)} className="h-7 w-7 grid place-items-center rounded hover:bg-muted text-muted-foreground hover:text-primary"><ScanLine className="h-3.5 w-3.5" /></button>
                  <button title="Delete" className="h-7 w-7 grid place-items-center rounded hover:bg-muted text-muted-foreground hover:text-severity-critical"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AddDeviceDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <>
      <div className="fixed inset-0 bg-background/70 backdrop-blur-sm z-40 animate-fade-in" onClick={onClose} />
      <div className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-card border-l border-border z-50 animate-slide-in-right shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div>
            <div className="data-label">New Asset</div>
            <h2 className="font-display text-lg font-bold">Add Device</h2>
          </div>
          <button onClick={onClose} className="h-8 w-8 grid place-items-center rounded hover:bg-muted"><X className="h-4 w-4" /></button>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); toast.success("Device added successfully"); onClose(); }} className="p-5 space-y-4 overflow-y-auto h-[calc(100vh-72px)]">
          {[
            { l: "Device Name", p: "e.g. CCTV-Cam-03" },
            { l: "Make / Model", p: "e.g. Hikvision DS-2CD2143G2" },
            { l: "Firmware Version", p: "e.g. 5.7.3" },
            { l: "IP Address", p: "10.0.5.13" },
            { l: "Location", p: "e.g. North Substation" },
          ].map(f => (
            <div key={f.l}>
              <label className="data-label block mb-1.5">{f.l}</label>
              <input required placeholder={f.p} className="w-full bg-background border border-border rounded px-3 py-2 text-sm font-mono focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/40" />
            </div>
          ))}
          <div>
            <label className="data-label block mb-1.5">Device Type</label>
            <select className="w-full bg-background border border-border rounded px-3 py-2 text-sm focus:outline-none focus:border-primary">
              <option>CCTV</option><option>OT Sensor</option><option>Network Device</option><option>Other</option>
            </select>
          </div>
          <div className="pt-3 flex gap-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 rounded border border-border text-sm hover:bg-muted">Cancel</button>
            <button type="submit" className="flex-1 px-4 py-2.5 rounded bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 glow-primary">Add Device</button>
          </div>
        </form>
      </div>
    </>
  );
}

export default function Devices() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const filt = (rows: typeof devices) => rows.filter(d => d.hostname.toLowerCase().includes(q.toLowerCase()) || d.ip.includes(q));
  const agents = filt(devices.filter(d => d.type === "agent"));
  const manual = filt(devices.filter(d => d.type === "manual"));

  return (
    <>
      <TopBar title="Devices" breadcrumb="OdinsEye / Asset Inventory" />
      <div className="p-6 space-y-6 animate-fade-in">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-card border border-border w-full max-w-xs">
            <Search className="h-3.5 w-3.5 text-muted-foreground" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filter by hostname or IP…" className="bg-transparent border-0 outline-none text-xs flex-1" />
          </div>
        </div>

        <section className="panel overflow-hidden">
          <div className="flex items-center gap-3 p-4 border-b border-border bg-muted/20">
            <Server className="h-4 w-4 text-primary" />
            <div className="flex-1">
              <div className="data-label">Section A</div>
              <h2 className="font-display text-sm font-semibold">Agent-Managed Devices <span className="text-muted-foreground font-mono text-xs ml-1">({agents.length})</span></h2>
            </div>
          </div>
          <DeviceTable rows={agents} />
        </section>

        <section className="panel overflow-hidden">
          <div className="flex items-center gap-3 p-4 border-b border-border bg-muted/20">
            <Cpu className="h-4 w-4 text-primary" />
            <div className="flex-1">
              <div className="data-label">Section B</div>
              <h2 className="font-display text-sm font-semibold">Manually Added Devices <span className="text-muted-foreground font-mono text-xs ml-1">({manual.length})</span></h2>
            </div>
          </div>
          <DeviceTable rows={manual} manual />
        </section>
      </div>

      <button onClick={() => setOpen(true)} className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-primary text-primary-foreground grid place-items-center shadow-lg glow-primary hover:scale-105 transition-transform z-30">
        <Plus className="h-6 w-6" />
      </button>

      <AddDeviceDrawer open={open} onClose={() => setOpen(false)} />
    </>
  );
}
