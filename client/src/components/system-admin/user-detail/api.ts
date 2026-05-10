import {
  deleteAdminUser,
  fetchAdminUserDetail,
  mapUiStatusToApi,
  updateAdminUserStatus,
  updateAdminUserVerificationLevel,
  updateAdminUserVerification,
  updateAdminUserSelfDriveAccess,
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
  action: "promote_id" | "promote_license",
): Promise<UserFullDetail> {
  return updateAdminUserVerificationLevel(
    userId,
    action === "promote_id" ? "ID_VERIFIED" : "LICENSE_VERIFIED",
  );
}

export async function updateUserSelfDriveAccess(
  userId: string,
  canSelfDrive: boolean,
): Promise<UserFullDetail> {
  return updateAdminUserSelfDriveAccess(userId, canSelfDrive);
}
