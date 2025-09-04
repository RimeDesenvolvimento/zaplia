
import { AsaasApiInstance } from "./CreateCustomer";
import { CreditCard, CreditCardHolderInfo, Discount, Fine, Interest, Split } from "./interfaces";

interface CreatePaymentRequest {
  customer: string; 
  billingType: 'BOLETO' | 'CREDIT_CARD' | 'PIX' | 'UNDEFINED';
  value?: number; 
  dueDate: string; 
  description?: string;
  externalReference?: string;
  installmentCount?: number; 
  installmentValue?: number;
  totalValue?: number; 
  discount?: Discount;
  fine?: Fine;
  interest?: Interest;
  creditCard?: CreditCard;
  creditCardHolderInfo?: CreditCardHolderInfo;
  creditCardToken?: string;
  remoteIp?: string;
  authorizeOnly?: boolean; 
  postalService?: boolean;
  callback?: string;
  split?: Split[];
}

interface PaymentResponse {
  object: "payment";
  id: string;
  dateCreated: string; // formato: YYYY-MM-DD
  customer: string;
  checkoutSession: string | null;
  paymentLink: string | null;
  value: number;
  netValue: number;
  originalValue: number | null;
  interestValue: number | null;
  description: string | null;
  billingType: "BOLETO" | "CREDIT_CARD" | "PIX" | "UNDEFINED";
  pixTransaction: string | null;
  status: "PENDING" | "RECEIVED" | "CONFIRMED" | "OVERDUE" | "REFUNDED" | "RECEIVED_IN_CASH" | "CHARGED_BACK" | "FAILED";
  dueDate: string;
  originalDueDate: string;
  paymentDate: string | null;
  clientPaymentDate: string | null;
  installmentNumber: number | null;
  invoiceUrl: string;
  invoiceNumber: string;
  externalReference: string | null;
  deleted: boolean;
  anticipated: boolean;
  anticipable: boolean;
  creditDate: string | null;
  estimatedCreditDate: string | null;
  transactionReceiptUrl: string | null;
  nossoNumero: string | null;
  bankSlipUrl: string | null;
  lastInvoiceViewedDate: string | null;
  lastBankSlipViewedDate: string | null;
  discount: {
    value: number;
    limitDate: string | null;
    dueDateLimitDays: number;
    type: "FIXED" | "PERCENTAGE";
  };
  fine: {
    value: number;
    type: "FIXED" | "PERCENTAGE";
  };
  interest: {
    value: number;
    type: "FIXED" | "PERCENTAGE";
  };
  postalService: boolean;
  custody: string | null;
  escrow: string | null;
  refunds: unknown | null;
}


export async function createCharge(data: CreatePaymentRequest): Promise<PaymentResponse> {
  const res = await AsaasApiInstance.post("/payments", 
    JSON.stringify(data),
  );

  return res.data;
}

