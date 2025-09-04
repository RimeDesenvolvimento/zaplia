import { AsaasApiInstance } from "./CreateCustomer";


export type PixRequest = {
  id: string;
};

export type PixResponse = {
  success: boolean;
  encodedImage: string;
  payload: string;
  expirationDate: string;
};

export async function getPixCode({id}: PixRequest): Promise<PixResponse> {
  const res = await AsaasApiInstance.get(`/payments/${id}/pixQrCode`);

  return res.data;
}
