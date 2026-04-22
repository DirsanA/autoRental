import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { getMongoClient } from "./database.js";
import { ENV } from "./env.js";
import { emailService } from "../services/email.service.js";
import { userPersistenceService } from "../services/user.persistence.service.js";

/**
 * better-auth instance configured for MongoDB via Mongoose's underlying client.
 *
 * IMPORTANT: This must be initialized AFTER `connectDatabase()` has resolved,
 * because `getMongoClient()` relies on the active Mongoose connection.
 */
export function createAuth() {
  const client = getMongoClient();
  // Uses the active Mongo connection so better-auth and Mongoose share the same database.
  const db = client.db();

  const auth = betterAuth({
    basePath: "/api/auth",
    secret: ENV.BETTER_AUTH_SECRET,
    baseURL: ENV.BETTER_AUTH_URL,

    database: mongodbAdapter(db),

    emailAndPassword: {
      enabled: true,
      autoSignIn: true,
      minPasswordLength: 8,
      // Requires email verification before the account is treated as fully usable.
      requireEmailVerification: true, // Set to true in production once SMTP is configured
      sendResetPassword: async ({ user, url }: { user: any; url: string }) => {
        await emailService.sendPasswordResetEmail(user.email, url);
      },
    },

    emailVerification: {
      autoSignInAfterVerification: true,
      sendVerificationEmail: async ({
        user,
        url,
      }: {
        user: any;
        url: string;
      }) => {
        await emailService.sendVerificationEmail(user.email, url);
      },
    },

    /**
     * Database hooks allow us to react to user lifecycle events.
     * Status transitions: PENDING -> ACTIVE when emailVerified.
     */
    databaseHooks: {
      user: {
        update: {
          // Promotes pending users once better-auth marks their email as verified.
          after: async (user: any) => {
            if (user.emailVerified && user.status === "PENDING") {
              await userPersistenceService.activateIfPending(user.id);
            }
          },
        },
      },
    },

    /**
     * Extend the core `user` table with our domain-specific fields.
     * better-auth's core user has: id, name, email, emailVerified, image, createdAt, updatedAt
     * We add our custom fields on top of that.
     */
    user: {
      // Extends better-auth's core user record with domain fields used across the platform.
      additionalFields: {
        accountType: {
          type: "string",
          required: false,
          defaultValue: "USER",
          input: false,
        },
        firstName: {
          type: "string",
          required: false,
        },
        lastName: {
          type: "string",
          required: false,
        },
        phoneNumber: {
          type: "string",
          required: false,
        },
        roles: {
          type: "string[]",
          required: false,
          defaultValue: [],
          input: false, // Not settable by clients directly
        },
        verificationLevel: {
          type: "string",
          required: false,
          defaultValue: "NONE",
          input: false,
        },
        status: {
          type: "string",
          required: false,
          defaultValue: "PENDING",
          input: false,
        },
        walletBalance: {
          type: "number",
          required: false,
          defaultValue: 0,
          input: false,
        },
        lastLogin: {
          type: "string",
          required: false,
          input: false,
        },
      },
    },

    trustedOrigins: [ENV.FRONTEND_URL],
  });

  return auth;
}

export type Auth = ReturnType<typeof createAuth>;
