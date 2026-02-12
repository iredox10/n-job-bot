const { Client, Databases, ID, Query } = require('node-appwrite');
require('dotenv').config();

const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT.trim())
    .setProject(process.env.APPWRITE_PROJECT_ID.trim())
    .setKey(process.env.APPWRITE_API_KEY.trim());

const databases = new Databases(client);
const dbId = process.env.DATABASE_ID;

async function setupProfile() {
    try {
        console.log('Setting up Profile collection...');
        
        // Check if exists
        const collections = await databases.listCollections(dbId);
        let profileCol = collections.collections.find(c => c.name === 'Profile');
        
        if (!profileCol) {
            profileCol = await databases.createCollection(dbId, ID.unique(), 'Profile');
            console.log('Created Profile collection:', profileCol.$id);
            
            // Attributes
            await databases.createStringAttribute(dbId, profileCol.$id, 'name', 255, true);
            await databases.createStringAttribute(dbId, profileCol.$id, 'email', 255, true);
            await databases.createStringAttribute(dbId, profileCol.$id, 'phone', 20, true);
            await databases.createStringAttribute(dbId, profileCol.$id, 'title', 255, true);
            await databases.createStringAttribute(dbId, profileCol.$id, 'skills', 1000, true);
            await databases.createStringAttribute(dbId, profileCol.$id, 'summary', 2000, true);
            
            console.log('Waiting for attributes...');
            await new Promise(r => setTimeout(resolve, 5000));
        }

        console.log('Profile setup complete. Collection ID:', profileCol.$id);
        
        // Add ID to .env
        const fs = require('fs');
        let envContent = fs.readFileSync('.env', 'utf8');
        if (!envContent.includes('PROFILE_COLLECTION_ID')) {
            envContent += `\nPROFILE_COLLECTION_ID = "${profileCol.$id}"`;
            fs.writeFileSync('.env', envContent);
        }

    } catch (e) {
        console.error('Setup failed:', e.message);
    }
}

setupProfile();
