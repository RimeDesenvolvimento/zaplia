import * as Yup from "yup";
import { Op } from "sequelize";

import Plan from "../../models/Plan";
import Company from "../../models/Company";
import AppError from "../../errors/AppError";
import Setting from "../../models/Setting";
import Invoices from "../../models/Invoices";
import sequelize from "../../database";

interface PlanData {
  newPlanId: number;
  recurrence?: string;
  dueDate?: string;
  campaignsEnabled?: boolean;
}

export const UpdateCompanyPlanService = async (
  companyId: number,
  planData: PlanData
): Promise<Company> => {
  const { newPlanId, recurrence, dueDate, campaignsEnabled } = planData;

  const planSchema = Yup.object().shape({
    newPlanId: Yup.number()
      .required("ERR_PLAN_ID_REQUIRED")
      .test("Check-plan-exists", "ERR_PLAN_NOT_FOUND", async value => {
        const plan = await Plan.findByPk(value);
        return !!plan;
      })
      .test("Check-different-plan", "ERR_SAME_PLAN", async value => {
        const company = await Company.findByPk(companyId);
        return company && value !== company.planId;
      })
  });

  try {
    await planSchema.validate({ newPlanId });
  } catch (err: any) {
    throw new AppError(err.message);
  }

  const transaction = await sequelize.transaction();

  try {
    const company = await Company.findByPk(companyId, { transaction });
    if (!company) {
      throw new AppError("ERR_COMPANY_NOT_FOUND");
    }

    if (!company.asaasId) {
      throw new AppError("ERR_NO_ASAAS_ID");
    }

    const newPlan = await Plan.findByPk(newPlanId, { transaction });
    if (!newPlan) {
      throw new AppError("ERR_PLAN_NOT_FOUND");
    }

    await company.update(
      {
        planId: newPlanId,
        recurrence: "MENSAL",
        dueDate: new Date().toISOString()
      },
      { transaction }
    );

    await Invoices.destroy({
      where: {
        companyId: company.id,
        value: 0
      },
      transaction
    });

    // if (campaignsEnabled !== undefined) {
    //   const [setting, created] = await Setting.findOrCreate({
    //     where: {
    //       companyId: company.id,
    //       key: "campaignsEnabled"
    //     },
    //     defaults: {
    //       companyId: company.id,
    //       key: "campaignsEnabled",
    //       value: `${campaignsEnabled}`
    //     },
    //     transaction
    //   });

    //   if (!created) {
    //     await setting.update({ value: `${campaignsEnabled}` }, { transaction });
    //   }
    // }

    await transaction.commit();
    return company;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};
