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
      const session = await auth.api.getSession({
        headers: fromNodeHeaders(req.headers),
      });

      if (session) {
        const user = await userPersistenceService.findByAuthId(session.user.id);
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

      sendUnauthorized(res, "Authentication required");
    } catch (error) {
      console.error("Auth middleware error:", error);
      sendUnauthorized(res, "Invalid or expired session");
    }
  };
}
