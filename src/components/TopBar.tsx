import { Bell, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { logoutRequest } from "@/lib/api";

export function TopBar({ title, breadcrumb }: { title: string; breadcrumb?: string }) {
  const now = new Date().toLocaleString("en-GB", { hour12: false });
  const nav = useNavigate();
  const qc = useQueryClient();

  const logout = async () => {
    await logoutRequest();
    await qc.invalidateQueries({ queryKey: ["me"] });
    nav("/login", { replace: true });
  };

  return (
    <header className="border-b border-border bg-background/60 backdrop-blur-xl sticky top-0 z-20">
      <div className="flex items-center gap-4 px-6 py-3">
        <div className="flex-1 min-w-0">
          {breadcrumb && <div className="data-label">{breadcrumb}</div>}
          <h1 className="font-display text-xl font-bold tracking-tight truncate">{title}</h1>
        </div>

        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-md bg-card/60 border border-border">
          <span className="h-2 w-2 rounded-full bg-status-online animate-blink" />
          <span className="font-mono text-[10px] text-muted-foreground">{now} UTC</span>
        </div>

        <button
          type="button"
          onClick={() => nav("/alerts")}
          className="relative h-9 w-9 grid place-items-center rounded-md bg-card/60 border border-border hover:border-primary/50 transition"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-severity-critical pulse-critical" />
        </button>

        <button
          type="button"
          onClick={() => void logout()}
          className="h-9 w-9 grid place-items-center rounded-md bg-primary/10 border border-primary/30 text-primary hover:bg-primary/20"
          title="Sign out"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
