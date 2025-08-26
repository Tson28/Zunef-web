const axios = require('axios');

// Test webhook để trigger tạo orders
async function testWebhookTrigger() {
    try {
        console.log('🚀 Testing webhook trigger...');
        
        // Tạo một webhook data giả để test
        const webhookData = {
    gateway: "MBBank",
    transactionDate: "2025-08-26 11:42:50",
    accountNumber: "0915878677",
    subAccount: null,
    code: null,
    content: "ZUNEF08570865RIPV40 Test payment webhook",
    transferType: "in",
    description: "Test payment webhook ZUNEF08570865RIPV40",
    transferAmount: 192500,
    referenceCode: "FT1756208570879",
    accumulated: 0,
    id: 627536
};
        
        console.log('📤 Sending webhook data:', webhookData);
        
        // Gửi webhook request
        const response = await axios.post('http://localhost:5000/api/payment/webhook/sepay', webhookData, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        console.log('✅ Webhook response status:', response.status);
        console.log('📋 Webhook response data:', response.data);
        
    } catch (error) {
        console.error('❌ Webhook test error:', error.message);
        if (error.response) {
            console.error('❌ Response status:', error.response.status);
            console.error('❌ Response data:', error.response.data);
        }
    }
}

// Chạy test
testWebhookTrigger();