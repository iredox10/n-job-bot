const { Client, Databases } = require('node-appwrite');
require('dotenv').config();

const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT.trim())
    .setProject(process.env.APPWRITE_PROJECT_ID.trim())
    .setKey(process.env.APPWRITE_API_KEY.trim());

console.log('Endpoint:', process.env.APPWRITE_ENDPOINT);
console.log('Project:', process.env.APPWRITE_PROJECT_ID);

const databases = new Databases(client);
const dbId = process.env.DATABASE_ID;

async function fixPermissions() {
    try {
        const collections = await databases.listCollections(dbId);
        
        for (const col of collections.collections) {
            console.log(`Updating permissions for: ${col.name} (${col.$id})`);
            
            await databases.updateCollection(
                dbId,
                col.$id,
                col.name,
                ['read("any")', 'create("any")', 'update("any")', 'delete("any")'],
                col.documentSecurity
            );
            console.log(`Success: ${col.name}`);
        }
        console.log('All permissions fixed!');
    } catch (e) {
        console.error('Permission fix failed:', e.message);
    }
}

fixPermissions();
