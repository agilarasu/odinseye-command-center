import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiSend } from "@/lib/api";
import type { AlertRuleRow, AlertRow, Cve, Device, ReportHistoryRow, Severity, UserRow } from "@/types/odinseye";

export function useDashboardSummary() {
  return useQuery({
    queryKey: ["dashboard", "summary"],
    queryFn: () =>
      apiGet<{
        totalDevices: number;
        criticalCves: number;
        highCves: number;
        patchedToday: number;
        alerts24h: number;
        severityDonut: { name: string; value: number; severity: Severity }[];
        totalCves: number;
      }>("/api/dashboard/summary"),
  });
}

export function useDevices() {
  return useQuery({
    queryKey: ["devices"],
    queryFn: () => apiGet<Device[]>("/api/devices"),
  });
}

export function useDevice(deviceId: string | null) {
  return useQuery({
    queryKey: ["devices", deviceId],
    queryFn: () => apiGet<Device & { osVersion?: string; createdAt?: string; lastSeenRaw?: string }>(`/api/devices/${deviceId}`),
    enabled: !!deviceId,
  });
}

export function useDeleteDevice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiSend(`/api/devices/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["devices"] });
      qc.invalidateQueries({ queryKey: ["vulnerabilities"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useUpdateDevice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: Record<string, unknown> }) =>
      apiSend(`/api/devices/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
    onSuccess: (_, v) => {
      qc.invalidateQueries({ queryKey: ["devices"] });
      qc.invalidateQueries({ queryKey: ["devices", v.id] });
    },
  });
}

export function useScanDevice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiSend<{ new_vuln_rows: number; parsed_cves: number }>(`/api/devices/${id}/scan`, { method: "POST" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["vulnerabilities"] });
      qc.invalidateQueries({ queryKey: ["devices"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useVulnerabilities() {
  return useQuery({
    queryKey: ["vulnerabilities"],
    queryFn: async () => {
      const rows = await apiGet<
        {
          id: string;
          description: string;
          device: string;
          severity: Severity;
          cvss: number;
          vector: string;
          discoveredAt: string;
          status: Cve["status"];
          affectedDevices: string[];
          mitigation: string;
          vendor: string;
          vulnIds: number[];
          assignedTo?: string;
        }[]
      >("/api/vulnerabilities");
      return rows.map((r) => ({ ...r })) as Cve[];
    },
  });
}

export function useAlerts() {
  return useQuery({
    queryKey: ["alerts"],
    queryFn: () => apiGet<AlertRow[]>("/api/alerts"),
  });
}

export function useReportHistory() {
  return useQuery({
    queryKey: ["reports", "history"],
    queryFn: () => apiGet<ReportHistoryRow[]>("/api/reports/history"),
  });
}

export function useWeeklyTrend() {
  return useQuery({
    queryKey: ["reports", "trend"],
    queryFn: () => apiGet<{ week: string; count: number }[]>("/api/reports/trend"),
  });
}

export function useUsers() {
  return useQuery({
    queryKey: ["users"],
    queryFn: () =>
      apiGet<{ id: number; username: string; role: string; email?: string; name?: string; last_login?: string }[]>(
        "/api/users"
      ),
  });
}

export function useBulkAcknowledge() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ids: number[]) =>
      apiSend("/api/vulnerabilities/bulk-status", {
        method: "PATCH",
        body: JSON.stringify({ ids, status: "Acknowledged" }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["vulnerabilities"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useBulkAssign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { ids: number[]; assigned_to: string }) =>
      apiSend("/api/vulnerabilities/bulk-assign", {
        method: "PATCH",
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["vulnerabilities"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useAddDevice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      apiSend("/api/devices", { method: "POST", body: JSON.stringify(body) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["devices"] }),
  });
}

export async function downloadFilteredCsv(vulnIds: number[]) {
  const res = await fetch("/api/reports/export-csv", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ vuln_ids: vulnIds }),
  });
  if (!res.ok) throw new Error(await res.text());
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "vulnerabilities-selected.csv";
  a.click();
  URL.revokeObjectURL(url);
}

export function useAlertRules() {
  return useQuery({
    queryKey: ["alert-rules"],
    queryFn: () => apiGet<AlertRuleRow[]>("/api/alert-rules"),
  });
}

export function useCreateAlertRule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      apiSend<{ id: number }>("/api/alert-rules", { method: "POST", body: JSON.stringify(body) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["alert-rules"] }),
  });
}

export function useDeleteAlertRule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => apiSend(`/api/alert-rules/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["alert-rules"] }),
  });
}

export function useSettings() {
  return useQuery({
    queryKey: ["settings"],
    queryFn: () => apiGet<Record<string, string>>("/api/settings"),
  });
}

export function usePatchSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Record<string, string>) =>
      apiSend("/api/settings", { method: "PATCH", body: JSON.stringify(body) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["settings"] }),
  });
}

export function useAgentInstructions() {
  return useQuery({
    queryKey: ["agent-instructions"],
    queryFn: () =>
      apiGet<{ masterUrl: string; checkinPath: string; apiKeySet: boolean }>("/api/agent-instructions"),
  });
}
