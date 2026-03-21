import mongoose, { type PopulateOptions, type UpdateQuery } from "mongoose";
import { getMongoClient } from "../config/database.js";
import { User, type IUser, type UserDocument } from "../models/User.js";

export class UserPersistenceService {
  toObjectId(authUserId: string) {
    // Converts better-auth string ids into Mongo ObjectIds for direct model queries and updates.
    return new mongoose.Types.ObjectId(authUserId);
  }

  async findByAuthId(authUserId: string): Promise<UserDocument | null> {
    // Resolves the domain user document that mirrors the better-auth user record.
    return User.findById(this.toObjectId(authUserId));
  }

  async findByAuthIdWithRoles(
    authUserId: string,
    populate: PopulateOptions | PopulateOptions[] | string | string[] = "roles",
  ): Promise<UserDocument | null> {
    // Loads the user along with role documents when permission-aware logic needs populated roles.
    return User.findById(this.toObjectId(authUserId)).populate(
      populate as PopulateOptions | (string | PopulateOptions)[],
    );
  }

  async findByMongoId(userId: string | mongoose.Types.ObjectId) {
    // Supports lookups that already have a Mongo id from another persisted document.
    return User.findById(userId);
  }

  async updateByAuthId(
    authUserId: string,
    updates: UpdateQuery<IUser>,
  ): Promise<UserDocument | null> {
    // Applies direct domain-field updates using the auth user id as the stable lookup key.
    return User.findByIdAndUpdate(this.toObjectId(authUserId), updates, {
      new: true,
    });
  }

  async activateIfPending(authUserId: string): Promise<void> {
    // Promotes pending users to active once their email verification lifecycle completes.
    await User.updateOne(
      { _id: this.toObjectId(authUserId), status: "PENDING" },
      { $set: { status: "ACTIVE" } },
    );
  }

  async markLastLogin(authUserId: string, at = new Date()): Promise<void> {
    // Tracks the most recent successful sign-in time for audit and support visibility.
    await User.updateOne(
      { _id: this.toObjectId(authUserId) },
      { $set: { lastLogin: at } },
    );
  }

  async addRole(authUserId: string, roleId: mongoose.Types.ObjectId | string): Promise<void> {
    // Adds a role id idempotently so repeated grants do not duplicate entries in the user record.
    await User.updateOne(
      { _id: this.toObjectId(authUserId) },
      { $addToSet: { roles: roleId } },
    );
  }

  async removeRole(authUserId: string, roleId: mongoose.Types.ObjectId | string): Promise<void> {
    // Removes a role id cleanly when capability or authorization state is revoked.
    await User.updateOne(
      { _id: this.toObjectId(authUserId) },
      { $pull: { roles: roleId } },
    );
  }

  async cleanupAuthArtifacts(authUserId: string, email?: string): Promise<void> {
    const userObjectId = this.toObjectId(authUserId);
    const db = getMongoClient().db();

    // Deletes auth-side records so partially failed registration flows do not leave orphaned data behind.
    await Promise.all([
      db.collection("session").deleteMany({ userId: userObjectId }),
      db.collection("account").deleteMany({ userId: userObjectId }),
      db.collection("user").deleteOne({ _id: userObjectId }),
      email
        ? db.collection("verification").deleteMany({ identifier: email })
        : Promise.resolve(),
    ]);
  }
}

export const userPersistenceService = new UserPersistenceService();
