import express from 'express';
import cors from 'cors';
import { PaymentRequest } from './types';
import dotenv from 'dotenv';
dotenv.config();

const PORT = process.env.PORT;


const app = express();

app.use(cors());
app.use(express.json());

app.post('/process-payment', (req, res) => {
    const paymentRequest: PaymentRequest = req.body;
    
    // Simulate payment processing
    setTimeout(async () => {
        try {
            // Call the webhook URL with completed status
            await fetch(`${process.env.BACKEND_URL}/webhook`, {
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
    }, 2000); 

    res.json({ message: 'Payment processing started' });
});

app.use(cors({
    origin: process.env.CORS_ORIGIN
}));



app.listen(PORT, () => {
    console.log(`Payment provider running on port ${PORT}`);
});