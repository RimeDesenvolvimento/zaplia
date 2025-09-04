export interface CreditCard {
  holderName: string;
  number: string;
  expiryMonth: string;
  expiryYear: string;
  ccv: string;
}

export interface CreditCardHolderInfo {
  name: string;
  email: string;
  cpfCnpj: string;
  postalCode: string;
  addressNumber: string;
  addressComplement?: string;
  phone?: string;
  mobilePhone?: string;
}

export interface Discount {
  value: number;
  dueDateLimitDays: number;
  type?: 'PERCENTAGE' | 'FIXED';
}

export interface Fine {
  value: number;
  type?: 'PERCENTAGE' | 'FIXED';
}

export interface Interest {
  value: number;
  type?: 'PERCENTAGE' | 'FIXED';
}

export interface Split {
  walletId: string;
  fixedValue?: number;
  percentualValue?: number;
  status?: 'PENDING' | 'RECEIVED' | 'CANCELLED';
  refusalReason?: string;
  externalReference?: string;
  description?: string;
}
