const { Client, Databases } = require('node-appwrite');
require('dotenv').config();

async function addAttributes() {
    const client = new Client()
        .setEndpoint(process.env.APPWRITE_ENDPOINT.trim())
        .setProject(process.env.APPWRITE_PROJECT_ID.trim())
        .setKey(process.env.APPWRITE_API_KEY.trim());

    const databases = new Databases(client);
    const dbId = process.env.DATABASE_ID;
    const profileColId = process.env.PROFILE_COLLECTION_ID;

    const newAttrs = [
        { key: 'projects', size: 5000, required: false },
        { key: 'certifications', size: 2000, required: false },
        { key: 'languages', size: 500, required: false },
        { key: 'linkedin', size: 255, required: false },
        { key: 'github', size: 255, required: false },
        { key: 'portfolio', size: 255, required: false },
    ];

    for (const attr of newAttrs) {
        try {
            await databases.createStringAttribute(dbId, profileColId, attr.key, attr.size, attr.required);
            console.log(`Added: ${attr.key}`);
        } catch (e) {
            if (e.message.includes('already exists')) {
                console.log(`Exists: ${attr.key}`);
            } else {
                console.error(`Error adding ${attr.key}:`, e.message);
            }
        }
    }

    console.log('\nDone! New attributes added to Profile collection.');
}

addAttributes();
