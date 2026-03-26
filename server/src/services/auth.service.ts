import mongoose from "mongoose";
import type { Auth } from "../config/auth.js";
import { AccountType, User } from "../models/User.js";
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
import { companyService } from "./company.service.js";

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

    await userPersistenceService.updateAccountType(
      result.user.id,
      AccountType.USER,
    );

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
    await this.assertCompanyRegistrationAvailability(data);

    let userId: string | null = null;

    // Creates the independent auth account first so the company can sign into its own portal.
    const result = await this.auth.api.signUpEmail({
      headers,
      body: {
        email: data.email,
        password: data.password,
        name: data.companyName,
        callbackURL: `${ENV.FRONTEND_URL}/company/verify-email`,
      },
    });

    userId = result.user.id;

    try {
      await userPersistenceService.updateAccountType(
        userId,
        AccountType.COMPANY,
      );
      await this.assignRoleToUser(userId, SYSTEM_ROLES.COMPANY);

      const company = await companyService.create(userId, {
        name: data.companyName,
        tinNumber: data.tinNumber,
        website: data.website,
        bio: data.bio,
        licenseDocumentUrl: data.licenseDocumentUrl,
        contactInfo: {
          email: data.companyEmail,
          phoneNumber: data.companyPhone,
          address: data.companyAddress,
        },
        location: data.location,
        socialLinks: data.socialLinks,
      });

      return {
        ...result,
        user: {
          ...result.user,
          accountType: AccountType.COMPANY,
        },
        company,
      };
    } catch (error) {
      // Rolls back auth-side artifacts when the domain-specific company setup fails partway through.
      if (userId) {
        await userPersistenceService.cleanupAuthArtifacts(userId, data.email);
      }
      throw error;
    }
  }

  private async assertCompanyRegistrationAvailability(
    data: RegisterCompanyInput,
  ): Promise<void> {
    const accountEmail = data.email.trim().toLowerCase();
    const companyEmail = data.companyEmail.trim().toLowerCase();

    const [
      existingAuthAccountForLoginEmail,
      existingAuthAccountForCompanyEmail,
      existingCompanyByLoginEmail,
      existingCompanyByCompanyEmail,
      existingCompanyByTin,
      existingCompanyByPhone,
    ] = await Promise.all([
      userPersistenceService.findByEmail(accountEmail),
      accountEmail === companyEmail
        ? Promise.resolve(null)
        : userPersistenceService.findByEmail(companyEmail),
      Company.findOne({ "contactInfo.email": accountEmail }).lean(),
      Company.findOne({ "contactInfo.email": companyEmail }).lean(),
      Company.findOne({ tinNumber: data.tinNumber }).lean(),
      Company.findOne({ "contactInfo.phoneNumber": data.companyPhone }).lean(),
    ]);

    if (existingAuthAccountForLoginEmail) {
      throw ApiError.conflict(
        "An account with this login email already exists",
      );
    }

    if (existingCompanyByLoginEmail) {
      throw ApiError.conflict(
        "This login email is already used as another company's contact email",
      );
    }

    if (existingAuthAccountForCompanyEmail) {
      throw ApiError.conflict(
        "This company contact email is already used by another account",
      );
    }

    if (existingCompanyByCompanyEmail) {
      throw ApiError.conflict(
        "A company with this contact email already exists",
      );
    }

    if (existingCompanyByTin) {
      throw ApiError.conflict("A company with this TIN number already exists");
    }

    if (existingCompanyByPhone) {
      throw ApiError.conflict(
        "A company with this contact phone number already exists",
      );
    }
  }

  /**
   * Login with email and password.
   * Delegates to better-auth sign-in and updates lastLogin timestamp.
   */
  async login(
    email: string,
    password: string,
    headers: Headers,
    expectedAccountType: AccountType,
  ) {
    await this.assertLoginPortal(email, expectedAccountType);

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

  private async assertLoginPortal(
    email: string,
    expectedAccountType: AccountType,
  ): Promise<void> {
    const account = await User.findOne({ email }).select("accountType").lean();

    if (!account || account.accountType !== expectedAccountType) {
      throw ApiError.unauthorized("Invalid credentials for this portal");
    }
  }

  /**
   * Assign a system role to a user.
   * Stores the role ObjectId in the better-auth user's `roles` array field.
   */
  private async assignRoleToUser(
    userId: string,
    roleName: string,
  ): Promise<void> {
    // Resolves the role document first so the user record stores the role ObjectId, not the name.
    const roleId = await this.getRoleId(roleName);
    if (!roleId) return;

    await userPersistenceService.addRole(userId, roleId);
  }

  /**
   * Helper to retrieve Role ObjectId by name string
   */
  private async getRoleId(
    roleName: string,
  ): Promise<mongoose.Types.ObjectId | null> {
    // Looks up the persisted role id so higher-level flows can attach roles safely by name.
    const role = await Role.findOne({ name: roleName });
    if (!role) {
      console.error(
        `Role "${roleName}" not found. Did you run the seed script?`,
      );
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
