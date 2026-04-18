// Mock data for OdinsEye platform
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
}

export const cves: Cve[] = [
  {
    id: "CVE-2024-21762",
    description: "Out-of-bounds write vulnerability in Fortinet FortiOS allowing remote code execution via crafted HTTP requests.",
    device: "Firewall-DC",
    severity: "Critical",
    cvss: 9.8,
    vector: "AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H",
    discoveredAt: "2025-04-17 14:22:11",
    status: "New",
    affectedDevices: ["Firewall-DC", "Router-HQ"],
    mitigation: "Upgrade to FortiOS 7.4.3 or later. Apply vendor patch FG-IR-24-015 immediately.",
    vendor: "Fortinet",
  },
  {
    id: "CVE-2023-20198",
    description: "Cisco IOS XE Web UI privilege escalation allowing unauthenticated remote attackers to create level-15 accounts.",
    device: "CoreSwitch-01",
    severity: "Critical",
    cvss: 10.0,
    vector: "AV:N/AC:L/PR:N/UI:N/S:C/C:H/I:H/A:H",
    discoveredAt: "2025-04-17 09:45:02",
    status: "Acknowledged",
    affectedDevices: ["CoreSwitch-01", "Router-HQ"],
    mitigation: "Disable HTTP/HTTPS server feature on internet-facing devices. Apply Cisco patch.",
    vendor: "Cisco",
  },
  {
    id: "CVE-2024-3400",
    description: "Command injection in GlobalProtect feature of PAN-OS allowing unauthenticated remote shell execution.",
    device: "Firewall-DC",
    severity: "Critical",
    cvss: 10.0,
    vector: "AV:N/AC:L/PR:N/UI:N/S:C/C:H/I:H/A:H",
    discoveredAt: "2025-04-16 23:11:48",
    status: "New",
    affectedDevices: ["Firewall-DC"],
    mitigation: "Upgrade PAN-OS to 11.1.2-h3 or apply vendor hotfix. Disable telemetry as workaround.",
    vendor: "Palo Alto",
  },
  {
    id: "CVE-2023-44487",
    description: "HTTP/2 Rapid Reset attack — DoS via stream cancellation flood affecting numerous web servers.",
    device: "Ubuntu-Server-02",
    severity: "High",
    cvss: 7.5,
    vector: "AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:N/A:H",
    discoveredAt: "2025-04-16 18:32:09",
    status: "Patched",
    affectedDevices: ["Ubuntu-Server-02", "WIN-PC-001"],
    mitigation: "Update nginx/apache/h2o packages. Configure rate limiting on HTTP/2 streams.",
    vendor: "Various",
  },
  {
    id: "CVE-2024-1709",
    description: "ConnectWise ScreenConnect authentication bypass via path traversal allowing admin access.",
    device: "WIN-PC-001",
    severity: "High",
    cvss: 8.1,
    vector: "AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:L/A:N",
    discoveredAt: "2025-04-15 11:08:24",
    status: "Acknowledged",
    affectedDevices: ["WIN-PC-001"],
    mitigation: "Upgrade ScreenConnect to 23.9.8 or later. Restrict management interface access.",
    vendor: "ConnectWise",
  },
  {
    id: "CVE-2024-30078",
    description: "Windows Wi-Fi driver remote code execution via crafted networking packets in range.",
    device: "WIN-PC-001",
    severity: "Medium",
    cvss: 6.5,
    vector: "AV:A/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H",
    discoveredAt: "2025-04-15 08:22:00",
    status: "New",
    affectedDevices: ["WIN-PC-001"],
    mitigation: "Apply Windows June 2024 cumulative update KB5039212.",
    vendor: "Microsoft",
  },
  {
    id: "CVE-2024-22274",
    description: "VMware vCenter authenticated RCE via unspecified shell command injection.",
    device: "Ubuntu-Server-02",
    severity: "Medium",
    cvss: 5.4,
    vector: "AV:N/AC:L/PR:H/UI:N/S:U/C:H/I:H/A:H",
    discoveredAt: "2025-04-14 16:09:33",
    status: "Acknowledged",
    affectedDevices: ["Ubuntu-Server-02"],
    mitigation: "Upgrade vCenter Server to 8.0 U2b.",
    vendor: "VMware",
  },
  {
    id: "CVE-2023-28771",
    description: "Zyxel firewall OS command injection in IKEv2 packet decoder.",
    device: "CCTV-Cam-01",
    severity: "Low",
    cvss: 3.7,
    vector: "AV:N/AC:H/PR:N/UI:N/S:U/C:L/I:L/A:N",
    discoveredAt: "2025-04-13 22:14:52",
    status: "Patched",
    affectedDevices: ["CCTV-Cam-01"],
    mitigation: "Update firmware to vendor-released hotfix.",
    vendor: "Zyxel",
  },
];

