const axios = require('axios');
require('dotenv').config();

async function sendTelegramAlert(message) {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!token || !chatId) {
        console.log('Telegram credentials missing, skipping alert.');
        return;
    }

    const url = `https://api.telegram.org/bot${token}/sendMessage`;

    try {
        await axios.post(url, {
            chat_id: chatId,
            text: message,
            parse_mode: 'HTML'
        });
        console.log('Telegram alert sent!');
    } catch (e) {
        console.error('Telegram alert failed:', e.message);
    }
}

module.exports = { sendTelegramAlert };
