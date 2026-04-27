import type { Request, Response, NextFunction } from "express";
import { fromNodeHeaders } from "better-auth/node";
import type { Auth } from "../config/auth.js";
import mongoose from "mongoose";
import { ObjectId } from "mongodb";
import { getMongoClient } from "../config/database.js";
import { userPersistenceService } from "../services/user.persistence.service.js";
import {
  getBearerToken,
  setRequestAuth,
  type RequestUser,
} from "../utils/requestContext.js";

type TokenSession = {
  userId?: string;
} & Record<string, unknown>;

/**
 * Sends the shared unauthorized response payload.
 */
function sendUnauthorized(res: Response, message: string): void {
  res.status(401).json({
    success: false,
    error: {
      code: "UNAUTHORIZED",
      message,
    },
  });
}

/**
 * Resolves a persisted session directly from a bearer token.
 */
async function findSessionByToken(token: string): Promise<TokenSession | null> {
  const db = getMongoClient().db();
  const sessionCollection = db.collection("session");
  const filters: Array<Record<string, unknown>> = [
    { token },
    { sessionToken: token },
    { id: token },
    { _id: token },
  ];

  if (mongoose.Types.ObjectId.isValid(token)) {
    filters.push({ _id: new ObjectId(token) });
  }

  return sessionCollection.findOne({
    $or: filters,
  }) as Promise<TokenSession | null>;
}

/**
 * Creates an authentication middleware that resolves better-auth sessions.
 */
export function createAuthMiddleware(auth: Auth) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log("[Auth Middleware] Request path:", req.path);
      console.log("[Auth Middleware] Cookie header:", req.headers.cookie);
      console.log(
        "[Auth Middleware] Authorization header:",
        req.headers.authorization,
      );

      const session = await auth.api.getSession({
        headers: fromNodeHeaders(req.headers),
      });

      console.log(
        "[Auth Middleware] Session from better-auth:",
        session ? "found" : "not found",
      );

      if (session) {
        console.log("[Auth Middleware] Session user ID:", session.user.id);
        const user = await userPersistenceService.findByAuthId(session.user.id);
        console.log(
          "[Auth Middleware] User from DB:",
          user ? "found" : "not found",
        );
        if (user) {
          setRequestAuth(
            req,
            {
              ...(user.toJSON() as unknown as RequestUser),
              authUserId: session.user.id,
            },
            session.session,
          );
          next();
          return;
        }
      }

      const token = getBearerToken(req);
      const tokenSession = token ? await findSessionByToken(token) : null;
      const userId = tokenSession?.userId;

      if (!userId) {
        sendUnauthorized(res, "Authentication required");
        return;
      }

      const user = await userPersistenceService.findByAuthId(userId);
      if (!user) {
        sendUnauthorized(res, "Authentication required");
        return;
      }

      setRequestAuth(
        req,
        {
          ...(user.toJSON() as unknown as RequestUser),
          authUserId: userId,
        },
        tokenSession,
      );
      next();
    } catch {
      sendUnauthorized(res, "Invalid or expired session");
    }
  };
}
