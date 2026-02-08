const nodemailer = require('nodemailer');
require('dotenv').config();

async function testEmail() {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_APP_PASSWORD
        }
    });

    try {
        await transporter.sendMail({
            from: process.env.GMAIL_USER,
            to: process.env.GMAIL_USER,
            subject: 'Test Bot',
            text: 'It works!'
        });
        console.log('Email Sent!');
    } catch (e) {
        console.error('Email Failed:', e.message);
    }
}
testEmail();
