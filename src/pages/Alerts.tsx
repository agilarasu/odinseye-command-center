import { useState } from "react";
import { TopBar } from "@/components/TopBar";
import { SeverityBadge } from "@/components/SeverityBadge";
import { CveLink } from "@/components/CveLink";
import { alerts } from "@/data/mock";
import { Mail, MessageSquare, Webhook, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const methodIcon: Record<string, any> = { Email: Mail, SMS: MessageSquare, Webhook: Webhook };

function Toggle({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button onClick={() => onChange(!on)} className="flex items-center justify-between w-full p-3 rounded border border-border hover:border-primary/40 transition">
      <span className="text-sm">{label}</span>
      <span className={cn("relative h-5 w-9 rounded-full transition-colors", on ? "bg-primary" : "bg-muted")}>
        <span className={cn("absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform", on ? "translate-x-4" : "translate-x-0.5")} />
      </span>
    </button>
  );
}

export default function Alerts() {
  const [email, setEmail] = useState(true);
  const [sms, setSms] = useState(true);
  const [webhook, setWebhook] = useState(false);
  const [rules, setRules] = useState([
    { id: "r1", text: "Send Email when CVSS ≥ 9.0 for any device" },
    { id: "r2", text: "Send SMS when severity = Critical and Group: CCTV" },
    { id: "r3", text: "POST Webhook when new CVE detected on Firewall-DC" },
  ]);
  const [newRule, setNewRule] = useState("");

  return (
    <>
      <TopBar title="Alerts & Notifications" breadcrumb="OdinsEye / Notification Engine" />
      <div className="p-6 grid grid-cols-1 xl:grid-cols-3 gap-6 animate-fade-in">
        {/* Timeline */}
        <div className="xl:col-span-2 panel overflow-hidden">
          <div className="p-4 border-b border-border">
            <div className="data-label">Activity Stream</div>
            <h2 className="font-display text-sm font-semibold">Alert Timeline</h2>
          </div>
          <div className="divide-y divide-border max-h-[700px] overflow-y-auto">
            {alerts.map(a => {
              const Icon = methodIcon[a.method];
              return (
                <div key={a.id} className="p-4 flex items-start gap-3 hover:bg-muted/20 transition">
                  <div className="mt-0.5 h-8 w-8 rounded grid place-items-center bg-primary/10 border border-primary/30 shrink-0">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-[11px] text-muted-foreground">{a.ts}</span>
                      <SeverityBadge severity={a.severity} />
                      <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-muted border border-border text-muted-foreground">{a.method}</span>
                    </div>
                    <div className="mt-1.5 text-sm">
                      Alert dispatched for <CveLink id={a.cve} /> on <span className="font-mono">{a.device}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Rules + Channels */}
        <div className="space-y-4">
          <div className="panel p-4">
            <div className="data-label mb-1">Configuration</div>
            <h2 className="font-display text-sm font-semibold mb-3">Alert Channels</h2>
            <div className="space-y-2">
              <Toggle on={email} onChange={setEmail} label="Email Notifications" />
              <Toggle on={sms} onChange={setSms} label="SMS Notifications" />
              <Toggle on={webhook} onChange={setWebhook} label="Webhook (Slack/Teams)" />
            </div>
          </div>

          <div className="panel p-4">
            <div className="data-label mb-1">Rule Engine</div>
            <h2 className="font-display text-sm font-semibold mb-3">Alert Rules</h2>
            <div className="space-y-2 mb-3">
              {rules.map(r => (
                <div key={r.id} className="flex items-center gap-2 p-2.5 rounded border border-border bg-background">
                  <code className="font-mono text-xs flex-1">{r.text}</code>
                  <button onClick={() => { setRules(rules.filter(x => x.id !== r.id)); toast.success("Rule removed"); }} className="text-muted-foreground hover:text-severity-critical transition">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
            <form onSubmit={e => {
              e.preventDefault();
              if (!newRule.trim()) return;
              setRules([...rules, { id: `r${Date.now()}`, text: newRule }]);
              setNewRule("");
              toast.success("Alert rule saved");
            }} className="flex gap-2">
              <input value={newRule} onChange={e => setNewRule(e.target.value)} placeholder="e.g. Email when CVSS ≥ 8.0 for OT Sensor" className="flex-1 bg-background border border-border rounded px-3 py-2 text-xs font-mono focus:outline-none focus:border-primary" />
              <button type="submit" className="h-9 w-9 grid place-items-center rounded bg-primary text-primary-foreground hover:bg-primary/90"><Plus className="h-4 w-4" /></button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
