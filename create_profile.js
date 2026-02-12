const { Client, Databases, ID } = require('node-appwrite');
require('dotenv').config();

const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT.trim())
    .setProject(process.env.APPWRITE_PROJECT_ID.trim())
    .setKey(process.env.APPWRITE_API_KEY.trim());

const databases = new Databases(client);
const dbId = process.env.DATABASE_ID;

async function run() {
    try {
        console.log('Creating Profile collection...');
        const col = await databases.createCollection(dbId, ID.unique(), 'Profile');
        console.log('Created:', col.$id);
        
        await databases.createStringAttribute(dbId, col.$id, 'name', 255, true);
        await databases.createStringAttribute(dbId, col.$id, 'email', 255, true);
        await databases.createStringAttribute(dbId, col.$id, 'phone', 255, true);
        await databases.createStringAttribute(dbId, col.$id, 'title', 255, true);
        await databases.createStringAttribute(dbId, col.$id, 'skills', 1000, true);
        await databases.createStringAttribute(dbId, col.$id, 'summary', 2000, true);
        
        console.log('Final Profile Collection ID:', col.$id);
    } catch (e) {
        console.log('Error:', e.message);
    }
}
run();
