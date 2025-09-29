import * as Yup from "yup";
import AppError from "../../errors/AppError";
import Company from "../../models/Company";
import User from "../../models/User";
import Setting from "../../models/Setting";
import Partner from "../../models/Partner";
import { hash } from "bcryptjs";
import { createCostumer } from "../AsaasService/CreateCustomer";

import { Transaction } from "sequelize";
import sequelize from "../../database";
interface CompanyData {
  name: string;
  phone?: string;
  email?: string;
  password?: string;
  status?: boolean;
  planId?: number;
  campaignsEnabled?: boolean;
  dueDate?: string;
  recurrence?: string;
  cpfCnpj?: string;
  partnerToken?: string;
}

const CreateCompanyService = async (
  companyData: CompanyData
): Promise<Company> => {
  const {
    name,
    phone,
    email,
    status,
    planId,
    campaignsEnabled,
    dueDate,
    recurrence,
    password,
    cpfCnpj,
    partnerToken
  } = companyData;

  const companySchema = Yup.object().shape({
    name: Yup.string()
      .min(2, "ERR_COMPANY_INVALID_NAME")
      .required("ERR_COMPANY_INVALID_NAME")
      .test(
        "Check-unique-name",
        "ERR_COMPANY_NAME_ALREADY_EXISTS",
        async value => {
          if (value) {
            const companyWithSameName = await Company.findOne({
              where: { name: value }
            });
            return !companyWithSameName;
          }
          return false;
        }
      )
  });

  try {
    await companySchema.validate({ name });
  } catch (err: any) {
    throw new AppError(err.message);
  }

  const transaction: Transaction = await sequelize.transaction();

  try {
    let partnerId = null;

    if (partnerToken) {
      const partner = await Partner.findOne({
        where: { urlParceiro: partnerToken },
        transaction
      });

      if (partner) {
        partnerId = partner.id;
      }
    }

    const company = await Company.create(
      {
        name,
        phone,
        email,
        status,
        planId,
        dueDate,
        recurrence,
        cpfCnpj,
        partnerId
      },
      { transaction }
    );

    let asaasId: string;
    try {
      const asaasResponse = await createCostumer({
        name: company.name,
        cpfCnpj: company.cpfCnpj
      });
      asaasId = asaasResponse.id;
    } catch (error) {
      console.error("Error creating customer in Asaas:", error);
      throw new AppError("ERR_ASAAS_CUSTOMER_CREATION_FAILED");
    }

    company.asaasId = asaasId;
    await company.save({ transaction });

    const passwordHash = await hash(password || "123456", 8);
    await User.create(
      {
        name: company.name,
        email: company.email,
        password: password,
        passwordHash,
        profile: "admin",
        companyId: company.id,
        asaasId
      },
      { transaction }
    );

    const settingsToCreate = [
      { key: "asaas", value: "" },
      { key: "tokenixc", value: "" },
      { key: "ipixc", value: "" },
      { key: "ipmkauth", value: "" },
      { key: "clientsecretmkauth", value: "" },
      { key: "clientidmkauth", value: "" },
      { key: "CheckMsgIsGroup", value: "" },
      { key: "call", value: "disabled" },
      { key: "scheduleType", value: "disabled" },
      { key: "sendGreetingAccepted", value: "disabled" },
      { key: "sendMsgTransfTicket", value: "disabled" },
      { key: "userRating", value: "disabled" },
      { key: "chatBotType", value: "text" },
      { key: "tokensgp", value: "" },
      { key: "ipsgp", value: "" },
      { key: "appsgp", value: "" }
    ];

    for (const setting of settingsToCreate) {
      await Setting.findOrCreate({
        where: {
          companyId: company.id,
          key: setting.key
        },
        defaults: {
          companyId: company.id,
          key: setting.key,
          value: setting.value
        },
        transaction
      });
    }

    if (companyData.campaignsEnabled !== undefined) {
      const [campaignSetting, created] = await Setting.findOrCreate({
        where: {
          companyId: company.id,
          key: "campaignsEnabled"
        },
        defaults: {
          companyId: company.id,
          key: "campaignsEnabled",
          value: `${campaignsEnabled}`
        },
        transaction
      });

      if (!created) {
        await campaignSetting.update(
          { value: `${campaignsEnabled}` },
          { transaction }
        );
      }
    }

    await transaction.commit();

    return company;
  } catch (error) {
    await transaction.rollback();

    console.error("Error in CreateCompanyService:", error);

    if (error instanceof AppError) {
      throw error;
    }

    // Caso contrário, lança um erro genérico
    throw new AppError("ERR_COMPANY_CREATION_FAILED");
  }
};

export default CreateCompanyService;