export const devices: Device[] = [
  { id: "d1", hostname: "Router-HQ", os: "Cisco IOS XE 17.6", ip: "10.0.0.1", lastHeartbeat: "12s ago", agentVersion: "1.4.2", vulnerabilities: 3, status: "critical", type: "agent" },
  { id: "d2", hostname: "Firewall-DC", os: "Juniper JunOS 22.4", ip: "10.0.0.2", lastHeartbeat: "8s ago", agentVersion: "1.4.2", vulnerabilities: 5, status: "critical", type: "agent" },
  { id: "d3", hostname: "WIN-PC-001", os: "Windows 11 Pro 23H2", ip: "10.0.1.45", lastHeartbeat: "45s ago", agentVersion: "1.4.1", vulnerabilities: 4, status: "vulnerable", type: "agent" },
  { id: "d4", hostname: "Ubuntu-Server-02", os: "Ubuntu 22.04 LTS", ip: "10.0.0.18", lastHeartbeat: "3s ago", agentVersion: "1.4.2", vulnerabilities: 2, status: "vulnerable", type: "agent" },
  { id: "d5", hostname: "CoreSwitch-01", os: "Cisco IOS XE 17.9", ip: "10.0.0.3", lastHeartbeat: "21s ago", agentVersion: "1.4.2", vulnerabilities: 2, status: "critical", type: "agent" },
  { id: "d6", hostname: "DB-Cluster-01", os: "RHEL 9.3", ip: "10.0.0.50", lastHeartbeat: "5s ago", agentVersion: "1.4.2", vulnerabilities: 0, status: "healthy", type: "agent" },
  { id: "d7", hostname: "DB-Cluster-02", os: "RHEL 9.3", ip: "10.0.0.51", lastHeartbeat: "7s ago", agentVersion: "1.4.2", vulnerabilities: 0, status: "healthy", type: "agent" },
  { id: "d8", hostname: "App-Worker-04", os: "Debian 12", ip: "10.0.2.14", lastHeartbeat: "2m ago", agentVersion: "1.4.0", vulnerabilities: 1, status: "vulnerable", type: "agent" },
  { id: "d9", hostname: "Bastion-Host", os: "Alpine 3.19", ip: "10.0.0.10", lastHeartbeat: "—", agentVersion: "1.4.2", vulnerabilities: 0, status: "offline", type: "agent" },

  { id: "m1", hostname: "CCTV-Cam-01", os: "Embedded Linux 4.9", ip: "10.0.5.11", lastHeartbeat: "—", agentVersion: "—", vulnerabilities: 1, status: "vulnerable", type: "manual", make: "Hikvision", model: "DS-2CD2143G2", firmware: "5.7.3", location: "Lobby", category: "CCTV" },
  { id: "m2", hostname: "CCTV-Cam-02", os: "Embedded Linux 4.9", ip: "10.0.5.12", lastHeartbeat: "—", agentVersion: "—", vulnerabilities: 1, status: "vulnerable", type: "manual", make: "Hikvision", model: "DS-2CD2143G2", firmware: "5.7.3", location: "Garage", category: "CCTV" },
  { id: "m3", hostname: "IP-Cam-Lobby", os: "Embedded Linux 3.10", ip: "10.0.5.20", lastHeartbeat: "—", agentVersion: "—", vulnerabilities: 0, status: "healthy", type: "manual", make: "Dahua", model: "IPC-HDW2831T", firmware: "2.840", location: "Lobby", category: "CCTV" },
  { id: "m4", hostname: "OT-Sensor-01", os: "Siemens RTOS", ip: "10.0.7.5", lastHeartbeat: "—", agentVersion: "—", vulnerabilities: 0, status: "healthy", type: "manual", make: "Siemens", model: "S7-1200", firmware: "4.5.2", location: "Substation A", category: "OT Sensor" },
];

