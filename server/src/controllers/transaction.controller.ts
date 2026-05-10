import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { transactionService } from "../services/transaction.service.js";
import { requireRequestUser } from "../utils/requestContext.js";
import type { TransactionListQueryInput } from "../validators/transaction.validator.js";
import type { TransactionSystemWalletRefundInput } from "../validators/transaction.validator.js";

export const transactionController = {
  /**
   * GET /api/transactions/admin
   */
  listAdminTransactions: asyncHandler(async (req: Request, res: Response) => {
    const data = await transactionService.listAdminTransactions(
      req.query as unknown as TransactionListQueryInput,
    );
    res.json({ success: true, data });
  }),

  getAdminTransactionDetail: asyncHandler(async (req: Request, res: Response) => {
    const data = await transactionService.getAdminTransactionDetail(
      String(req.params.transactionId),
    );
    res.json({ success: true, data });
  }),

  refundEscrowToSystemWallet: asyncHandler(async (req: Request, res: Response) => {
    const caller = requireRequestUser(req, "Please sign in as admin");
    const data = await transactionService.refundEscrowToSystemWallet(
      String(req.params.transactionId),
      {
        reason: typeof req.body?.reason === "string" ? req.body.reason : undefined,
        initiatedBy: String(caller.id),
      } satisfies TransactionSystemWalletRefundInput & { initiatedBy?: string },
    );
    res.json({ success: true, data });
  }),
};

