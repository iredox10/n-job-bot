const { Client, Databases } = require('node-appwrite');
require('dotenv').config();

async function check() {
    const client = new Client()
        .setEndpoint(process.env.APPWRITE_ENDPOINT.trim())
        .setProject(process.env.APPWRITE_PROJECT_ID.trim())
        .setKey(process.env.APPWRITE_API_KEY.trim());

    const databases = new Databases(client);
    try {
        const col = await databases.getCollection(process.env.DATABASE_ID, process.env.JOBS_COLLECTION_ID);
        console.log('Collection:', col.name);
        console.log('Attributes:', col.attributes.map(a => a.key));
    } catch (e) {
        console.error(e);
    }
}
check();
