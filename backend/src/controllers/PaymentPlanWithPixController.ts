import { Request, Response } from "express";
import CreatePlanPaymentWithPix from "../services/PaymentService/CreatePlanPaymentWithPix";

export const createPixPaymentController = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { planId, userId } = req.body;

    if (!planId || !userId) {
      return res.status(400).json({ error: "Plan ID is required." });
    }

    const service = new CreatePlanPaymentWithPix(userId, planId);
    const result = await service.handle();

    return res.status(200).json(result);
  } catch (error: any) {
    console.error("[CREATE_PIX_PAYMENT_ERROR]", error.message);
    return res
      .status(500)
      .json({ error: error.message || "Internal server error" });
  }
};
