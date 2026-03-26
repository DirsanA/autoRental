import mongoose, { type PopulateOptions, type UpdateQuery } from "mongoose";
import { getMongoClient } from "../config/database.js";
import {
  AccountType,
  User,
  type IUser,
  type UserDocument,
} from "../models/User.js";

export class UserPersistenceService {
  private getUserCollection() {
    return getMongoClient().db().collection("user");
  }

  private buildAuthLookup(authUserId: string) {
    const orFilters: Array<Record<string, unknown>> = [
      { id: authUserId },
      { _id: authUserId },
    ];

    if (mongoose.Types.ObjectId.isValid(authUserId)) {
      orFilters.push({ _id: new mongoose.Types.ObjectId(authUserId) });
    }

    return { $or: orFilters };
  }

  async resolveUserPrimaryKey(
    authUserId: string,
  ): Promise<mongoose.Types.ObjectId | string | null> {
    const user = await this.getUserCollection().findOne(
      this.buildAuthLookup(authUserId),
      { projection: { _id: 1 } },
    );

    return (user?._id as mongoose.Types.ObjectId | string | undefined) ?? null;
  }

  async findByAuthId(authUserId: string): Promise<UserDocument | null> {
    // Resolves the domain user document that mirrors the better-auth user record.
    const primaryKey = await this.resolveUserPrimaryKey(authUserId);
    if (!primaryKey) return null;

    return User.findById(primaryKey);
  }

  async findByAuthIdWithRoles(
    authUserId: string,
    populate: PopulateOptions | PopulateOptions[] | string | string[] = "roles",
  ): Promise<UserDocument | null> {
    // Loads the user along with role documents when permission-aware logic needs populated roles.
    const primaryKey = await this.resolveUserPrimaryKey(authUserId);
    if (!primaryKey) return null;

    return User.findById(primaryKey).populate(
      populate as PopulateOptions | (string | PopulateOptions)[],
    );
  }

  async findByMongoId(userId: string | mongoose.Types.ObjectId) {
    // Supports lookups that already have a Mongo id from another persisted document.
    return User.findById(userId);
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    // Supports duplicate checks and auth lookups that should use the unique email field.
    return User.findOne({ email: email.trim().toLowerCase() });
  }

  async updateByAuthId(
    authUserId: string,
    updates: UpdateQuery<IUser>,
  ): Promise<UserDocument | null> {
    // Applies direct domain-field updates using the auth user id as the stable lookup key.
    const primaryKey = await this.resolveUserPrimaryKey(authUserId);
    if (!primaryKey) return null;

    return User.findByIdAndUpdate(primaryKey, updates, {
      new: true,
    });
  }

  async activateIfPending(authUserId: string): Promise<void> {
    // Promotes pending users to active once their email verification lifecycle completes.
    const primaryKey = await this.resolveUserPrimaryKey(authUserId);
    if (!primaryKey) return;

    await User.updateOne(
      { _id: primaryKey, status: "PENDING" },
      { $set: { status: "ACTIVE" } },
    );
  }

  async markLastLogin(authUserId: string, at = new Date()): Promise<void> {
    // Tracks the most recent successful sign-in time for audit and support visibility.
    const primaryKey = await this.resolveUserPrimaryKey(authUserId);
    if (!primaryKey) return;

    await User.updateOne({ _id: primaryKey }, { $set: { lastLogin: at } });
  }

  async updateAccountType(
    authUserId: string,
    accountType: AccountType,
  ): Promise<void> {
    const primaryKey = await this.resolveUserPrimaryKey(authUserId);
    if (!primaryKey) return;

    await User.updateOne({ _id: primaryKey }, { $set: { accountType } });
  }

  async addRole(
    authUserId: string,
    roleId: mongoose.Types.ObjectId | string,
  ): Promise<void> {
    // Adds a role id idempotently so repeated grants do not duplicate entries in the user record.
    const primaryKey = await this.resolveUserPrimaryKey(authUserId);
    if (!primaryKey) return;

    await User.updateOne({ _id: primaryKey }, { $addToSet: { roles: roleId } });
  }

  async removeRole(
    authUserId: string,
    roleId: mongoose.Types.ObjectId | string,
  ): Promise<void> {
    // Removes a role id cleanly when capability or authorization state is revoked.
    const primaryKey = await this.resolveUserPrimaryKey(authUserId);
    if (!primaryKey) return;

    await User.updateOne({ _id: primaryKey }, { $pull: { roles: roleId } });
  }

  async cleanupAuthArtifacts(
    authUserId: string,
    email?: string,
  ): Promise<void> {
    const db = getMongoClient().db();

    // Deletes auth-side records so partially failed registration flows do not leave orphaned data behind.
    await Promise.all([
      db.collection("session").deleteMany({ userId: authUserId }),
      db.collection("account").deleteMany({ userId: authUserId }),
      this.getUserCollection().deleteOne(this.buildAuthLookup(authUserId)),
      email
        ? db.collection("verification").deleteMany({ identifier: email })
        : Promise.resolve(),
    ]);
  }
}

export const userPersistenceService = new UserPersistenceService();
