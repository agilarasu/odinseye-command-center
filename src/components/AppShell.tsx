import { Outlet } from "react-router-dom";
import { AppSidebar } from "./AppSidebar";

export function AppShell({ children }: { children?: React.ReactNode }) {
  return (
    <div className="flex min-h-screen w-full bg-background relative">
      <AppSidebar />
      <main className="flex-1 min-w-0 flex flex-col relative z-[2]">
        {children ?? <Outlet />}
      </main>
    </div>
  );
}
