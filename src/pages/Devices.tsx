import { useState, useEffect } from "react";
import { TopBar } from "@/components/TopBar";
import type { Device } from "@/types/odinseye";
import {
  useDevices,
  useAddDevice,
  useDevice,
  useDeleteDevice,
  useUpdateDevice,
  useScanDevice,
  useAgentInstructions,
} from "@/hooks/useOdinseyeData";
import { useMe } from "@/hooks/useAuth";
import {
  Plus,
  Eye,
  Pencil,
  Trash2,
  ScanLine,
  Search,
  Server,
  Cpu,
  Copy,
  ChevronDown,
  Terminal,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { apiGet, apiSend } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

function StatusDot({ status }: { status: string }) {
  const map: Record<string, string> = {
    healthy: "bg-status-online",
    vulnerable: "bg-status-warning",
    critical: "bg-severity-critical pulse-critical",
    offline: "bg-status-offline",
  };
  return <span className={cn("h-2 w-2 rounded-full inline-block", map[status])} />;
}

type SortKey = "hostname" | "vulnerabilities" | "lastHeartbeat";

function AgentInstallSection() {
  const { data: info } = useAgentInstructions();
  const master = info?.masterUrl ?? "http://127.0.0.1:5000";
  const path = info?.checkinPath ?? "/api/checkin";
  const block = `export MASTER_URL="${master}"
export API_KEY="<copy from server .env: API_KEY>"
cd /path/to/OdinEye/agent
python3 agent.py`;

  const systemd = `[Unit]
Description=Odin's Eye agent heartbeat
After=network-online.target

[Service]
Type=oneshot
Environment=MASTER_URL=${master}
Environment=API_KEY=<your-key>
ExecStart=/usr/bin/python3 /opt/odinseye/agent/agent.py
User=root

[Install]
WantedBy=multi-user.target`;

  const copy = (text: string) => {
    void navigator.clipboard.writeText(text);
    toast.success("Copied");
  };

  return (
    <Collapsible className="panel overflow-hidden group">
      <CollapsibleTrigger className="flex w-full items-center justify-between p-4 border-b border-border bg-muted/20 hover:bg-muted/30 transition [&[data-state=open]>svg:last-child]:rotate-180">
        <div className="flex items-center gap-3 text-left">
          <Terminal className="h-4 w-4 text-primary shrink-0" />
          <div>
            <div className="data-label">Deployment</div>
            <div className="font-display text-sm font-semibold">Install the agent (Linux / Python 3.8+)</div>
            <p className="text-xs text-muted-foreground mt-0.5 font-mono">
              Heartbeat: POST {master}
              {path} with header X-API-Key
              {info?.apiKeySet ? " (server has API_KEY set)" : " (set API_KEY on server .env)"}
            </p>
          </div>
        </div>
        <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200 shrink-0" />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="p-4 space-y-4 text-sm">
          <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
            <li>Copy the <code className="text-foreground">agent/</code> folder to the target host.</li>
            <li>
              Install deps: <code className="text-foreground">pip install requests</code>
            </li>
            <li>Set environment variables and run once (cron/systemd for repeat).</li>
          </ol>
          <div className="relative rounded-md border border-border bg-muted/40 p-3 font-mono text-xs whitespace-pre-wrap">
            {block}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="absolute top-2 right-2 h-7"
              onClick={() => copy(block)}
            >
              <Copy className="h-3 w-3" />
            </Button>
          </div>
          <div>
            <div className="data-label mb-1">systemd timer (optional)</div>
            <p className="text-xs text-muted-foreground mb-2">Save as <code>/etc/systemd/system/odinseye-agent.service</code> and run every 6h with a timer.</p>
            <div className="relative rounded-md border border-border bg-muted/40 p-3 font-mono text-[10px] whitespace-pre-wrap max-h-40 overflow-y-auto">
              {systemd}
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="absolute top-2 right-2 h-7"
                onClick={() => copy(systemd)}
              >
                <Copy className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

function DeviceTable({
  rows,
  manual = false,
  isAdmin,
  onView,
  onEdit,
  onDelete,
  onScan,
}: {
  rows: Device[];
  manual?: boolean;
  isAdmin: boolean;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onScan: (id: string) => void;
}) {
  const [sort, setSort] = useState<SortKey>("hostname");
  const [dir, setDir] = useState<"asc" | "desc">("asc");
  const sorted = [...rows].sort((a, b) => {
    const av = a[sort] as string | number;
    const bv = b[sort] as string | number;
    if (av < bv) return dir === "asc" ? -1 : 1;
    if (av > bv) return dir === "asc" ? 1 : -1;
    return 0;
  });
  const toggle = (k: SortKey) => {
    if (sort === k) setDir(dir === "asc" ? "desc" : "asc");
    else {
      setSort(k);
      setDir("asc");
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-border bg-muted/30">
            <th className="data-label text-left px-4 py-2.5 cursor-pointer" onClick={() => toggle("hostname")}>
              Hostname
            </th>
            <th className="data-label text-left px-4 py-2.5">OS</th>
            <th className="data-label text-left px-4 py-2.5">IP Address</th>
            <th className="data-label text-left px-4 py-2.5 cursor-pointer" onClick={() => toggle("lastHeartbeat")}>
              Heartbeat
            </th>
            <th className="data-label text-left px-4 py-2.5">Agent</th>
            <th className="data-label text-right px-4 py-2.5 cursor-pointer" onClick={() => toggle("vulnerabilities")}>
              CVEs
            </th>
            <th className="data-label text-left px-4 py-2.5">Status</th>
            <th className="data-label text-right px-4 py-2.5">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {sorted.map((d) => (
            <tr key={d.id} className="hover:bg-muted/20 transition-colors">
              <td className="px-4 py-2.5 font-mono font-medium">{d.hostname}</td>
              <td className="px-4 py-2.5 text-muted-foreground">{d.os}</td>
              <td className="px-4 py-2.5 font-mono">{d.ip}</td>
              <td className="px-4 py-2.5 font-mono text-muted-foreground">{d.lastHeartbeat}</td>
              <td className="px-4 py-2.5 font-mono">{d.agentVersion}</td>
              <td
                className={cn(
                  "px-4 py-2.5 text-right font-mono tabular-nums font-semibold",
                  d.vulnerabilities > 0 ? "text-severity-critical" : "text-status-online",
                )}
              >
                {d.vulnerabilities}
              </td>
              <td className="px-4 py-2.5">
                <span className="inline-flex items-center gap-1.5">
                  <StatusDot status={d.status} />
                  <span className="capitalize text-[11px]">{d.status}</span>
                </span>
              </td>
              <td className="px-4 py-2.5">
                <div className="flex items-center justify-end gap-1">
                  {manual && (
                    <button
                      type="button"
                      onClick={() => onScan(d.id)}
                      className="px-2 py-1 rounded text-[10px] font-mono uppercase border border-primary/40 text-primary hover:bg-primary/10 transition"
                    >
                      CVE Lookup
                    </button>
                  )}
                  <button
                    type="button"
                    title="View"
                    onClick={() => onView(d.id)}
                    className="h-7 w-7 grid place-items-center rounded hover:bg-muted text-muted-foreground hover:text-foreground"
                  >
                    <Eye className="h-3.5 w-3.5" />
                  </button>
                  {isAdmin && (
                    <button
                      type="button"
                      title="Edit"
                      onClick={() => onEdit(d.id)}
                      className="h-7 w-7 grid place-items-center rounded hover:bg-muted text-muted-foreground hover:text-foreground"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                  )}
                  <button
                    type="button"
                    title="Scan"
                    onClick={() => onScan(d.id)}
                    className="h-7 w-7 grid place-items-center rounded hover:bg-muted text-muted-foreground hover:text-primary"
                  >
                    <ScanLine className="h-3.5 w-3.5" />
                  </button>
                  {isAdmin && (
                    <button
                      type="button"
                      title="Delete"
                      onClick={() => onDelete(d.id)}
                      className="h-7 w-7 grid place-items-center rounded hover:bg-muted text-muted-foreground hover:text-severity-critical"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AddDeviceDrawer({
  open,
  onClose,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (body: Record<string, unknown>) => Promise<void>;
}) {
  const [hostname, setHostname] = useState("");
  const [makeModel, setMakeModel] = useState("");
  const [firmware, setFirmware] = useState("");
  const [ip, setIp] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("CCTV");
  if (!open) return null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parts = makeModel.trim().split(/\s+/);
    const make = parts[0] || "";
    const model = parts.slice(1).join(" ") || make;
    await onSubmit({
      hostname,
      make,
      model,
      firmware,
      ip,
      location,
      category,
      os: `Embedded`,
      type: "manual",
      manual: true,
    });
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 bg-background/70 backdrop-blur-sm z-40 animate-fade-in" onClick={onClose} />
      <div className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-card border-l border-border z-50 animate-slide-in-right shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div>
            <div className="data-label">New Asset</div>
            <h2 className="font-display text-lg font-bold">Add Device</h2>
          </div>
          <button type="button" onClick={onClose} className="h-8 w-8 grid place-items-center rounded hover:bg-muted" aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </div>
        <form onSubmit={submit} className="p-5 space-y-4 overflow-y-auto h-[calc(100vh-72px)]">
          <div>
            <label className="data-label block mb-1.5">Device Name</label>
            <input
              required
              value={hostname}
              onChange={(e) => setHostname(e.target.value)}
              placeholder="e.g. CCTV-Cam-03"
              className="w-full bg-background border border-border rounded px-3 py-2 text-sm font-mono focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/40"
            />
          </div>
          <div>
            <label className="data-label block mb-1.5">Make / Model</label>
            <input
              required
              value={makeModel}
              onChange={(e) => setMakeModel(e.target.value)}
              placeholder="e.g. Hikvision DS-2CD2143G2"
              className="w-full bg-background border border-border rounded px-3 py-2 text-sm font-mono focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/40"
            />
          </div>
          <div>
            <label className="data-label block mb-1.5">Firmware Version</label>
            <input
              required
              value={firmware}
              onChange={(e) => setFirmware(e.target.value)}
              placeholder="e.g. 5.7.3"
              className="w-full bg-background border border-border rounded px-3 py-2 text-sm font-mono focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/40"
            />
          </div>
          <div>
            <label className="data-label block mb-1.5">IP Address</label>
            <input
              required
              value={ip}
              onChange={(e) => setIp(e.target.value)}
              placeholder="10.0.5.13"
              className="w-full bg-background border border-border rounded px-3 py-2 text-sm font-mono focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/40"
            />
          </div>
          <div>
            <label className="data-label block mb-1.5">Location</label>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. North Substation"
              className="w-full bg-background border border-border rounded px-3 py-2 text-sm font-mono focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/40"
            />
          </div>
          <div>
            <label className="data-label block mb-1.5">Device Type</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-background border border-border rounded px-3 py-2 text-sm focus:outline-none focus:border-primary"
            >
              <option>CCTV</option>
              <option>OT Sensor</option>
              <option>Network Device</option>
              <option>Other</option>
            </select>
          </div>
          <div className="pt-3 flex gap-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 rounded border border-border text-sm hover:bg-muted">
              Cancel
            </button>
            <button type="submit" className="flex-1 px-4 py-2.5 rounded bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 glow-primary">
              Add Device
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

function DeviceViewSheet({ deviceId, open, onClose }: { deviceId: string | null; open: boolean; onClose: () => void }) {
  const { data: d, isLoading } = useDevice(deviceId);
  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="font-display">Device detail</SheetTitle>
        </SheetHeader>
        {isLoading && <p className="text-sm text-muted-foreground font-mono mt-4">Loading…</p>}
        {d && (
          <dl className="mt-4 space-y-3 text-sm">
            {(
              [
                ["Hostname", d.hostname],
                ["IP", d.ip],
                ["OS", d.os],
                ["OS version", d.osVersion || "—"],
                ["Type", d.type],
                ["Category", d.category || "—"],
                ["Make", d.make || "—"],
                ["Model", d.model || "—"],
                ["Firmware", d.firmware || "—"],
                ["Location", d.location || "—"],
                ["Agent version", d.agentVersion],
                ["Last seen (raw)", d.lastSeenRaw || "—"],
                ["CVE count", String(d.vulnerabilities)],
                ["Status", d.status],
              ] as const
            ).map(([k, v]) => (
              <div key={k} className="grid grid-cols-3 gap-2">
                <dt className="data-label">{k}</dt>
                <dd className="col-span-2 font-mono text-xs break-all">{v}</dd>
              </div>
            ))}
            {d.hardware && Object.keys(d.hardware).length > 0 && (
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border">
                <dt className="data-label">Hardware</dt>
                <dd className="col-span-2 font-mono text-xs break-all whitespace-pre-wrap">
                  {JSON.stringify(d.hardware, null, 2)}
                </dd>
              </div>
            )}
            {d.software && d.software.length > 0 && (
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border">
                <dt className="data-label">Software (scan)</dt>
                <dd className="col-span-2 font-mono text-xs space-y-1">
                  {d.software.map((p) => (
                    <div key={p.name}>
                      {p.name}
                      {p.version ? ` (${p.version})` : ""}
                    </div>
                  ))}
                </dd>
              </div>
            )}
          </dl>
        )}
      </SheetContent>
    </Sheet>
  );
}

function DeviceEditSheet({
  deviceId,
  open,
  onClose,
  onSave,
}: {
  deviceId: string | null;
  open: boolean;
  onClose: () => void;
  onSave: (id: string, body: Record<string, unknown>) => Promise<void>;
}) {
  const { data: d, isLoading } = useDevice(deviceId);
  const [hostname, setHostname] = useState("");
  const [ip, setIp] = useState("");
  const [os, setOs] = useState("");
  const [osVersion, setOsVersion] = useState("");
  const [firmware, setFirmware] = useState("");
  const [location, setLocation] = useState("");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [category, setCategory] = useState("");

  useEffect(() => {
    if (d && open) {
      setHostname(d.hostname);
      setIp(d.ip);
      setOs(d.os);
      setOsVersion(d.osVersion || "");
      setFirmware(d.firmware || "");
      setLocation(d.location || "");
      setMake(d.make || "");
      setModel(d.model || "");
      setCategory(d.category || "");
    }
  }, [d, open]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deviceId) return;
    await onSave(deviceId, {
      hostname,
      ip_address: ip,
      os,
      os_version: osVersion,
      firmware_version: firmware,
      location,
      make: make || undefined,
      model: model || undefined,
      device_type: category || undefined,
    });
    onClose();
  };

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="font-display">Edit device</SheetTitle>
        </SheetHeader>
        {isLoading && <p className="text-sm text-muted-foreground font-mono mt-4">Loading…</p>}
        {d && (
          <form onSubmit={submit} className="mt-4 space-y-3">
            <div>
              <label className="data-label block mb-1">Hostname</label>
              <input
                required
                value={hostname}
                onChange={(e) => setHostname(e.target.value)}
                className="w-full bg-background border border-border rounded px-3 py-2 text-sm font-mono"
              />
            </div>
            <div>
              <label className="data-label block mb-1">IP</label>
              <input value={ip} onChange={(e) => setIp(e.target.value)} className="w-full bg-background border border-border rounded px-3 py-2 text-sm font-mono" />
            </div>
            <div>
              <label className="data-label block mb-1">OS</label>
              <input value={os} onChange={(e) => setOs(e.target.value)} className="w-full bg-background border border-border rounded px-3 py-2 text-sm font-mono" />
            </div>
            <div>
              <label className="data-label block mb-1">OS version</label>
              <input value={osVersion} onChange={(e) => setOsVersion(e.target.value)} className="w-full bg-background border border-border rounded px-3 py-2 text-sm font-mono" />
            </div>
            <div>
              <label className="data-label block mb-1">Firmware</label>
              <input value={firmware} onChange={(e) => setFirmware(e.target.value)} className="w-full bg-background border border-border rounded px-3 py-2 text-sm font-mono" />
            </div>
            <div>
              <label className="data-label block mb-1">Location</label>
              <input value={location} onChange={(e) => setLocation(e.target.value)} className="w-full bg-background border border-border rounded px-3 py-2 text-sm font-mono" />
            </div>
            <div>
              <label className="data-label block mb-1">Make</label>
              <input value={make} onChange={(e) => setMake(e.target.value)} className="w-full bg-background border border-border rounded px-3 py-2 text-sm font-mono" />
            </div>
            <div>
              <label className="data-label block mb-1">Model</label>
              <input value={model} onChange={(e) => setModel(e.target.value)} className="w-full bg-background border border-border rounded px-3 py-2 text-sm font-mono" />
            </div>
            <div>
              <label className="data-label block mb-1">Device type</label>
              <input value={category} onChange={(e) => setCategory(e.target.value)} className="w-full bg-background border border-border rounded px-3 py-2 text-sm font-mono" />
            </div>
            <div className="flex gap-2 pt-2">
              <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" className="flex-1">
                Save
              </Button>
            </div>
          </form>
        )}
      </SheetContent>
    </Sheet>
  );
}

export default function Devices() {
  const { data: me } = useMe();
  const isAdmin = me?.user?.role === "Admin";
  const qc = useQueryClient();
  const { data: devices = [], isLoading } = useDevices();
  const addDevice = useAddDevice();
  const delDevice = useDeleteDevice();
  const updateDevice = useUpdateDevice();

  const [openAdd, setOpenAdd] = useState(false);
  const [q, setQ] = useState("");
  const [viewId, setViewId] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [scanReportOpen, setScanReportOpen] = useState(false);
  const [scanReport, setScanReport] = useState<{
    deviceId: string;
    new_vuln_rows: number;
    parsed_cves: number;
    apiRequests?: { query: string; returned: number; error?: string; top?: { cve_id: string; severity: string; cvss_score: number; nvd_url: string }[] }[];
    status?: "running" | "done" | "error";
    started_at?: string;
    updated_at?: string;
    error?: string;
  } | null>(null);
  const [scanId, setScanId] = useState<string | null>(null);
  const [scanElapsed, setScanElapsed] = useState(0);

  const filt = (rows: Device[]) =>
    rows.filter((d) => d.hostname.toLowerCase().includes(q.toLowerCase()) || d.ip.includes(q));
  const agents = filt(devices.filter((d) => d.type === "agent"));
  const manual = filt(devices.filter((d) => d.type === "manual"));

  const submitDevice = async (body: Record<string, unknown>) => {
    try {
      await addDevice.mutateAsync(body);
      toast.success("Device added");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  };

  const runScan = async (id: string) => {
    setScanElapsed(0);
    setScanReportOpen(true);
    setScanReport({
      deviceId: id,
      new_vuln_rows: 0,
      parsed_cves: 0,
      apiRequests: [],
      status: "running",
    });
    try {
      // Start async scan
      const r = await apiSend<{ scan_id: string }>(`/api/devices/${id}/scan/start`, { method: "POST" });
      setScanId(r.scan_id);
    } catch (e) {
      setScanReport((cur) => (cur ? { ...cur, status: "error", error: e instanceof Error ? e.message : "Scan failed" } : cur));
      toast.error(e instanceof Error ? e.message : "Scan failed");
    }
  };

  // Poll scan status while dialog open
  useEffect(() => {
    if (!scanReportOpen || !scanId) return;
    let alive = true;
    const started = Date.now();
    const tick = setInterval(() => setScanElapsed(Math.floor((Date.now() - started) / 1000)), 250);

    const poll = async () => {
      while (alive) {
        try {
          const st = await apiGet<{
            scan_id: string;
            device_id: number;
            status: "running" | "done" | "error";
            started_at?: string;
            updated_at?: string;
            apiRequests?: { query: string; returned: number; error?: string; top?: { cve_id: string; severity: string; cvss_score: number; nvd_url: string }[] }[];
            new_vuln_rows?: number;
            parsed_cves?: number;
            error?: string;
          }>(`/api/scans/${scanId}`);

          setScanReport((cur) =>
            cur
              ? {
                  ...cur,
                  status: st.status,
                  started_at: st.started_at,
                  updated_at: st.updated_at,
                  apiRequests: st.apiRequests || cur.apiRequests,
                  new_vuln_rows: st.new_vuln_rows ?? cur.new_vuln_rows,
                  parsed_cves: st.parsed_cves ?? cur.parsed_cves,
                  error: st.error,
                }
              : cur,
          );

          if (st.status === "done") {
            toast.success(`Scan done: ${st.new_vuln_rows || 0} new CVE row(s) (${st.parsed_cves || 0} CVEs)`); 
            qc.invalidateQueries({ queryKey: ["vulnerabilities"] });
            qc.invalidateQueries({ queryKey: ["devices"] });
            qc.invalidateQueries({ queryKey: ["dashboard"] });
            break;
          }
          if (st.status === "error") {
            toast.error(st.error || "Scan failed");
            break;
          }
        } catch {
          // ignore transient poll failures
        }
        await new Promise((r) => setTimeout(r, 1200));
      }
    };

    void poll();
    return () => {
      alive = false;
      clearInterval(tick);
    };
  }, [scanReportOpen, scanId, qc]);

  const saveEdit = async (id: string, body: Record<string, unknown>) => {
    try {
      await updateDevice.mutateAsync({ id, body });
      toast.success("Device updated");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Update failed");
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await delDevice.mutateAsync(deleteId);
      toast.success("Device removed");
      setDeleteId(null);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Delete failed");
    }
  };

  const loadDemo = async () => {
    try {
      await apiSend("/api/demo/seed", { method: "POST" });
      toast.success("Demo devices loaded");
      await qc.invalidateQueries({ queryKey: ["devices"] });
      await qc.invalidateQueries({ queryKey: ["vulnerabilities"] });
      await qc.invalidateQueries({ queryKey: ["dashboard"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load demo");
    }
  };

  return (
    <>
      <TopBar title="Devices" breadcrumb="OdinsEye / Asset Inventory" />
      <Dialog
        open={scanReportOpen}
        onOpenChange={(o) => {
          setScanReportOpen(o);
          if (!o) {
            setScanId(null);
            setScanElapsed(0);
          }
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Scan report</DialogTitle>
          </DialogHeader>
          {scanReport ? (
            <div className="space-y-4">
              {scanReport.status === "running" && (
                <div className="rounded border border-border bg-muted/20 px-3 py-2 text-xs font-mono text-muted-foreground">
                  Scanning… {scanElapsed}s elapsed
                </div>
              )}
              {scanReport.status === "error" && (
                <div className="rounded border border-severity-critical/40 bg-severity-critical/10 px-3 py-2 text-xs font-mono text-severity-critical">
                  Scan failed{scanReport.error ? `: ${scanReport.error}` : ""}
                </div>
              )}
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div className="data-label">New CVE rows</div>
                <div className="col-span-2 font-mono text-xs">{scanReport.new_vuln_rows}</div>
                <div className="data-label">Distinct CVEs</div>
                <div className="col-span-2 font-mono text-xs">{scanReport.parsed_cves}</div>
              </div>
              <div className="rounded border border-border overflow-hidden">
                <div className="px-3 py-2 text-xs bg-muted/30 border-b border-border data-label">NVD API requests</div>
                <div className="max-h-[50vh] overflow-y-auto divide-y divide-border">
                  {(scanReport.apiRequests || []).map((req) => (
                    <div key={req.query} className="p-3 text-xs">
                      <div className="flex items-center justify-between gap-3">
                        <div className="font-mono break-all">{req.query}</div>
                        <div className="font-mono text-muted-foreground whitespace-nowrap">
                          {req.error ? "error" : `${req.returned} CVEs`}
                        </div>
                      </div>
                      {req.error && <div className="mt-1 text-severity-critical font-mono break-all">{req.error}</div>}
                      {req.top && req.top.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {req.top.map((t) => (
                            <a
                              key={t.cve_id}
                              href={t.nvd_url}
                              target="_blank"
                              rel="noreferrer"
                              className="block font-mono text-[11px] text-muted-foreground hover:text-foreground underline-offset-4 hover:underline"
                            >
                              {t.cve_id} — {t.severity} {t.cvss_score ? `(${t.cvss_score})` : ""}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                  {(scanReport.apiRequests || []).length === 0 && <div className="p-3 text-xs text-muted-foreground font-mono">No inventory queries were available for this device.</div>}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground font-mono">No scan report.</div>
          )}
        </DialogContent>
      </Dialog>
      <div className="p-6 space-y-6 animate-fade-in">
        {isLoading && <div className="text-sm text-muted-foreground font-mono">Loading devices…</div>}
        {!isLoading && devices.length === 0 && (
          <section className="panel p-6">
            <div className="data-label">Empty inventory</div>
            <h2 className="font-display text-lg font-semibold mt-1">No devices yet</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Add devices manually, install the agent, or load demo data to explore the dashboard.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button type="button" onClick={() => setOpenAdd(true)} className="gap-1">
                <Plus className="h-4 w-4" />
                Add device
              </Button>
              <Button type="button" variant="outline" onClick={() => void loadDemo()}>
                Load demo devices
              </Button>
            </div>
          </section>
        )}
        <AgentInstallSection />

        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-card border border-border w-full max-w-xs">
            <Search className="h-3.5 w-3.5 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Filter by hostname or IP…"
              className="bg-transparent border-0 outline-none text-xs flex-1"
            />
          </div>
        </div>

        <section className="panel overflow-hidden">
          <div className="flex items-center gap-3 p-4 border-b border-border bg-muted/20">
            <Server className="h-4 w-4 text-primary" />
            <div className="flex-1">
              <div className="data-label">Section A</div>
              <h2 className="font-display text-sm font-semibold">
                Agent-Managed Devices <span className="text-muted-foreground font-mono text-xs ml-1">({agents.length})</span>
              </h2>
            </div>
          </div>
          <DeviceTable
            rows={agents}
            isAdmin={isAdmin}
            onView={setViewId}
            onEdit={setEditId}
            onDelete={setDeleteId}
            onScan={runScan}
          />
        </section>

        <section className="panel overflow-hidden">
          <div className="flex items-center gap-3 p-4 border-b border-border bg-muted/20">
            <Cpu className="h-4 w-4 text-primary" />
            <div className="flex-1">
              <div className="data-label">Section B</div>
              <h2 className="font-display text-sm font-semibold">
                Manually Added Devices <span className="text-muted-foreground font-mono text-xs ml-1">({manual.length})</span>
              </h2>
            </div>
            <Button type="button" size="sm" className="gap-1" onClick={() => setOpenAdd(true)}>
              <Plus className="h-4 w-4" />
              Add device
            </Button>
          </div>
          <DeviceTable
            rows={manual}
            manual
            isAdmin={isAdmin}
            onView={setViewId}
            onEdit={setEditId}
            onDelete={setDeleteId}
            onScan={runScan}
          />
        </section>
      </div>

      <AddDeviceDrawer open={openAdd} onClose={() => setOpenAdd(false)} onSubmit={submitDevice} />

      <DeviceViewSheet deviceId={viewId} open={!!viewId} onClose={() => setViewId(null)} />

      <DeviceEditSheet deviceId={editId} open={!!editId} onClose={() => setEditId(null)} onSave={saveEdit} />

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete device?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes the asset and its vulnerability rows. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button
              variant="destructive"
              onClick={() => {
                void confirmDelete();
              }}
            >
              Delete
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
