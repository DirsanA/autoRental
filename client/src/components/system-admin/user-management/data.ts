export type UserStatus = "active" | "inactive" | "invited" | "suspended";

export type User = {
  id: string;
  name: string;
  username: string;
  email: string;
  role: string;
  status: UserStatus;
  joined: string; // ISO date or formatted string
};

export const mockUsers: User[] = [
  {
    id: "usr_01",
    name: "Amina Noor",
    username: "amina.noor",
    email: "amina.noor@example.com",
    role: "Admin",
    status: "active",
    joined: "2026-01-12",
  },
  {
    id: "usr_02",
    name: "Marcus Lee",
    username: "mlee",
    email: "marcus.lee@example.com",
    role: "Manager",
    status: "invited",
    joined: "2026-01-24",
  },
  {
    id: "usr_03",
    name: "Sofia Alvarez",
    username: "sofia.a",
    email: "sofia.alvarez@example.com",
    role: "Support",
    status: "active",
    joined: "2025-12-03",
  },
  {
    id: "usr_04",
    name: "Eliot Chen",
    username: "eliot.chen",
    email: "eliot.chen@example.com",
    role: "Analyst",
    status: "inactive",
    joined: "2025-11-18",
  },
  {
    id: "usr_05",
    name: "Priya Singh",
    username: "priya.s",
    email: "priya.singh@example.com",
    role: "Reviewer",
    status: "suspended",
    joined: "2025-10-02",
  },
];
