const { createResumePDF } = require('../pdf/generator');
const { sendApplication } = require('../mailer');
const { Client, Databases } = require('node-appwrite');
require('dotenv').config();

async function applyToJob(jobId, tailoredCoverLetter, masterData) {
    const client = new Client()
        .setEndpoint(process.env.APPWRITE_ENDPOINT.trim())
        .setProject(process.env.APPWRITE_PROJECT_ID.trim())
        .setKey(process.env.APPWRITE_API_KEY.trim());

    const databases = new Databases(client);
    const dbId = process.env.DATABASE_ID;
    const colId = process.env.JOBS_COLLECTION_ID;

    try {
        const job = await databases.getDocument(dbId, colId, jobId);
        
        console.log(`Manually applying to: ${job.title} at ${job.company}`);

        const pdfPath = `./resume_manual_${Date.now()}.pdf`;
        await createResumePDF(pdfPath, masterData);

        const success = await sendApplication(
            job.email, 
            `Application for ${job.title} - ${masterData.name}`,
            tailoredCoverLetter || job.cover_letter,
            pdfPath
        );

        if (success) {
            await databases.updateDocument(dbId, colId, jobId, {
                applied: true,
                status: 'sent'
            });
            return { success: true };
        } else {
            throw new Error('Email sending failed');
        }
    } catch (e) {
        console.error('Manual apply failed:', e.message);
        throw e;
    }
}

module.exports = { applyToJob };
