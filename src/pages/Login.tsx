import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { loginRequest } from "@/lib/api";
import { useMe } from "@/hooks/useAuth";
import { toast } from "sonner";

export default function Login() {
  const { data: me, isLoading } = useMe();
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("admin");
  const [pending, setPending] = useState(false);
  const nav = useNavigate();
  const loc = useLocation();
  const qc = useQueryClient();
  const from = (loc.state as { from?: { pathname: string } })?.from?.pathname || "/";

  if (isLoading) {
    return <div className="min-h-screen grid place-items-center text-muted-foreground text-sm font-mono">Loading…</div>;
  }
  if (me?.user) {
    return <Navigate to="/" replace />;
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPending(true);
    try {
      await loginRequest(username, password);
      await qc.invalidateQueries({ queryKey: ["me"] });
      nav(from, { replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Login failed");
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="min-h-screen grid place-items-center p-6 bg-background">
      <form onSubmit={submit} className="w-full max-w-sm panel p-8 space-y-4">
        <div>
          <div className="data-label">Odin&apos;s Eye</div>
          <h1 className="font-display text-xl font-bold">Sign in</h1>
          <p className="text-xs text-muted-foreground mt-1">Master server session (default admin / admin)</p>
        </div>
        <div>
          <label className="data-label block mb-1">Username</label>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full bg-background border border-border rounded px-3 py-2 text-sm font-mono"
            autoComplete="username"
          />
        </div>
        <div>
          <label className="data-label block mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-background border border-border rounded px-3 py-2 text-sm font-mono"
            autoComplete="current-password"
          />
        </div>
        <button
          type="submit"
          disabled={pending}
          className="w-full py-2.5 rounded bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 disabled:opacity-50"
        >
          {pending ? "…" : "Continue"}
        </button>
      </form>
    </div>
  );
}
