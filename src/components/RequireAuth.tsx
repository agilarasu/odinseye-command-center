import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useMe } from "@/hooks/useAuth";

export function RequireAuth() {
  const { data, isLoading } = useMe();
  const loc = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen grid place-items-center text-muted-foreground text-sm font-mono">
        Loading…
      </div>
    );
  }
  if (!data?.user) {
    return <Navigate to="/login" state={{ from: loc }} replace />;
  }
  return <Outlet />;
}
