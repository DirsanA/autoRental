import { Router } from "express";
import type { Auth } from "../config/auth.js";
import { walletController } from "../controllers/wallet.controller.js";
import { createAuthMiddleware } from "../middlewares/authenticate.js";
import { authorize } from "../middlewares/authorize.js";
import { requireAccountType } from "../middlewares/requireAccountType.js";
import { AccountType } from "../models/User.js";

export function createWalletRoutes(auth: Auth): Router {
  const router = Router();
  const authenticate = createAuthMiddleware(auth);

  router.use(authenticate);
  router.use(
    requireAccountType(
      AccountType.USER,
      AccountType.COMPANY,
      AccountType.ADMIN,
    ),
  );

  router.get(
    "/me",
    authorize("read", "Transaction"),
    walletController.getMyWallet,
  );
  router.get(
    "/me/ledger",
    authorize("read", "Transaction"),
    walletController.getMyWalletLedger,
  );

  return router;
}
