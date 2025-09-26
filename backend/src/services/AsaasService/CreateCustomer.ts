import axios from "axios";

export const AsaasApiInstance = axios.create({
  baseURL: process.env.ASAAS_BASE_URL
});
AsaasApiInstance.defaults.headers.common["access_token"] =
  process.env.ASAAS_API_KEY;
AsaasApiInstance.defaults.headers.common["User-Agent"] = "zaplia/1.0";
AsaasApiInstance.defaults.headers.common["Content-Type"] = "application/json";

export type CustomerRequest = {
  name: string;
  cpfCnpj: string;
  email?: string;
  phone?: string;
  mobilePhone?: string;
  address?: string;
  addressNumber?: string;
  complement?: string;
  province?: string;
  postalCode?: string;
  externalReference?: string;
  notificationDisabled?: boolean;
  additionalEmails?: string;
  municipalInscription?: string;
  stateInscription?: string;
  observations?: string;
  groupName?: string;
  company?: string;
  foreignCustomer?: boolean;
};

export type CustomerResponse = {
  object: string;
  id: string;
  dateCreated: string;
  name: string;
  email: string | null;
  company: string | null;
  phone: string | null;
  mobilePhone: string | null;
  address: string | null;
  addressNumber: string | null;
  complement: string | null;
  province: string | null;
  postalCode: string | null;
  cpfCnpj: string;
  personType: "FISICA" | "JURIDICA";
  deleted: boolean;
  additionalEmails: string | null;
  externalReference: string | null;
  notificationDisabled: boolean;
  observations: string | null;
  municipalInscription: string | null;
  stateInscription: string | null;
  canDelete: boolean;
  cannotBeDeletedReason: string | null;
  canEdit: boolean;
  cannotEditReason: string | null;
  city: string | null;
  cityName: string | null;
  state: string | null;
  country: string;
};

export async function createCostumer(
  data: CustomerRequest
): Promise<CustomerResponse> {
  const res = await AsaasApiInstance.post("/customers", JSON.stringify(data));

  return res.data;
}
