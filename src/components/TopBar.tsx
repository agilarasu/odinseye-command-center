import { Search, Bell, User } from "lucide-react";

export function TopBar({ title, breadcrumb }: { title: string; breadcrumb?: string }) {
  const now = new Date().toLocaleString("en-GB", { hour12: false });
  return (
    <header className="border-b border-border bg-background/60 backdrop-blur-xl sticky top-0 z-20">
      <div className="flex items-center gap-4 px-6 py-3">
        <div className="flex-1 min-w-0">
          {breadcrumb && <div className="data-label">{breadcrumb}</div>}
          <h1 className="font-display text-xl font-bold tracking-tight truncate">{title}</h1>
        </div>

        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-md bg-card/60 border border-border w-72">
          <Search className="h-3.5 w-3.5 text-muted-foreground" />
          <input
            placeholder="Search CVEs, devices, alerts…"
            className="bg-transparent border-0 outline-none text-xs flex-1 placeholder:text-muted-foreground/60"
          />
          <kbd className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground border border-border">⌘K</kbd>
        </div>

        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-md bg-card/60 border border-border">
          <span className="h-2 w-2 rounded-full bg-status-online animate-blink" />
          <span className="font-mono text-[10px] text-muted-foreground">{now} UTC</span>
        </div>

        <button className="relative h-9 w-9 grid place-items-center rounded-md bg-card/60 border border-border hover:border-primary/50 transition">
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-severity-critical pulse-critical" />
        </button>

        <button className="h-9 w-9 grid place-items-center rounded-md bg-primary/10 border border-primary/30 text-primary">
          <User className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
