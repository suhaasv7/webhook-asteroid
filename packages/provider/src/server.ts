// mock-payment-provider/src/server.ts
import express from 'express';
import cors from 'cors';
import { PaymentRequest } from './types';

const app = express();

app.use(cors());
app.use(express.json());

app.post('/process-payment', (req, res) => {
    const paymentRequest: PaymentRequest = req.body;
    
    // Simulate payment processing
    setTimeout(async () => {
        try {
            // Call the webhook URL with completed status
            await fetch(paymentRequest.webhookUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    paymentId: paymentRequest.paymentId,
                    status: 'completed'
                })
            });
        } catch (error) {
            console.error('Error calling webhook:', error);
        }
    }, 5000); // Wait 5 seconds

    res.json({ message: 'Payment processing started' });
});

const PORT = 3002;
app.listen(PORT, () => {
    console.log(`Payment provider running on port ${PORT}`);
});