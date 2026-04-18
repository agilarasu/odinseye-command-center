import { TopBar } from "@/components/TopBar";
import { users } from "@/data/mock";
import { Pencil, Trash2, UserPlus } from "lucide-react";
import { toast } from "sonner";

function Field({ label, defaultValue, type = "text", placeholder }: { label: string; defaultValue?: string; type?: string; placeholder?: string }) {
  return (
    <div>
      <label className="data-label block mb-1.5">{label}</label>
      <input type={type} defaultValue={defaultValue} placeholder={placeholder} className="w-full bg-background border border-border rounded px-3 py-2 text-sm font-mono focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/40" />
    </div>
  );
}

export default function Settings() {
  const save = (e: React.FormEvent, section: string) => { e.preventDefault(); toast.success(`${section} saved`); };

  return (
    <>
      <TopBar title="Settings" breadcrumb="OdinsEye / Configuration" />
      <div className="p-6 grid grid-cols-1 xl:grid-cols-2 gap-6 animate-fade-in">
        <form onSubmit={(e) => save(e, "Organisation profile")} className="panel p-5 space-y-4">
          <div>
            <div className="data-label">Identity</div>
            <h2 className="font-display text-base font-semibold">Organisation Profile</h2>
          </div>
          <Field label="Organisation Name" defaultValue="Nordic Power & Grid Authority" />
          <Field label="Sector" defaultValue="Critical Infrastructure / Energy" />
          <Field label="Contact Email" type="email" defaultValue="soc@npga.gov" />
          <Field label="Country" defaultValue="Norway" />
          <button className="px-4 py-2 rounded bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 glow-primary">Save Profile</button>
        </form>

        <form onSubmit={(e) => save(e, "Master server config")} className="panel p-5 space-y-4">
          <div>
            <div className="data-label">Connection</div>
            <h2 className="font-display text-base font-semibold">Master Server</h2>
          </div>
          <Field label="Host" defaultValue="master.odinseye.local" />
          <Field label="Port" defaultValue="9443" />
          <Field label="API Key" type="password" defaultValue="oe_sk_live_••••••••••••••••" />
          <div className="flex items-center gap-2 text-xs">
            <span className="h-2 w-2 rounded-full bg-status-online animate-blink" />
            <span className="font-mono text-muted-foreground">Connection healthy — last ping 2s ago</span>
          </div>
          <button className="px-4 py-2 rounded bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 glow-primary">Update Connection</button>
        </form>

        <form onSubmit={(e) => save(e, "SMTP settings")} className="panel p-5 space-y-4">
          <div>
            <div className="data-label">Notifications</div>
            <h2 className="font-display text-base font-semibold">Email / SMTP</h2>
          </div>
          <Field label="SMTP Host" defaultValue="smtp.sendgrid.net" />
          <div className="grid grid-cols-2 gap-3">
            <Field label="Port" defaultValue="587" />
            <Field label="Encryption" defaultValue="STARTTLS" />
          </div>
          <Field label="From Address" defaultValue="alerts@odinseye.local" />
          <Field label="Username" defaultValue="apikey" />
          <Field label="Password" type="password" defaultValue="••••••••••••" />
          <button className="px-4 py-2 rounded bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 glow-primary">Save SMTP</button>
        </form>

        <div className="panel overflow-hidden">
          <div className="p-5 border-b border-border flex items-center justify-between">
            <div>
              <div className="data-label">Access Control</div>
              <h2 className="font-display text-base font-semibold">User Management</h2>
            </div>
            <button onClick={() => toast.success("Invite sent")} className="px-3 py-1.5 rounded bg-primary text-primary-foreground text-xs font-medium inline-flex items-center gap-1.5"><UserPlus className="h-3.5 w-3.5" />Invite</button>
          </div>
          <table className="w-full text-xs">
            <thead><tr className="border-b border-border bg-muted/30">
              <th className="data-label text-left px-4 py-2">Name</th>
              <th className="data-label text-left px-4 py-2">Role</th>
              <th className="data-label text-left px-4 py-2">Last Login</th>
              <th className="data-label text-right px-4 py-2">Actions</th>
            </tr></thead>
            <tbody className="divide-y divide-border">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-muted/20">
                  <td className="px-4 py-2.5">
                    <div className="font-medium">{u.name}</div>
                    <div className="font-mono text-[10px] text-muted-foreground">{u.email}</div>
                  </td>
                  <td className="px-4 py-2.5">
                    <span className="font-mono text-[10px] uppercase px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/30">{u.role}</span>
                  </td>
                  <td className="px-4 py-2.5 font-mono text-muted-foreground">{u.lastLogin}</td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center justify-end gap-1">
                      <button className="h-7 w-7 grid place-items-center rounded hover:bg-muted text-muted-foreground hover:text-foreground"><Pencil className="h-3.5 w-3.5" /></button>
                      <button className="h-7 w-7 grid place-items-center rounded hover:bg-muted text-muted-foreground hover:text-severity-critical"><Trash2 className="h-3.5 w-3.5" /></button>
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
