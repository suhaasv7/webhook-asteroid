// client/src/config.ts
export const config = {
    apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:3001',
    wsUrl: import.meta.env.VITE_WS_URL || 'ws://localhost:3001',
    endpoints: {
        payment: '/api/payment'
    }
}