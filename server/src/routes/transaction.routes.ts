import { Router } from "express";
import type { Auth } from "../config/auth.js";
import { createAuthMiddleware } from "../middlewares/authenticate.js";
import { requireAccountType } from "../middlewares/requireAccountType.js";
import { authorize } from "../middlewares/authorize.js";
import { validate } from "../middlewares/validate.js";
import { AccountType } from "../models/User.js";
import { transactionController } from "../controllers/transaction.controller.js";
import { transactionListQuerySchema } from "../validators/transaction.validator.js";

export function createTransactionRoutes(auth: Auth): Router {
  const router = Router();
  const authenticate = createAuthMiddleware(auth);

  router.get(
    "/admin",
    authenticate,
    requireAccountType(AccountType.ADMIN),
    authorize("read", "Transaction"),
    validate({ query: transactionListQuerySchema }),
    transactionController.listAdminTransactions,
  );

  return router;
}

