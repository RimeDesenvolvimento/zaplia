import { Op } from "sequelize";
import Invoices from "../../models/Invoices";
import Plan from "../../models/Plan";
import Subscriptions from "../../models/Subscriptions";
import User from "../../models/User";
import { createCharge } from "../AsaasService/CreateCharge";
import { getPixCode } from "../AsaasService/GetPixCode";
import { Split } from "../AsaasService/interfaces";

class CreatePlanPaymentWithPix {
  constructor(private userId: number, private planId: number) {}

  async handle() {
    const user = await User.findByPk(this.userId);

    if (!user) {
      throw new Error("User not found");
    }

    const company = await user.$get("company");

    if (!company) {
      throw new Error("Company not found for user");
    }

    const partner = await company.$get("partner");

    let splits: Split[] = [];

    if (partner && partner.walletId) {
      splits = [
        {
          walletId: partner.walletId,
          percentualValue: partner.porcentagemComissao
        }
      ];
    }

    const plan = await Plan.findByPk(this.planId);

    const { id } = await createCharge({
      billingType: "PIX",
      customer: user.asaasId,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      value: plan.value,
      description: "Criação de pagamento de plano",
      externalReference: company.id.toString(),
      ...(splits.length > 0 && { splits: splits })
    }).catch(error => {
      console.error("[ERROR_CREATE_CHARGE]", error.response.data.errors);
      throw new Error("Error creating charge");
    });

    const { payload } = await getPixCode({ id }).catch(error => {
      console.error("[ERROR_CREATE_CHARGE]", error);
      throw new Error("Error creating charge");
    });

    if (!payload) {
      throw new Error("Pix code not found");
    }

    await Subscriptions.create({
      companyId: company.id,
      providerSubscriptionId: id,
      isActive: false,
      lastInvoiceUrl: null,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      lastPlanChange: new Date(),
      userPriceCents: plan.value * 100
    });

    const existingInvoice = await Invoices.findOne({
      where: {
        companyId: company.id,
        status: "open",
        providerInvoiceId: null
      },
      order: [["createdAt", "DESC"]]
    });

    if (existingInvoice) {
      console.log("🔄 Atualizando fatura existente ID:", existingInvoice.id);

      await existingInvoice.update({
        providerInvoiceId: id
      });
    } else {
      console.log(
        "🆕 Criando nova fatura (nenhuma invoice existente encontrada)"
      );
      await Invoices.create({
        companyId: company.id,
        providerInvoiceId: id,
        value: plan.value,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        status: "open",
        detail: `Assinatura do plano ${plan.name}`
      });
    }

    // void prismaInstance.payments_Logs
    //   .create({
    //     data: {
    //       id_from_asaas: id,
    //       user_id: this.userId,
    //       amount: this.amount,
    //       operation_type: "PIX",
    //       status: "PENDING",
    //       operation: "DEPOSIT",
    //       description: "Criação de serviço de limpeza",
    //     },
    //   })
    //   .catch((err) => {
    //     console.error("[ERROR_CREATE_LOG]", err);
    //   });

    // void prismaInstance.service
    //   .update({
    //     where: {
    //       id: this.serviceId,
    //     },
    //     data: {
    //       id_from_asaas: id,
    //     },
    //   })
    //   .catch((err) => {
    //     console.error("[ERROR_CREATE_LOG]", err);
    //   });

    console.log("data: ", {
      payload,
      idFromAsaas: id
    });

    return {
      payload,
      idFromAsaas: id
    };
  }
}

export default CreatePlanPaymentWithPix;
