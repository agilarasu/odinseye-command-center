import { NavLink, useLocation } from "react-router-dom";
import { LayoutDashboard, HardDrive, ShieldAlert, BellRing, FileText, Settings, Eye } from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/devices", label: "Devices", icon: HardDrive },
  { to: "/vulnerabilities", label: "Vulnerabilities", icon: ShieldAlert },
  { to: "/alerts", label: "Alerts", icon: BellRing },
  { to: "/reports", label: "Reports", icon: FileText },
  { to: "/settings", label: "Settings", icon: Settings },
];

export function AppSidebar() {
  const { pathname } = useLocation();
  return (
    <aside className="hidden md:flex flex-col w-60 lg:w-64 shrink-0 border-r border-sidebar-border bg-sidebar/95 backdrop-blur-xl relative z-10 sticky top-0 h-screen">
      <div className="px-5 py-5 border-b border-sidebar-border flex items-center gap-2.5">
        <div className="relative h-8 w-8 rounded-md bg-primary/10 border border-primary/40 flex items-center justify-center glow-primary">
          <Eye className="h-4 w-4 text-primary" />
        </div>
        <div>
          <div className="font-display text-base font-bold tracking-tight">OdinsEye</div>
        </div>
      </div>

      <nav className="flex-1 min-h-0 overflow-y-auto px-3 py-4 space-y-0.5">
        <div className="data-label px-3 pb-2">Operations</div>
        {nav.map((item) => {
          const active = pathname === item.to || (item.to !== "/" && pathname.startsWith(item.to));
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={cn(
                "group flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all relative",
                active
                  ? "bg-sidebar-accent text-primary font-medium"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-foreground",
              )}
            >
              {active && <span className="absolute left-0 top-1.5 bottom-1.5 w-0.5 bg-primary rounded-r shadow-[0_0_8px_hsl(var(--primary))]" />}
              <item.icon className={cn("h-4 w-4", active && "text-primary")} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="p-3 border-t border-sidebar-border">
        <div className="rounded-md bg-card/50 border border-border p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="data-label">System</span>
            <span className="flex items-center gap-1.5 text-[10px] font-mono text-status-online">
              <span className="h-1.5 w-1.5 rounded-full bg-status-online animate-blink" />
              ONLINE
            </span>
          </div>
          <div className="flex justify-between text-[11px] font-mono">
            <span className="text-muted-foreground">Master</span>
            <span>10.0.0.100:9443</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
