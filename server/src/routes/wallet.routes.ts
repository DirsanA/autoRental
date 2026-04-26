import { Router } from "express";
import type { Auth } from "../config/auth.js";
import { createAuthMiddleware } from "../middlewares/authenticate.js";
import { requireAccountType } from "../middlewares/requireAccountType.js";
import { validate } from "../middlewares/validate.js";
import { AccountType } from "../models/User.js";
import { walletController } from "../controllers/wallet.controller.js";
import { payoutRequestSchema } from "../validators/wallet.validator.js";

export function createWalletRoutes(auth: Auth): Router {
  const router = Router();
  const authenticate = createAuthMiddleware(auth);

  router.get(
    "/me",
    authenticate,
    requireAccountType(AccountType.USER, AccountType.COMPANY),
    walletController.getMyWallet,
  );

  router.get(
    "/transactions",
    authenticate,
    requireAccountType(AccountType.USER, AccountType.COMPANY),
    walletController.listMyWalletTransactions,
  );

  router.post(
    "/payout-request",
    authenticate,
    requireAccountType(AccountType.USER, AccountType.COMPANY),
    validate({ body: payoutRequestSchema }),
    walletController.requestPayout,
  );

  return router;
}

