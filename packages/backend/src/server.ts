// payment-backend/src/server.ts
import express from 'express';
import cors from 'cors';
import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import { Payment, PaymentData } from './types';

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

// Store payments in memory
const payments = new Map<string, Payment>();

// Middleware
app.use(cors());
app.use(express.json());

// WebSocket connection handler
wss.on('connection', (ws) => {
    console.log('Client connected');
});

// Broadcast to all connected clients
function broadcastPayment(payment: Payment) {
    console.log('📢 Broadcasting:', payment.paymentId, payment.status);
    wss.clients.forEach((client) => {
        client.send(JSON.stringify({
            type: 'PAYMENT_UPDATE',
            payment
        }));
    });
}

// API endpoint to create payment
app.post('/api/payment', async (req, res) => {
    try {
        console.log('📥 Payment Request Received:', req.body);
        const { amount, currency }: PaymentData = req.body;
        
        // Create payment record
        const payment: Payment = {
            paymentId: Math.random().toString(36).substring(7),
            data: { amount, currency },
            status: 'processing'
        };
        
        // Store payment
        payments.set(payment.paymentId, payment);
        
        // Broadcast the initial status
        broadcastPayment(payment);

        // Send to payment provider
        try {
            const response = await fetch('http://localhost:3002/process-payment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    paymentId: payment.paymentId,
                    amount,
                    currency,
                    webhookUrl: 'http://localhost:3001/webhook'
                })
            });

            if (!response.ok) {
                throw new Error('Payment provider error');
            }
        } catch (error) {
            console.error('Error calling payment provider:', error);
        }
        console.log('🚀 Sending to payment provider:', payment.paymentId);

        res.json({ paymentId: payment.paymentId });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create payment' });
    }
});

// Webhook endpoint
app.post('/webhook', express.json(), (req, res) => {
    try {
        console.log('📥 Webhook Received:', req.body);
        const { paymentId, status } = req.body;
        
        // Update payment status
        const payment = payments.get(paymentId);
        if (payment) {
            payment.status = status;
            payments.set(paymentId, payment);
            
            // Broadcast the update
            broadcastPayment(payment);
        }
        console.log('📤 Payment Updated:', paymentId, status);
        res.json({ received: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to process webhook' });
    }
});

const PORT = 3001;
server.listen(PORT, () => {
    console.log(`Backend server running on port ${PORT}`);
});