export const severityColor = (s: Severity) => {
  switch (s) {
    case "Critical": return "severity-critical";
    case "High": return "severity-high";
    case "Medium": return "severity-medium";
    case "Low": return "severity-low";
  }
};

export const severityHsl = (s: Severity) => {
  switch (s) {
    case "Critical": return "hsl(var(--severity-critical))";
    case "High": return "hsl(var(--severity-high))";
    case "Medium": return "hsl(var(--severity-medium))";
    case "Low": return "hsl(var(--severity-low))";
  }
};

export const alerts = [
  { id: "a1", ts: "2025-04-17 14:22:14", cve: "CVE-2024-21762", device: "Firewall-DC", severity: "Critical" as Severity, method: "Email" },
  { id: "a2", ts: "2025-04-17 14:22:14", cve: "CVE-2024-21762", device: "Firewall-DC", severity: "Critical" as Severity, method: "SMS" },
  { id: "a3", ts: "2025-04-17 09:45:09", cve: "CVE-2023-20198", device: "CoreSwitch-01", severity: "Critical" as Severity, method: "Webhook" },
  { id: "a4", ts: "2025-04-16 23:11:55", cve: "CVE-2024-3400", device: "Firewall-DC", severity: "Critical" as Severity, method: "Email" },
  { id: "a5", ts: "2025-04-16 18:32:13", cve: "CVE-2023-44487", device: "Ubuntu-Server-02", severity: "High" as Severity, method: "Email" },
  { id: "a6", ts: "2025-04-15 11:08:30", cve: "CVE-2024-1709", device: "WIN-PC-001", severity: "High" as Severity, method: "SMS" },
  { id: "a7", ts: "2025-04-15 08:22:08", cve: "CVE-2024-30078", device: "WIN-PC-001", severity: "Medium" as Severity, method: "Email" },
];

export const reportHistory = [
  { id: "r1", name: "Weekly Summary — W16 2025", type: "Weekly Summary", generated: "2025-04-15 06:00", size: "412 KB" },
  { id: "r2", name: "Full Vulnerability Report — Apr 2025", type: "Full Vulnerability", generated: "2025-04-10 09:14", size: "2.1 MB" },
  { id: "r3", name: "Device Compliance — Q1 2025", type: "Device Compliance", generated: "2025-04-01 11:30", size: "1.4 MB" },
  { id: "r4", name: "Weekly Summary — W15 2025", type: "Weekly Summary", generated: "2025-04-08 06:00", size: "388 KB" },
];

export const weeklyVulnData = [
  { week: "W9", count: 8 },
  { week: "W10", count: 12 },
  { week: "W11", count: 6 },
  { week: "W12", count: 15 },
  { week: "W13", count: 22 },
  { week: "W14", count: 11 },
  { week: "W15", count: 9 },
  { week: "W16", count: 18 },
];

export const users = [
  { id: "u1", name: "Astrid Halvorsen", email: "astrid@odinseye.io", role: "Admin", lastLogin: "2025-04-17 13:42" },
  { id: "u2", name: "Marcus Chen", email: "marcus@odinseye.io", role: "Analyst", lastLogin: "2025-04-17 11:08" },
  { id: "u3", name: "Priya Rangan", email: "priya@odinseye.io", role: "Analyst", lastLogin: "2025-04-16 22:14" },
  { id: "u4", name: "Diego Alvarez", email: "diego@odinseye.io", role: "Read-only", lastLogin: "2025-04-12 09:33" },
];
