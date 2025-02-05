// mock-payment-provider/src/types.ts
export interface PaymentRequest {
    paymentId: string;
    amount: number;
    currency: string;
    webhookUrl: string;
}