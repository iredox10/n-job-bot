const nodemailer = require('nodemailer');
require('dotenv').config();

async function sendApplication(toEmail, subject, body, attachmentPath) {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_APP_PASSWORD
        }
    });

    const mailOptions = {
        from: process.env.GMAIL_USER,
        to: toEmail,
        subject: subject,
        text: body,
        attachments: [
            {
                filename: 'Resume.pdf',
                path: attachmentPath
            }
        ]
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: ' + info.response);
        return true;
    } catch (error) {
        console.error('Email failed:', error.message);
        return false;
    }
}

module.exports = { sendApplication };
