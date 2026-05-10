import { Router } from "express";
import type { Auth } from "../config/auth.js";
import { createAuthMiddleware } from "../middlewares/authenticate.js";
import { requireAccountType } from "../middlewares/requireAccountType.js";
import { authorize } from "../middlewares/authorize.js";
import { validate } from "../middlewares/validate.js";
import { AccountType } from "../models/User.js";
import { transactionController } from "../controllers/transaction.controller.js";
import {
  transactionDepositSettlementSchema,
  transactionIdParamsSchema,
  transactionListQuerySchema,
  transactionSystemWalletRefundSchema,
} from "../validators/transaction.validator.js";

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

  router.get(
    "/admin/deposit-refunds",
    authenticate,
    requireAccountType(AccountType.ADMIN),
    authorize("read", "Transaction"),
    validate({ query: transactionListQuerySchema }),
    transactionController.listAdminDepositRefunds,
  );

  router.get(
    "/admin/:transactionId",
    authenticate,
    requireAccountType(AccountType.ADMIN),
    authorize("read", "Transaction"),
    validate({ params: transactionIdParamsSchema }),
    transactionController.getAdminTransactionDetail,
  );

  router.patch(
    "/admin/:transactionId/refund-to-system-wallet",
    authenticate,
    requireAccountType(AccountType.ADMIN),
    authorize("update", "Transaction"),
    validate({
      params: transactionIdParamsSchema,
      body: transactionSystemWalletRefundSchema,
    }),
    transactionController.refundEscrowToSystemWallet,
  );

  router.patch(
    "/admin/:transactionId/settle-deposit",
    authenticate,
    requireAccountType(AccountType.ADMIN),
    authorize("update", "Transaction"),
    validate({
      params: transactionIdParamsSchema,
      body: transactionDepositSettlementSchema,
    }),
    transactionController.settleHeldSecurityDeposit,
  );

  return router;
}

