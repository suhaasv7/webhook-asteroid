// src/App.tsx
import { useState, useEffect } from 'react'
import { config } from './config'
import { Payment, PaymentData } from './types'
import './App.css'

function App() {
  const [amount, setAmount] = useState<number>(100)
  const [payments, setPayments] = useState<Payment[]>([])

  useEffect(() => {
    // Connect to WebSocket
    const ws = new WebSocket(config.wsUrl);

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'PAYMENT_UPDATE') {
        setPayments(prev => {
          const index = prev.findIndex(p => p.paymentId === data.payment.paymentId);
          if (index !== -1) {
            const updated = [...prev];
            updated[index] = data.payment;
            return updated;
          }
          return [data.payment, ...prev];
        });
      }
    };

    return () => ws.close();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const paymentData: PaymentData = {
      amount,
      currency: 'USD'
    };

    try {
      const response = await fetch(`${config.apiUrl}${config.endpoints.payment}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData)
      });

      const data = await response.json();
      console.log('Payment initiated:', data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Payment System</h1>
        
        {/* Payment Form */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                Amount (USD)
              </label>
              <input
                type="number"
                min="1"
                id="amount"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              />
            </div>
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Make Payment
            </button>
          </form>
        </div>

        {/* Payments List */}
        <div className="bg-white rounded-lg shadow-md">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Payment ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {payments.map(payment => (
                <tr key={payment.paymentId}>
                  <td className="px-6 py-4 text-sm text-gray-900">{payment.paymentId}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    ${payment.data.amount}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                      ${payment.status === 'completed' ? 'bg-green-100 text-green-800' : 
                        payment.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'}`}
                    >
                      {payment.status}
                    </span>
                  </td>
                </tr>
              ))}
              {payments.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-6 py-4 text-sm text-gray-500 text-center">
                    No payments yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default App