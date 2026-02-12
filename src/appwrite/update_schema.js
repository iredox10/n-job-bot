const { Client, Databases } = require('node-appwrite');
require('dotenv').config();

const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT.trim())
    .setProject(process.env.APPWRITE_PROJECT_ID.trim())
    .setKey(process.env.APPWRITE_API_KEY.trim());

const databases = new Databases(client);
const dbId = process.env.DATABASE_ID;
const colId = process.env.JOBS_COLLECTION_ID;

async function updateSchema() {
    try {
        console.log('Updating Jobs collection schema...');
        
        const attributes = [
            { key: 'status', type: 'string', size: 50, required: false, default: 'pending' },
            { key: 'cover_letter', type: 'string', size: 10000, required: false },
            { key: 'tailored_resume_url', type: 'string', size: 500, required: false },
            { key: 'interview_prep', type: 'string', size: 10000, required: false }
        ];

        for (const attr of attributes) {
            try {
                console.log(`Creating attribute: ${attr.key}`);
                await databases.createStringAttribute(dbId, colId, attr.key, attr.size, attr.required, attr.default);
                console.log(`Success: ${attr.key}`);
                // Sleep to avoid rate limiting
                await new Promise(r => setTimeout(r, 2000));
            } catch (e) {
                console.log(`Attribute ${attr.key} already exists or failed:`, e.message);
            }
        }

        console.log('Schema update completed!');
    } catch (e) {
        console.error('Schema update failed:', e.message);
    }
}

updateSchema();
