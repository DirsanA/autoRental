import mongoose from "mongoose";
import type { Auth } from "../config/auth.js";
import { Company } from "../models/Company.js";
import { Role } from "../models/Role.js";
import { SYSTEM_ROLES } from "../config/constants.js";
import { ENV } from "../config/env.js";
import { ApiError } from "../utils/ApiError.js";
import type {
  RegisterUserInput,
  RegisterCompanyInput,
} from "../validators/auth.validator.js";
import { userPersistenceService } from "./user.persistence.service.js";

/**
 * Auth service — business logic for registration, role assignment, and login helpers.
 *
 * better-auth already manages:
 *   - Password hashing (bcrypt)
 *   - Session/token creation
 *   - Email verification flow
 *   - Password reset flow
 *
 * This service wraps those flows with our domain-specific logic
 * (role assignment, company creation, etc.)
 */
export class AuthService {
  private auth: Auth;

  constructor(auth: Auth) {
    this.auth = auth;
  }

  /**
   * Register a base user account (no rental abilities yet).
   * 1. Call better-auth sign-up (creates user + session)
   */
  async registerUser(data: RegisterUserInput, headers: Headers) {
    // Creates the base auth account and seeds the domain fields needed by the platform.
    const result = await this.auth.api.signUpEmail({
      headers,
      body: {
        email: data.email,
        password: data.password,
        name: `${data.firstName} ${data.lastName}`,
        firstName: data.firstName,
        lastName: data.lastName,
        phoneNumber: data.phoneNumber,
        callbackURL: `${ENV.FRONTEND_URL}/verify-email`,
      },
    });

    return result;
  }

  /**
   * Register a COMPANY ADMIN account + create the Company document.
   * This is an atomic-ish flow:
   * 1. Validate that TIN doesn't already exist
   * 2. Create user via better-auth
   * 3. Assign "renter" + "company_admin" roles
   * 4. Create Company document linked to the new user
   */
  async registerCompany(data: RegisterCompanyInput, headers: Headers) {
    // Prevents duplicate company identities before any auth records are created.
    // Pre-validate: check TIN uniqueness before creating the user
    const tinExists = await Company.findOne({ tinNumber: data.tinNumber });
    if (tinExists) {
      throw ApiError.conflict("A company with this TIN number already exists");
    }

    let userId: string | null = null;

    // Creates the auth account first so the new company can be linked to a real owner id.
    const result = await this.auth.api.signUpEmail({
      headers,
      body: {
        email: data.email,
        password: data.password,
        name: `${data.firstName} ${data.lastName}`,
        firstName: data.firstName,
        lastName: data.lastName,
        phoneNumber: data.phoneNumber,
        callbackURL: `${ENV.FRONTEND_URL}/verify-email`,
      },
    });

    userId = result.user.id;

    try {
      // Grants the company role before creating the company document tied to that new user.
      await this.assignRoleToUser(userId, SYSTEM_ROLES.COMPANY);

      const company = await Company.create({
        ownerId: new mongoose.Types.ObjectId(userId),
        name: data.companyName,
        tinNumber: data.tinNumber,
        website: data.website,
        bio: data.bio,
        contactInfo: {
          email: data.companyEmail,
          phoneNumber: data.companyPhone,
          address: data.companyAddress,
        },
      });

      return { ...result, company };
    } catch (error) {
      // Rolls back auth-side artifacts when the domain-specific company setup fails partway through.
      if (userId) {
        await userPersistenceService.cleanupAuthArtifacts(userId, data.email);
      }
      throw error;
    }
  }

  /**
   * Login with email and password.
   * Delegates to better-auth sign-in and updates lastLogin timestamp.
   */
  async login(email: string, password: string, headers: Headers) {
    // Delegates credential validation to better-auth and then records the user's latest login time.
    const result = await this.auth.api.signInEmail({
      headers,
      body: { email, password },
    });

    // Update lastLogin on the better-auth user record
    if (result.user) {
      try {
        await userPersistenceService.markLastLogin(result.user.id);
      } catch (err) {
        // Leaves login successful even if the non-critical audit-style timestamp update fails.
        // Don't fail the login if lastLogin update fails
        console.error("Failed to update lastLogin:", err);
      }
    }

    return result;
  }

  /**
   * Assign a system role to a user.
   * Stores the role ObjectId in the better-auth user's `roles` array field.
   */
  private async assignRoleToUser(userId: string, roleName: string): Promise<void> {
    // Resolves the role document first so the user record stores the role ObjectId, not the name.
    const roleId = await this.getRoleId(roleName);
    if (!roleId) return;

    await userPersistenceService.addRole(userId, roleId);
  }

  /**
   * Helper to retrieve Role ObjectId by name string
   */
  private async getRoleId(roleName: string): Promise<mongoose.Types.ObjectId | null> {
    // Looks up the persisted role id so higher-level flows can attach roles safely by name.
    const role = await Role.findOne({ name: roleName });
    if (!role) {
      console.error(`Role "${roleName}" not found. Did you run the seed script?`);
      return null;
    }
    return role._id;
  }
}

/**
 * Factory function — called after auth is initialized.
 */
export function createAuthService(auth: Auth): AuthService {
  return new AuthService(auth);
}
