export type DisputeStatus = "open" | "under_review" | "resolved" | "closed" | "escalated";
export type DisputeCategory =
  | "billing"
  | "vehicle_condition"
  | "cancellation"
  | "no_show"
  | "damage_claim"
  | "fraud"
  | "service_quality"
  | "other";
export type DisputePriority = "low" | "medium" | "high" | "critical";
export type DisputePartyRole = "renter" | "company" | "p2p_host" | "platform";

export interface DisputeParty {
  id: string;
  name: string;
  email: string;
  role: DisputePartyRole;
  avatarInitials: string;
}

export interface Dispute {
  id: string;
  caseNumber: string;
  title: string;
  category: DisputeCategory;
  status: DisputeStatus;
  priority: DisputePriority;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  claimant: DisputeParty;
  respondent: DisputeParty;
  bookingRef?: string;
  amountClaimed?: number;
  currency?: string;
  assignedTo?: string;
  shortDescription: string;
}

export interface DisputeMessage {
  id: string;
  author: string;
  authorRole: DisputePartyRole | "admin";
  content: string;
  timestamp: string;
  isInternal?: boolean;
}

export interface DisputeEvent {
  id: string;
  type: "status_change" | "assignment" | "message" | "document" | "resolution";
  description: string;
  actor: string;
  timestamp: string;
}

export interface ConfirmationConfig {
  title: string;
  description: string;
  confirmLabel: string;
  variant: "destructive" | "default";
  onConfirm: () => Promise<void>;
}
