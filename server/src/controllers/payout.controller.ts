import type { Request, Response } from "express";
import { payoutService } from "../services/payout.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { requireRequestUser } from "../utils/requestContext.js";
import type {
  CreatePayoutInput,
  PayoutDecisionInput,
  PayoutListQueryInput,
} from "../validators/payout.validator.js";

export const payoutController = {
  createPayout: asyncHandler(async (req: Request, res: Response) => {
    const caller = requireRequestUser(req, "Please sign in to request payouts");
    const authUserId =
      typeof (caller as any).authUserId === "string"
        ? String((caller as any).authUserId)
        : String(caller.id);
    const data = await payoutService.createPayoutRequest(
      authUserId,
      req.body as CreatePayoutInput,
    );

    res.status(201).json({ success: true, data });
  }),

  listMyPayouts: asyncHandler(async (req: Request, res: Response) => {
    const caller = requireRequestUser(req, "Please sign in to view payouts");
    const authUserId =
      typeof (caller as any).authUserId === "string"
        ? String((caller as any).authUserId)
        : String(caller.id);
    const data = await payoutService.listMyPayouts(
      authUserId,
      req.query as unknown as PayoutListQueryInput,
    );
    res.json({ success: true, data });
  }),

  listAdminPayouts: asyncHandler(async (req: Request, res: Response) => {
    const data = await payoutService.listAdminPayouts(
      req.query as PayoutListQueryInput,
    );
    res.json({ success: true, data });
  }),

  decidePayout: asyncHandler(async (req: Request, res: Response) => {
    const data = await payoutService.decidePayout(
      String(req.params.payoutId),
      req.body as PayoutDecisionInput,
    );
    res.json({ success: true, data });
  }),
};
