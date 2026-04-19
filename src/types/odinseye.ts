export type Severity = "Critical" | "High" | "Medium" | "Low";
export type CveStatus = "New" | "Acknowledged" | "Patched";
export type DeviceStatus = "healthy" | "vulnerable" | "critical" | "offline";

export interface Cve {
  id: string;
  description: string;
  device: string;
  severity: Severity;
  cvss: number;
  vector: string;
  discoveredAt: string;
  status: CveStatus;
  affectedDevices: string[];
  mitigation: string;
  vendor: string;
  /** DB row ids for bulk status update */
  vulnIds?: number[];
  assignedTo?: string;
}

export interface Device {
  id: string;
  hostname: string;
  os: string;
  ip: string;
  lastHeartbeat: string;
  agentVersion: string;
  vulnerabilities: number;
  status: DeviceStatus;
  type: "agent" | "manual";
  make?: string;
  model?: string;
  firmware?: string;
  location?: string;
  category?: string;
  osVersion?: string;
  createdAt?: string;
  lastSeenRaw?: string;
  /** Agent-reported hardware snapshot */
  hardware?: Record<string, string>;
  /** Up to 5 packages (name + version) used for CVE CPE matching */
  software?: { name: string; version?: string }[];
}

export interface AlertRuleRow {
  id: number;
  min_cvss: number | null;
  severity_filter: string | null;
  device_group: string | null;
  alert_method: string;
  recipient: string;
  enabled: number;
}

export interface AlertRow {
  id: string;
  ts: string;
  cve: string;
  device: string;
  severity: Severity;
  method: string;
}

export interface ReportHistoryRow {
  id: string;
  name: string;
  type: string;
  generated: string;
  size: string;
}

export interface UserRow {
  id: string;
  username: string;
  role: string;
  email?: string;
  name?: string;
  last_login?: string;
}
