import type {
  AdminUserCompanySummary,
  AdminUserDetail,
  AdminUserMetrics,
  AdminUserRecentBooking,
  AdminUserRecentDispute,
  AdminUserRecentReview,
  AdminUserRecentTransaction,
  AdminUserUiStatus,
  AdminUserVerificationRecord,
} from "@/lib/admin-users-api";

export type UserStatus = AdminUserUiStatus;
export type UserFullDetail = AdminUserDetail;
export type UserCompanySummary = AdminUserCompanySummary;
export type UserMetrics = AdminUserMetrics;
export type UserVerificationRecord = AdminUserVerificationRecord;
export type UserRecentBooking = AdminUserRecentBooking;
export type UserRecentReview = AdminUserRecentReview;
export type UserRecentDispute = AdminUserRecentDispute;
export type UserRecentTransaction = AdminUserRecentTransaction;

export interface ConfirmationConfig {
  title: string;
  description: string;
  confirmLabel: string;
  variant: "destructive" | "default";
  onConfirm: () => Promise<void>;
}
