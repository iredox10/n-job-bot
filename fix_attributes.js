const { Client, Databases } = require('node-appwrite');
require('dotenv').config();

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function finishAttributes() {
    const client = new Client()
        .setEndpoint(process.env.APPWRITE_ENDPOINT.trim())
        .setProject(process.env.APPWRITE_PROJECT_ID.trim())
        .setKey(process.env.APPWRITE_API_KEY.trim());

    const databases = new Databases(client);
    const dbId = process.env.DATABASE_ID;
    const colId = process.env.JOBS_COLLECTION_ID;

    const attributes = [
        { key: 'company', type: 'string', size: 255, required: true },
        { key: 'link', type: 'string', size: 500, required: true },
        { key: 'email', type: 'string', size: 255, required: false },
        { key: 'applied', type: 'boolean', required: false, default: false }
    ];

    for (const attr of attributes) {
        try {
            console.log(`Creating attribute: ${attr.key}`);
            if (attr.type === 'string') {
                await databases.createStringAttribute(dbId, colId, attr.key, attr.size, attr.required);
            } else if (attr.type === 'boolean') {
                await databases.createBooleanAttribute(dbId, colId, attr.key, attr.required, attr.default);
            }
            console.log(`Success: ${attr.key}`);
            await sleep(2000); // Give Appwrite time
        } catch (e) {
            console.log(`Error or already exists: ${attr.key}`, e.message);
        }
    }
}

finishAttributes();
