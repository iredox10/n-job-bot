const { Client, Databases, ID } = require('node-appwrite');
require('dotenv').config();

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function setupAppwrite() {
    const client = new Client()
        .setEndpoint(process.env.APPWRITE_ENDPOINT.trim())
        .setProject(process.env.APPWRITE_PROJECT_ID.trim())
        .setKey(process.env.APPWRITE_API_KEY.trim());

    const databases = new Databases(client);

    try {
        console.log('Starting Appwrite Setup...');
        
        // 1. Create Database
        let dbId;
        try {
            const db = await databases.create(ID.unique(), 'JobBotDB');
            dbId = db.$id;
            console.log(`Created Database: ${dbId}`);
        } catch (e) {
            console.log('Database might already exist or failed creation. Checking...');
            const dbs = await databases.list();
            const existingDb = dbs.databases.find(d => d.name === 'JobBotDB');
            if (existingDb) {
                dbId = existingDb.$id;
                console.log(`Found existing Database: ${dbId}`);
            } else {
                throw e;
            }
        }

        await sleep(1000);

        // 2. Create Jobs Collection
        let jobsColId;
        try {
            const jobsCol = await databases.createCollection(dbId, ID.unique(), 'Jobs');
            jobsColId = jobsCol.$id;
            console.log(`Created Jobs Collection: ${jobsColId}`);
            
            // Add Attributes
            await databases.createStringAttribute(dbId, jobsColId, 'title', 255, true);
            await databases.createStringAttribute(dbId, jobsColId, 'company', 255, true);
            await databases.createStringAttribute(dbId, jobsColId, 'link', 500, true);
            await databases.createStringAttribute(dbId, jobsColId, 'email', 255, false);
            await databases.createBooleanAttribute(dbId, jobsColId, 'applied', false, false);
            console.log('Jobs attributes added.');
        } catch (e) {
            const cols = await databases.listCollections(dbId);
            const existingCol = cols.collections.find(c => c.name === 'Jobs');
            if (existingCol) {
                jobsColId = existingCol.$id;
                console.log(`Found existing Jobs Collection: ${jobsColId}`);
            } else {
                throw e;
            }
        }

        await sleep(1000);

        // 3. Create Experience Collection
        let expColId;
        try {
            const expCol = await databases.createCollection(dbId, ID.unique(), 'Experience');
            expColId = expCol.$id;
            console.log(`Created Experience Collection: ${expColId}`);
            
            await databases.createStringAttribute(dbId, expColId, 'role', 255, true);
            await databases.createStringAttribute(dbId, expColId, 'company', 255, true);
            await databases.createStringAttribute(dbId, expColId, 'description', 2000, true);
            console.log('Experience attributes added.');
        } catch (e) {
            const cols = await databases.listCollections(dbId);
            const existingCol = cols.collections.find(c => c.name === 'Experience');
            if (existingCol) {
                expColId = existingCol.$id;
                console.log(`Found existing Experience Collection: ${expColId}`);
            } else {
                throw e;
            }
        }

        console.log('\n--- SETUP COMPLETE ---');
        console.log(`DATABASE_ID=${dbId}`);
        console.log(`JOBS_COLLECTION_ID=${jobsColId}`);
        console.log(`EXPERIENCE_COLLECTION_ID=${expColId}`);
        console.log('\nPlease add these to your .env file.');

    } catch (error) {
        console.error('Setup failed:', error);
    }
}

if (require.main === module) {
    setupAppwrite();
}

module.exports = setupAppwrite;
