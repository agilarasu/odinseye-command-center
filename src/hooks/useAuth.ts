import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api";

export function useMe() {
  return useQuery({
    queryKey: ["me"],
    queryFn: () => apiGet<{ user: { id: number; username: string; role: string } | null }>("/api/me"),
    staleTime: 60_000,
  });
}
