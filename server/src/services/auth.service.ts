import mongoose from "mongoose";
import type { Auth } from "../config/auth.js";
import { AccountType, User } from "../models/User.js";
import { Role } from "../models/Role.js";
import { SYSTEM_ROLES } from "../config/constants.js";
import { ENV } from "../config/env.js";
import { ApiError } from "../utils/ApiError.js";
import type {
  RegisterCompanyInput,
  RegisterUserInput,
} from "../validators/auth.validator.js";
import { userPersistenceService } from "./user.persistence.service.js";
import { companyService } from "./company.service.js";

type AuthResponse<T> = {
  body: T;
  cookieSource?: unknown;
};

/**
 * Auth service business logic for registration, session flows, and portal login.
 */
export class AuthService {
  constructor(private readonly auth: Auth) {}

  /**
   * Normalizes emails before uniqueness or portal checks.
   */
  private normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  /**
   * Resolves a role name into its Mongo id.
   */
  private async getRoleId(
    roleName: string,
  ): Promise<mongoose.Types.ObjectId | null> {
    const role = await Role.findOne({ name: roleName }).select("_id").lean();
    if (!role) {
      console.error(`Role "${roleName}" not found. Did you run the seed script?`);
      return null;
    }

    return role._id;
  }

  /**
   * Assigns a system role to a user by role name.
   */
  private async assignRoleToUser(
    authUserId: string,
    roleName: string,
  ): Promise<void> {
    const roleId = await this.getRoleId(roleName);
    if (!roleId) return;

    await userPersistenceService.addRole(authUserId, roleId);
  }

  /**
   * Rejects registration when the user login email already exists.
   */
  private async assertUserRegistrationAvailability(email: string): Promise<void> {
    const existingUser = await userPersistenceService.findByEmail(
      this.normalizeEmail(email),
    );

    if (existingUser) {
      throw ApiError.conflict("User already exists");
    }
  }

  /**
   * Rejects company registration when any linked identity is already in use.
   */
  private async assertCompanyRegistrationAvailability(
    data: RegisterCompanyInput,
  ): Promise<void> {
    const accountEmail = this.normalizeEmail(data.email);
    const companyEmail = this.normalizeEmail(data.companyEmail);

    const [existingAuthAccountForLoginEmail, existingAuthAccountForCompanyEmail] =
      await Promise.all([
        userPersistenceService.findByEmail(accountEmail),
        accountEmail === companyEmail
          ? Promise.resolve(null)
          : userPersistenceService.findByEmail(companyEmail),
      ]);

    if (existingAuthAccountForLoginEmail) {
      throw ApiError.conflict(
        "An account with this login email already exists",
      );
    }

    if (existingAuthAccountForCompanyEmail) {
      throw ApiError.conflict(
        "This company contact email is already used by another account",
      );
    }

    await companyService.assertRegistrationAvailability({
      loginEmail: accountEmail,
      contactEmail: companyEmail,
      tinNumber: data.tinNumber,
      phoneNumber: data.companyPhone,
    });
  }

  /**
   * Ensures the caller is logging into the correct account portal.
   */
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
   * Registers a base user account.
   */
  async registerUser(
    data: RegisterUserInput,
    headers: Headers,
  ): Promise<
    AuthResponse<{
      user: unknown;
      message: string;
    }>
  > {
    await this.assertUserRegistrationAvailability(data.email);

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

    return {
      cookieSource: result,
      body: {
        user: result.user,
        message:
          "Account created successfully. Please check your email to verify your account.",
      },
    };
  }

  /**
   * Registers a company account and creates its company profile.
   */
  async registerCompany(
    data: RegisterCompanyInput,
    headers: Headers,
  ): Promise<
    AuthResponse<{
      user: unknown;
      company: unknown;
      message: string;
    }>
  > {
    await this.assertCompanyRegistrationAvailability(data);

    let userId: string | null = null;

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
        cookieSource: result,
        body: {
          user: {
            ...result.user,
            accountType: AccountType.COMPANY,
          },
          company,
          message:
            "Company account registered successfully. Your company is pending admin approval. Please verify your email.",
        },
      };
    } catch (error) {
      if (userId) {
        await userPersistenceService.cleanupAuthArtifacts(userId, data.email);
      }
      throw error;
    }
  }

  /**
   * Logs a user into the expected account portal.
   */
  async login(
    email: string,
    password: string,
    headers: Headers,
    expectedAccountType: AccountType,
  ): Promise<
    AuthResponse<{
      user: unknown;
      token: unknown;
      message: string;
    }>
  > {
    const normalizedEmail = this.normalizeEmail(email);
    await this.assertLoginPortal(normalizedEmail, expectedAccountType);

    const result = await this.auth.api.signInEmail({
      headers,
      body: { email: normalizedEmail, password },
    });

    if (result.user) {
      try {
        await userPersistenceService.markLastLogin(result.user.id);
      } catch (err) {
        console.error("Failed to update lastLogin:", err);
      }
    }

    return {
      cookieSource: result,
      body: {
        user: result.user,
        token: result.token,
        message: "Login successful",
      },
    };
  }

  /**
   * Invalidates the current session.
   */
  async logout(
    headers: Headers,
  ): Promise<AuthResponse<{ message: string }>> {
    const result = await this.auth.api.signOut({ headers });

    return {
      cookieSource: result,
      body: { message: "Logged out successfully" },
    };
  }

  /**
   * Returns the current session payload expected by the frontend.
   */
  async getSession(headers: Headers): Promise<{
    user: unknown;
    session: unknown;
    company: unknown;
  }> {
    const session = await this.auth.api.getSession({ headers });
    if (!session) {
      throw ApiError.unauthorized("No active session");
    }

    const company =
      session.user.accountType === AccountType.COMPANY
        ? await companyService.getByAuthUserId(session.user.id)
        : null;

    return {
      user: session.user,
      session: session.session,
      company,
    };
  }

  /**
   * Requests a password reset email without leaking account existence.
   */
  async requestPasswordReset(
    email: string,
    headers: Headers,
  ): Promise<{ message: string }> {
    await this.auth.api.requestPasswordReset({
      headers,
      body: {
        email,
        redirectTo: `${ENV.FRONTEND_URL}/reset-password`,
      },
    });

    return {
      message:
        "If an account with that email exists, a password reset link has been sent.",
    };
  }

  /**
   * Resets a password using a reset token.
   */
  async resetPassword(
    token: string,
    newPassword: string,
    headers: Headers,
  ): Promise<{ message: string }> {
    await this.auth.api.resetPassword({
      headers,
      body: { token, newPassword },
    });

    return {
      message:
        "Password reset successfully. You can now log in with your new password.",
    };
  }
}

/**
 * Factory function called after auth is initialized.
 */
export function createAuthService(auth: Auth): AuthService {
  return new AuthService(auth);
}
