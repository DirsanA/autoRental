import {
  deleteAdminUser,
  fetchAdminUserDetail,
  mapUiStatusToApi,
  updateAdminUserStatus,
} from "@/lib/admin-users-api";
import type { UserStatus } from "./types";

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
