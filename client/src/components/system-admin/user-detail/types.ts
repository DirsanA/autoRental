export type UserStatus = "active" | "inactive" | "invited" | "suspended";

export interface UserFullDetail {
  id: string;
  name: string;
  username: string;
  email: string;
  role: string;
  status: UserStatus;
  joined: string;
  avatarUrl?: string;
  lastLogin: string;
  department: string;
  manager: string;
}

export interface UserActivity {
  id: string;
  action: string;
  module: string;
  ipAddress: string;
  timestamp: string;
}

export interface SecurityEvent {
  id: string;
  event: string;
  status: "success" | "failed" | "warning";
  device: string;
  location: string;
  timestamp: string;
}

// ─── Shared UI Types ─────────────────────────────────────────────────────────

export interface ConfirmationConfig {
  title: string;
  description: string;
  confirmLabel: string;
  variant: "destructive" | "default";
  onConfirm: () => Promise<void>;
}
