import {
  deleteAdminUser,
  fetchAdminUserDetail,
  mapUiStatusToApi,
  updateAdminUserStatus,
  updateAdminUserVerificationLevel,
  updateAdminUserVerification,
} from "@/lib/admin-users-api";
import type {
  UserStatus,
  UserVerificationRecord,
  UserFullDetail,
} from "./types";

export { fetchAdminUserDetail };

export async function updateAdminUserDetailStatus(
  userId: string,
  status: UserStatus,
) {
  return updateAdminUserStatus(userId, mapUiStatusToApi(status));
}

export async function deleteAdminUserDetail(userId: string) {
  await deleteAdminUser(userId);
}

export async function updateVerificationStatus(
  userId: string,
  verificationId: string,
  action: "approve" | "reject",
  comment?: string,
): Promise<UserVerificationRecord> {
  // Always force=true to allow reversing decisions (approve -> reject or reject -> approve)
  return updateAdminUserVerification(
    userId,
    verificationId,
    action === "approve" ? "APPROVED" : "REJECTED",
    comment,
    true,
  );
}

export async function promoteUserVerificationLevel(
  userId: string,
  _action: "promote_id" | "promote_license",
): Promise<UserFullDetail> {
  // For now, all promotions go to PEER_HOST since that's the only level supported by the server
  // TODO: Update server schema to support ID_VERIFIED and LICENSE_VERIFIED
  return updateAdminUserVerificationLevel(userId, "PEER_HOST");
}
