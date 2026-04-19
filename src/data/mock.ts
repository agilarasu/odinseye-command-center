// Severity helpers (legacy name — data now from API)
import type { Severity } from "@/types/odinseye";

export type { Severity, CveStatus, DeviceStatus, Cve, Device } from "@/types/odinseye";

export const severityColor = (s: Severity) => {
  switch (s) {
    case "Critical":
      return "severity-critical";
    case "High":
      return "severity-high";
    case "Medium":
      return "severity-medium";
    case "Low":
      return "severity-low";
  }
};

export const severityHsl = (s: Severity) => {
  switch (s) {
    case "Critical":
      return "hsl(var(--severity-critical))";
    case "High":
      return "hsl(var(--severity-high))";
    case "Medium":
      return "hsl(var(--severity-medium))";
    case "Low":
      return "hsl(var(--severity-low))";
  }
};
