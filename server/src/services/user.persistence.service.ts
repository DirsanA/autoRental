import mongoose, { type PopulateOptions, type UpdateQuery } from "mongoose";
import { ObjectId } from "mongodb";
import { getMongoClient } from "../config/database.js";
import {
  AccountType,
  User,
  type IUser,
  type UserDocument,
} from "../models/User.js";

export class UserPersistenceService {
  /**
   * Returns the underlying Better Auth user collection.
   */
  private getUserCollection() {
    return getMongoClient().db().collection("user");
  }

  /**
   * Builds a resilient lookup that works with auth ids and Mongo ids.
   */
  private buildAuthLookup(authUserId: string) {
    const orFilters: Array<Record<string, unknown>> = [
      { id: authUserId },
      { _id: authUserId },
    ];

    if (mongoose.Types.ObjectId.isValid(authUserId)) {
      orFilters.push({ _id: new ObjectId(authUserId) });
    }

    return { $or: orFilters };
  }

  /**
   * Resolves an auth user id into the persisted primary key used by Mongoose.
   */
  async resolveUserPrimaryKey(
    authUserId: string,
  ): Promise<string | null> {
    const user = await this.getUserCollection().findOne(
      this.buildAuthLookup(authUserId),
      { projection: { _id: 1 } },
    );

    const primaryKey = user?._id;
    if (!primaryKey) {
      return null;
    }

    if (
      typeof primaryKey === "object" &&
      primaryKey !== null &&
      "toHexString" in primaryKey &&
      typeof primaryKey.toHexString === "function"
    ) {
      return primaryKey.toHexString();
    }

    return String(primaryKey);
  }

  /**
   * Executes a callback only when the auth user id resolves to a stored user.
   */
  private async withResolvedPrimaryKey<T>(
    authUserId: string,
    callback: (primaryKey: string) => Promise<T>,
    fallback: T,
  ): Promise<T> {
    const primaryKey = await this.resolveUserPrimaryKey(authUserId);
    if (!primaryKey) {
      return fallback;
    }

    return callback(primaryKey);
  }

  /**
   * Finds a user by auth id.
   */
  async findByAuthId(authUserId: string): Promise<UserDocument | null> {
    return this.withResolvedPrimaryKey(
      authUserId,
      (primaryKey) => User.findById(primaryKey),
      null,
    );
  }

  /**
   * Finds a user by auth id and populates roles when requested.
   */
  async findByAuthIdWithRoles(
    authUserId: string,
    populate: PopulateOptions | PopulateOptions[] | string | string[] = "roles",
  ): Promise<UserDocument | null> {
    return this.withResolvedPrimaryKey(
      authUserId,
      (primaryKey) =>
        User.findById(primaryKey).populate(
          populate as PopulateOptions | (string | PopulateOptions)[],
        ),
      null,
    );
  }

  /**
   * Finds a user by Mongo id.
   */
  async findByMongoId(userId: string | mongoose.Types.ObjectId) {
    return User.findById(userId);
  }

  /**
   * Finds a user by unique email.
   */
  async findByEmail(email: string): Promise<UserDocument | null> {
    return User.findOne({ email: email.trim().toLowerCase() });
  }

  /**
   * Updates a user document using an auth id lookup.
   */
  async updateByAuthId(
    authUserId: string,
    updates: UpdateQuery<IUser>,
  ): Promise<UserDocument | null> {
    return this.withResolvedPrimaryKey(
      authUserId,
      (primaryKey) =>
        User.findByIdAndUpdate(primaryKey, updates, {
          new: true,
        }),
      null,
    );
  }

  /**
   * Activates a user when they are still pending.
   */
  async activateIfPending(authUserId: string): Promise<void> {
    await this.withResolvedPrimaryKey(
      authUserId,
      (primaryKey) =>
        User.updateOne(
          { _id: primaryKey, status: "PENDING" },
          { $set: { status: "ACTIVE" } },
        ).then(() => undefined),
      undefined,
    );
  }

  /**
   * Records the most recent successful login time.
   */
  async markLastLogin(authUserId: string, at = new Date()): Promise<void> {
    await this.withResolvedPrimaryKey(
      authUserId,
      (primaryKey) =>
        User.updateOne({ _id: primaryKey }, { $set: { lastLogin: at } }).then(
          () => undefined,
        ),
      undefined,
    );
  }

  /**
   * Updates the account type for a user resolved by auth id.
   */
  async updateAccountType(
    authUserId: string,
    accountType: AccountType,
  ): Promise<void> {
    await this.withResolvedPrimaryKey(
      authUserId,
      (primaryKey) =>
        User.updateOne({ _id: primaryKey }, { $set: { accountType } }).then(
          () => undefined,
        ),
      undefined,
    );
  }

  /**
   * Adds a role to a user resolved by auth id.
   */
  async addRole(
    authUserId: string,
    roleId: mongoose.Types.ObjectId | string,
  ): Promise<void> {
    await this.withResolvedPrimaryKey(
      authUserId,
      (primaryKey) =>
        User.updateOne({ _id: primaryKey }, { $addToSet: { roles: roleId } }).then(
          () => undefined,
        ),
      undefined,
    );
  }

  /**
   * Adds a role directly to a known Mongo user id.
   */
  async addRoleByMongoId(
    userId: string | mongoose.Types.ObjectId,
    roleId: mongoose.Types.ObjectId | string,
  ): Promise<void> {
    await User.updateOne({ _id: userId }, { $addToSet: { roles: roleId } });
  }

  /**
   * Removes a role from a user resolved by auth id.
   */
  async removeRole(
    authUserId: string,
    roleId: mongoose.Types.ObjectId | string,
  ): Promise<void> {
    await this.withResolvedPrimaryKey(
      authUserId,
      (primaryKey) =>
        User.updateOne({ _id: primaryKey }, { $pull: { roles: roleId } }).then(
          () => undefined,
        ),
      undefined,
    );
  }

  /**
   * Removes auth-side records created for a user.
   */
  async cleanupAuthArtifacts(
    authUserId: string,
    email?: string,
  ): Promise<void> {
    const db = getMongoClient().db();

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
