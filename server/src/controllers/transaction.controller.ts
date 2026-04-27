import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { transactionService } from "../services/transaction.service.js";
import type { TransactionListQueryInput } from "../validators/transaction.validator.js";

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
};

