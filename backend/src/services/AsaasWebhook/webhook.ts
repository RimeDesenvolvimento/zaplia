import express, { Request, Response } from "express";
import { handleActivePlan } from "../PaymentService/HandleActivePlan";
import User from "../../models/User";
import Invoices from "../../models/Invoices";

const router = express.Router();

router.post(
  "/webhook/asaas",
  express.json(),
  async (req: Request, res: Response) => {
    const payload = req.body;

    if (!payload?.event || !payload?.payment) {
      console.warn("🔕 Webhook inválido ou incompleto.");
      return res.status(200).send("Ignorado");
    }

    console.log("🔔 Evento recebido:", payload.event);

    const {
      id: providerSubscriptionId,
      value,
      externalReference,
      description
    } = payload.payment;

    const { event } = payload;

    try {
      if (
        event === "PAYMENT_RECEIVED" &&
        description === "Criação de pagamento de plano"
      ) {
        await handleActivePlan(
          providerSubscriptionId,
          externalReference,
          value
        );
      } else {
        console.log(
          "🔕 Evento não tratado ou descrição não confere:",
          event,
          description
        );
      }

      return res.status(200).send("Evento recebido com sucesso");
    } catch (error) {
      console.error("❌ Erro ao processar webhook:", error);
      return res.status(200).send("Erro interno");
    }
  }
);

export default router;
