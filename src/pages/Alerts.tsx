import { useState, type ComponentType } from "react";
import { TopBar } from "@/components/TopBar";
import { SeverityBadge } from "@/components/SeverityBadge";
import { CveLink } from "@/components/CveLink";
import { useAlerts, useAlertRules, useCreateAlertRule, useDeleteAlertRule } from "@/hooks/useOdinseyeData";
import { useMe } from "@/hooks/useAuth";
import { Mail, MessageSquare, Webhook, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

const methodIcon: Record<string, ComponentType<{ className?: string }>> = {
  Email: Mail,
  SMS: MessageSquare,
  Webhook: Webhook,
  email: Mail,
};

export default function Alerts() {
  const { data: me } = useMe();
  const isAdmin = me?.user?.role === "Admin";
  const { data: alerts = [], isLoading } = useAlerts();
  const { data: rules = [], isLoading: rulesLoading } = useAlertRules();
  const createRule = useCreateAlertRule();
  const deleteRule = useDeleteAlertRule();

  const [minCvss, setMinCvss] = useState("7.0");
  const [recipient, setRecipient] = useState("");
  const [method, setMethod] = useState("email");
  const [deviceGroup, setDeviceGroup] = useState("");
  const [enabled, setEnabled] = useState(true);

  const addRule = async (e: React.FormEvent) => {
    e.preventDefault();
    const min = parseFloat(minCvss);
    if (Number.isNaN(min) || !recipient.trim()) {
      toast.error("Min CVSS and recipient required");
      return;
    }
    try {
      await createRule.mutateAsync({
        min_cvss: min,
        severity_filter: "All",
        device_group: deviceGroup.trim() || null,
        alert_method: method,
        recipient: recipient.trim(),
        enabled,
      });
      setRecipient("");
      toast.success("Rule created");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed (Admin only?)");
    }
  };

  const remove = async (id: number) => {
    try {
      await deleteRule.mutateAsync(id);
      toast.success("Rule removed");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    }
  };

  return (
    <>
      <TopBar title="Alerts & Notifications" breadcrumb="OdinsEye / Notification Engine" />
      <div className="p-6 grid grid-cols-1 xl:grid-cols-3 gap-6 animate-fade-in">
        {(isLoading || rulesLoading) && (
          <div className="text-sm text-muted-foreground font-mono xl:col-span-3">Loading…</div>
        )}
        <div className="xl:col-span-2 panel overflow-hidden">
          <div className="p-4 border-b border-border">
            <div className="data-label">Activity Stream</div>
            <h2 className="font-display text-sm font-semibold">Alert Timeline</h2>
          </div>
          <div className="divide-y divide-border max-h-[700px] overflow-y-auto">
            {alerts.map((a) => {
              const Icon = methodIcon[a.method] || Mail;
              return (
                <div key={a.id} className="p-4 flex items-start gap-3 hover:bg-muted/20 transition">
                  <div className="mt-0.5 h-8 w-8 rounded grid place-items-center bg-primary/10 border border-primary/30 shrink-0">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-[11px] text-muted-foreground">{a.ts}</span>
                      <SeverityBadge severity={a.severity} />
                      <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-muted border border-border text-muted-foreground">
                        {a.method}
                      </span>
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

        <div className="space-y-4">
          <div className="panel p-4">
            <div className="data-label mb-1">Channels</div>
            <h2 className="font-display text-sm font-semibold mb-2">Delivery</h2>
            <p className="text-xs text-muted-foreground mb-3">
              Rules below define email / webhook / SMS per recipient. Enable or disable each rule individually.
            </p>
          </div>

          <div className="panel p-4">
            <div className="data-label mb-1">Rule Engine</div>
            <h2 className="font-display text-sm font-semibold mb-3">Alert Rules</h2>
            <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
              {rules.map((r) => (
                <div key={r.id} className="flex items-start gap-2 p-2.5 rounded border border-border bg-background">
                  <div className="flex-1 min-w-0 text-xs space-y-1">
                    <div className="font-mono">
                      CVSS ≥ {r.min_cvss ?? "—"} · {r.alert_method} → {r.recipient}
                    </div>
                    {r.device_group ? (
                      <div className="text-muted-foreground">Group: {r.device_group}</div>
                    ) : null}
                    <div className={cn("text-[10px] uppercase", r.enabled ? "text-status-online" : "text-muted-foreground")}>
                      {r.enabled ? "enabled" : "disabled"}
                    </div>
                  </div>
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => void remove(r.id)}
                      className="text-muted-foreground hover:text-severity-critical transition shrink-0"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              ))}
              {rules.length === 0 && !rulesLoading && (
                <p className="text-xs text-muted-foreground">No rules yet — add one below.</p>
              )}
            </div>
            <form onSubmit={addRule} className="space-y-3 border-t border-border pt-3">
              {!isAdmin && <p className="text-xs text-muted-foreground mb-2">Only Admins can add or delete rules.</p>}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-[10px]">Min CVSS</Label>
                  <Input
                    value={minCvss}
                    onChange={(e) => setMinCvss(e.target.value)}
                    className="h-8 text-xs font-mono"
                    disabled={!isAdmin}
                  />
                </div>
                <div>
                  <Label className="text-[10px]">Method</Label>
                  <Select value={method} onValueChange={setMethod} disabled={!isAdmin}>
                    <SelectTrigger className="h-8 text-xs" disabled={!isAdmin}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">email</SelectItem>
                      <SelectItem value="webhook">webhook</SelectItem>
                      <SelectItem value="sms">sms</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label className="text-[10px]">Recipient</Label>
                <Input
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder="soc@example.com or https://hooks…"
                  className="h-8 text-xs font-mono"
                  required
                  disabled={!isAdmin}
                />
              </div>
              <div>
                <Label className="text-[10px]">Device group (optional)</Label>
                <Input
                  value={deviceGroup}
                  onChange={(e) => setDeviceGroup(e.target.value)}
                  placeholder="CCTV, firewall, …"
                  className="h-8 text-xs font-mono"
                  disabled={!isAdmin}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-xs">Enabled</Label>
                <Switch checked={enabled} onCheckedChange={setEnabled} disabled={!isAdmin} />
              </div>
              <Button type="submit" size="sm" className="w-full gap-1" disabled={!isAdmin || createRule.isPending}>
                <Plus className="h-3.5 w-3.5" />
                Add rule
              </Button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
