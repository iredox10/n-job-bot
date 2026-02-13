const axios = require('axios');
require('dotenv').config();

async function sendWhatsAppAlert(message) {
    const whatsappToken = process.env.WHATSAPP_TOKEN;
    const whatsappPhoneId = process.env.WHATSAPP_PHONE_ID;
    const recipientPhone = process.env.WHATSAPP_RECIPIENT;

    if (!whatsappToken || !whatsappPhoneId || !recipientPhone) {
        console.log('WhatsApp not configured - skipping notification');
        return false;
    }

    try {
        const response = await axios.post(
            `https://graph.facebook.com/v18.0/${whatsappPhoneId}/messages`,
            {
                messaging_product: 'whatsapp',
                to: recipientPhone,
                type: 'text',
                text: { 
                    body: message.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ')
                }
            },
            {
                headers: {
                    'Authorization': `Bearer ${whatsappToken}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log('WhatsApp alert sent successfully');
        return true;
    } catch (error) {
        console.error('WhatsApp alert failed:', error.response?.data || error.message);
        return false;
    }
}

async function sendWhatsAppTemplate(templateName, components = {}) {
    const whatsappToken = process.env.WHATSAPP_TOKEN;
    const whatsappPhoneId = process.env.WHATSAPP_PHONE_ID;
    const recipientPhone = process.env.WHATSAPP_RECIPIENT;

    if (!whatsappToken || !whatsappPhoneId || !recipientPhone) {
        return false;
    }

    try {
        const response = await axios.post(
            `https://graph.facebook.com/v18.0/${whatsappPhoneId}/messages`,
            {
                messaging_product: 'whatsapp',
                to: recipientPhone,
                type: 'template',
                template: {
                    name: templateName,
                    language: { code: 'en' },
                    components: components
                }
            },
            {
                headers: {
                    'Authorization': `Bearer ${whatsappToken}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        return true;
    } catch (error) {
        console.error('WhatsApp template failed:', error.response?.data || error.message);
        return false;
    }
}

module.exports = { sendWhatsAppAlert, sendWhatsAppTemplate };
