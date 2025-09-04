import Company from "../../models/Company";
import Invoices from "../../models/Invoices";
import Subscriptions from "../../models/Subscriptions";

export async function handleActivePlan(
  providerSubscriptionId: string,
  companyExternalReference: string,
  value: number
) {
  const companyId = parseInt(companyExternalReference, 10);

  if (isNaN(companyId)) {
    console.warn("❗ Referência externa inválida:", companyExternalReference);
    return;
  }

  const subscription = await Subscriptions.findOne({
    where: { providerSubscriptionId }
  });

  if (!subscription) {
    console.warn(
      "❗ Subscription não encontrada para o pagamento:",
      providerSubscriptionId
    );
    return;
  }

  const company = await Company.findByPk(subscription.companyId || companyId);

  if (!company) {
    console.warn("❗ Empresa não encontrada para o plano pago");
    return;
  }

  const invoice = await Invoices.findOne({
    where: { providerInvoiceId: providerSubscriptionId }
  });

  if (invoice) {
    invoice.status = "PAID";
    await invoice.save();
  } else {
    console.warn(
      "⚠️ Nenhuma fatura encontrada com o ID do Asaas:",
      providerSubscriptionId
    );

    // Fallback: pegar a última invoice "open" sem providerInvoiceId
    const fallbackInvoice = await Invoices.findOne({
      where: {
        companyId: company.id,
        status: "open",
        providerInvoiceId: null
      },
      order: [["createdAt", "DESC"]]
    });

    if (fallbackInvoice) {
      fallbackInvoice.status = "PAID";
      fallbackInvoice.providerInvoiceId = providerSubscriptionId;
      fallbackInvoice.value = value;
      await fallbackInvoice.save();

      console.log("✅ Fatura fallback atualizada com sucesso.");
    } else {
      console.warn("🚫 Nenhuma fatura fallback encontrada.");
    }
  }

  // Ativa a assinatura
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 dias

  subscription.isActive = true;
  subscription.expiresAt = expiresAt;
  await subscription.save();

  company.status = true;
  company.dueDate = expiresAt.toISOString();
  await company.save();

  const baseDueDate = invoice && invoice.dueDate ? new Date(invoice.dueDate) : new Date();
  const nextDueDate = new Date(baseDueDate.getTime() + 30 * 24 * 60 * 60 * 1000);

  await Invoices.create({
    companyId: company.id,
    providerInvoiceId: null, 
    value,
    dueDate: nextDueDate.toISOString(),
    status: "open",
    detail: "Renovação do plano"
  });

  console.log("✅ Plano ativado com sucesso para a empresa:", company.name);
}
