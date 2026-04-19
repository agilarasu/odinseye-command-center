import { useEffect, useState } from "react";
import { TopBar } from "@/components/TopBar";
import { useUsers, useSettings, usePatchSettings } from "@/hooks/useOdinseyeData";
import { useMe } from "@/hooks/useAuth";
import { Pencil, Trash2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Settings() {
  const { data: me } = useMe();
  const isAdmin = me?.user?.role === "Admin";
  const { data: users = [], isLoading } = useUsers();
  const { data: remote, isLoading: settingsLoading } = useSettings();
  const patch = usePatchSettings();

  const [orgName, setOrgName] = useState("");
  const [orgSector, setOrgSector] = useState("");
  const [orgEmail, setOrgEmail] = useState("");
  const [orgCountry, setOrgCountry] = useState("");
  const [masterHost, setMasterHost] = useState("");
  const [masterPort, setMasterPort] = useState("");
  const [masterApiPlaceholder] = useState("set in server .env (API_KEY)");
  const [smtpHost, setSmtpHost] = useState("");
  const [smtpPort, setSmtpPort] = useState("");
  const [smtpEnc, setSmtpEnc] = useState("");
  const [smtpFrom, setSmtpFrom] = useState("");
  const [smtpUser, setSmtpUser] = useState("");
  const [smtpPass, setSmtpPass] = useState("");

  useEffect(() => {
    if (!remote) return;
    setOrgName(remote.org_name ?? "");
    setOrgSector(remote.org_sector ?? "");
    setOrgEmail(remote.org_email ?? "");
    setOrgCountry(remote.org_country ?? "");
    setMasterHost(remote.master_host ?? "");
    setMasterPort(remote.master_port ?? "");
    setSmtpHost(remote.smtp_host ?? "");
    setSmtpPort(remote.smtp_port ?? "");
    setSmtpEnc(remote.smtp_encryption ?? "");
    setSmtpFrom(remote.smtp_from ?? "");
    setSmtpUser(remote.smtp_user ?? "");
    setSmtpPass(remote.smtp_password ?? "");
  }, [remote]);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      toast.error("Admin only");
      return;
    }
    try {
      await patch.mutateAsync({
        org_name: orgName,
        org_sector: orgSector,
        org_email: orgEmail,
        org_country: orgCountry,
      });
      toast.success("Organisation profile saved");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    }
  };

  const saveMaster = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      toast.error("Admin only");
      return;
    }
    try {
      await patch.mutateAsync({
        master_host: masterHost,
        master_port: masterPort,
      });
      toast.success("Master server settings saved");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    }
  };

  const saveSmtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      toast.error("Admin only");
      return;
    }
    try {
      await patch.mutateAsync({
        smtp_host: smtpHost,
        smtp_port: smtpPort,
        smtp_encryption: smtpEnc,
        smtp_from: smtpFrom,
        smtp_user: smtpUser,
        smtp_password: smtpPass,
      });
      toast.success("SMTP saved");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    }
  };

  return (
    <>
      <TopBar title="Settings" breadcrumb="OdinsEye / Configuration" />
      <div className="p-6 grid grid-cols-1 xl:grid-cols-2 gap-6 animate-fade-in">
        {(isLoading || settingsLoading) && (
          <div className="text-sm text-muted-foreground font-mono xl:col-span-2">Loading…</div>
        )}
        {!isAdmin && (
          <div className="xl:col-span-2 rounded border border-border bg-muted/30 px-4 py-2 text-sm text-muted-foreground">
            Signed in as Analyst — profile and SMTP saves require Admin.
          </div>
        )}

        <form onSubmit={saveProfile} className="panel p-5 space-y-4">
          <div>
            <div className="data-label">Identity</div>
            <h2 className="font-display text-base font-semibold">Organisation Profile</h2>
          </div>
          <div>
            <Label className="data-label">Organisation Name</Label>
            <Input value={orgName} onChange={(e) => setOrgName(e.target.value)} className="font-mono text-sm mt-1" disabled={!isAdmin} />
          </div>
          <div>
            <Label className="data-label">Sector</Label>
            <Input value={orgSector} onChange={(e) => setOrgSector(e.target.value)} className="font-mono text-sm mt-1" disabled={!isAdmin} />
          </div>
          <div>
            <Label className="data-label">Contact Email</Label>
            <Input type="email" value={orgEmail} onChange={(e) => setOrgEmail(e.target.value)} className="font-mono text-sm mt-1" disabled={!isAdmin} />
          </div>
          <div>
            <Label className="data-label">Country</Label>
            <Input value={orgCountry} onChange={(e) => setOrgCountry(e.target.value)} className="font-mono text-sm mt-1" disabled={!isAdmin} />
          </div>
          <Button type="submit" disabled={!isAdmin || patch.isPending}>
            Save Profile
          </Button>
        </form>

        <form onSubmit={saveMaster} className="panel p-5 space-y-4">
          <div>
            <div className="data-label">Connection</div>
            <h2 className="font-display text-base font-semibold">Master Server</h2>
          </div>
          <div>
            <Label className="data-label">Host</Label>
            <Input value={masterHost} onChange={(e) => setMasterHost(e.target.value)} className="font-mono text-sm mt-1" disabled={!isAdmin} />
          </div>
          <div>
            <Label className="data-label">Port</Label>
            <Input value={masterPort} onChange={(e) => setMasterPort(e.target.value)} className="font-mono text-sm mt-1" disabled={!isAdmin} />
          </div>
          <div>
            <Label className="data-label">Agent API key</Label>
            <Input readOnly value={masterApiPlaceholder} className="font-mono text-sm mt-1 opacity-70" />
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="h-2 w-2 rounded-full bg-status-online animate-blink" />
            <span className="font-mono text-muted-foreground">UI talks to API via Vite proxy in dev</span>
          </div>
          <Button type="submit" disabled={!isAdmin || patch.isPending}>
            Update Connection
          </Button>
        </form>

        <form onSubmit={saveSmtp} className="panel p-5 space-y-4">
          <div>
            <div className="data-label">Notifications</div>
            <h2 className="font-display text-base font-semibold">Email / SMTP</h2>
          </div>
          <div>
            <Label className="data-label">SMTP Host</Label>
            <Input value={smtpHost} onChange={(e) => setSmtpHost(e.target.value)} className="font-mono text-sm mt-1" disabled={!isAdmin} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="data-label">Port</Label>
              <Input value={smtpPort} onChange={(e) => setSmtpPort(e.target.value)} className="font-mono text-sm mt-1" disabled={!isAdmin} />
            </div>
            <div>
              <Label className="data-label">Encryption</Label>
              <Input value={smtpEnc} onChange={(e) => setSmtpEnc(e.target.value)} className="font-mono text-sm mt-1" disabled={!isAdmin} />
            </div>
          </div>
          <div>
            <Label className="data-label">From Address</Label>
            <Input value={smtpFrom} onChange={(e) => setSmtpFrom(e.target.value)} className="font-mono text-sm mt-1" disabled={!isAdmin} />
          </div>
          <div>
            <Label className="data-label">Username</Label>
            <Input value={smtpUser} onChange={(e) => setSmtpUser(e.target.value)} className="font-mono text-sm mt-1" disabled={!isAdmin} />
          </div>
          <div>
            <Label className="data-label">Password</Label>
            <Input type="password" value={smtpPass} onChange={(e) => setSmtpPass(e.target.value)} className="font-mono text-sm mt-1" disabled={!isAdmin} />
          </div>
          <Button type="submit" disabled={!isAdmin || patch.isPending}>
            Save SMTP
          </Button>
        </form>

        <div className="panel overflow-hidden">
          <div className="p-5 border-b border-border flex items-center justify-between">
            <div>
              <div className="data-label">Access Control</div>
              <h2 className="font-display text-base font-semibold">User Management</h2>
            </div>
            <button
              type="button"
              onClick={() => toast.success("Invite sent (demo)")}
              className="px-3 py-1.5 rounded bg-primary text-primary-foreground text-xs font-medium inline-flex items-center gap-1.5"
            >
              <UserPlus className="h-3.5 w-3.5" />
              Invite
            </button>
          </div>
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="data-label text-left px-4 py-2">Name</th>
                <th className="data-label text-left px-4 py-2">Role</th>
                <th className="data-label text-left px-4 py-2">Last Login</th>
                <th className="data-label text-right px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-muted/20">
                  <td className="px-4 py-2.5">
                    <div className="font-medium">{u.name || u.username}</div>
                    <div className="font-mono text-[10px] text-muted-foreground">{u.email || "—"}</div>
                  </td>
                  <td className="px-4 py-2.5">
                    <span className="font-mono text-[10px] uppercase px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/30">
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 font-mono text-muted-foreground">
                    {(u.last_login || "").replace("T", " ").slice(0, 19) || "—"}
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center justify-end gap-1">
                      <button type="button" className="h-7 w-7 grid place-items-center rounded hover:bg-muted text-muted-foreground hover:text-foreground">
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button type="button" className="h-7 w-7 grid place-items-center rounded hover:bg-muted text-muted-foreground hover:text-severity-critical">
                        <Trash2 className="h-3.5 w-3.5" />
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
