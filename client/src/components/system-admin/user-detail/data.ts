import type {
  UserFullDetail,
  UserActivity,
  SecurityEvent,
  UserStatus,
} from "./types";

export const mockUsersDetail: Record<string, UserFullDetail> = {
  usr_01: {
    id: "usr_01",
    name: "Amina Noor",
    username: "amina.noor",
    email: "amina.noor@example.com",
    role: "Admin",
    status: "active",
    joined: "2026-01-12",
    lastLogin: "2026-02-28T08:15:00Z",
    department: "Executive Management",
    manager: "Self",
  },
  usr_02: {
    id: "usr_02",
    name: "Marcus Lee",
    username: "mlee",
    email: "marcus.lee@example.com",
    role: "Manager",
    status: "invited",
    joined: "2026-01-24",
    lastLogin: "Never",
    department: "Operations",
    manager: "usr_01",
  },
  usr_03: {
    id: "usr_03",
    name: "Sofia Alvarez",
    username: "sofia.a",
    email: "sofia.alvarez@example.com",
    role: "Support",
    status: "active",
    joined: "2025-12-03",
    lastLogin: "2026-02-27T14:30:22Z",
    department: "Customer Service",
    manager: "usr_02",
  },
};

export const mockUserActivity: Record<string, UserActivity[]> = {
  usr_01: [
    {
      id: "act_1",
      action: "Updated System Settings",
      module: "Settings",
      ipAddress: "192.168.1.15",
      timestamp: "2026-02-28T10:05:00Z",
    },
    {
      id: "act_2",
      action: "Suspended User usr_05",
      module: "User Management",
      ipAddress: "192.168.1.15",
      timestamp: "2026-02-27T16:20:00Z",
    },
    {
      id: "act_3",
      action: "Generated Revenue Report",
      module: "Finance",
      ipAddress: "192.168.1.15",
      timestamp: "2026-02-25T09:12:00Z",
    },
    {
      id: "act_4",
      action: "Approved P2P Host p2p_03",
      module: "P2P Approvals",
      ipAddress: "192.168.1.15",
      timestamp: "2026-02-24T11:45:00Z",
    },
  ],
  usr_03: [
    {
      id: "act_5",
      action: "Resolved Ticket #9012",
      module: "Support",
      ipAddress: "10.0.0.52",
      timestamp: "2026-02-27T15:10:00Z",
    },
    {
      id: "act_6",
      action: "Reset Password for Customer X",
      module: "Support",
      ipAddress: "10.0.0.52",
      timestamp: "2026-02-26T08:30:00Z",
    },
  ],
};

export const mockUserSecurity: Record<string, SecurityEvent[]> = {
  usr_01: [
    {
      id: "sec_1",
      event: "Login Successful",
      status: "success",
      device: "Mac OS (Chrome)",
      location: "Nairobi, KE",
      timestamp: "2026-02-28T08:15:00Z",
    },
    {
      id: "sec_2",
      event: "Password Changed",
      status: "warning",
      device: "Mac OS (Chrome)",
      location: "Nairobi, KE",
      timestamp: "2026-02-15T12:00:00Z",
    },
    {
      id: "sec_3",
      event: "Failed Login Attempt",
      status: "failed",
      device: "Unknown Device",
      location: "Moscow, RU",
      timestamp: "2026-01-20T03:45:00Z",
    },
  ],
  usr_02: [
    {
      id: "sec_4",
      event: "Invitation Sent",
      status: "success",
      device: "System",
      location: "Internal",
      timestamp: "2026-01-24T09:00:00Z",
    },
  ],
};

export function getUserData(userId: string) {
  const id = mockUsersDetail[userId] ? userId : "usr_01";
  return {
    user: mockUsersDetail[id],
    activities: mockUserActivity[id] || [],
    securityEvents: mockUserSecurity[id] || [],
  };
}
