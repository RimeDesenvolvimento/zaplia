import Company from "../../models/Company";
import User from "../../models/User";

export const CheckCompanyIsOverdueService = async (
  companyId: number
): Promise<boolean> => {
  if (!companyId || isNaN(companyId)) {
    throw new Error("ERR_INVALID_COMPANY_ID");
  }
  const company = await Company.findByPk(companyId);
  if (!company) {
    throw new Error("ERR_USER_NOT_FOUND");
  }

  if (!company) {
    throw new Error("ERR_COMPANY_NOT_FOUND");
  }

  const today = new Date();
  if (company.dueDate && new Date(company.dueDate) < today) {
    return true;
  }
  return false;
};
