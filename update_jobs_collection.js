const { Client, Databases } = require('node-appwrite');
require('dotenv').config();

async function addJobTrackingAttributes() {
    const client = new Client()
        .setEndpoint(process.env.APPWRITE_ENDPOINT.trim())
        .setProject(process.env.APPWRITE_PROJECT_ID.trim())
        .setKey(process.env.APPWRITE_API_KEY.trim());

    const databases = new Databases(client);
    const dbId = process.env.DATABASE_ID;
    const jobsColId = process.env.JOBS_COLLECTION_ID;

    const newAttrs = [
        { key: 'response_status', size: 50, required: false },
        { key: 'response_date', size: 50, required: false },
        { key: 'interview_date', size: 50, required: false },
        { key: 'interview_type', size: 50, required: false },
        { key: 'interview_notes', size: 2000, required: false },
        { key: 'ats_score', size: 10, required: false },
        { key: 'match_score', size: 10, required: false },
        { key: 'salary_range', size: 100, required: false },
    ];

    for (const attr of newAttrs) {
        try {
            await databases.createStringAttribute(dbId, jobsColId, attr.key, attr.size, attr.required);
            console.log(`Added: ${attr.key}`);
        } catch (e) {
            if (e.message.includes('already exists')) {
                console.log(`Exists: ${attr.key}`);
            } else {
                console.error(`Error adding ${attr.key}:`, e.message);
            }
        }
    }

    console.log('\nDone! Job tracking attributes added.');
}

addJobTrackingAttributes();
