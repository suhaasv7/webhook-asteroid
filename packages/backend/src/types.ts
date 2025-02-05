// payment-backend/src/types.ts
export interface PaymentData {
    amount: number;
    currency: string;
}

export interface Payment {
    paymentId: string;
    data: PaymentData;
    status: 'processing' | 'completed' | 'failed';
}