const axios = require('axios');
const { Client, Databases, Query } = require('node-appwrite');
require('dotenv').config();

async function syncGitHubProjects(githubUsername) {
    if (!githubUsername) {
        console.log('GitHub username missing.');
        return;
    }

    try {
        console.log(`Syncing GitHub projects for: ${githubUsername}`);
        const { data: repos } = await axios.get(`https://api.github.com/users/${githubUsername}/repos?sort=updated&per_page=5`);
        
        const projectStrings = repos.map(repo => `${repo.name}: ${repo.description || 'No description'}`).join('; ');

        const client = new Client()
            .setEndpoint(process.env.APPWRITE_ENDPOINT.trim())
            .setProject(process.env.APPWRITE_PROJECT_ID.trim())
            .setKey(process.env.APPWRITE_API_KEY.trim());

        const databases = new Databases(client);
        const dbId = process.env.DATABASE_ID;
        const profColId = process.env.PROFILE_COLLECTION_ID;

        const profileDocs = await databases.listDocuments(dbId, profColId, [Query.limit(1)]);
        
        if (profileDocs.documents.length > 0) {
            const doc = profileDocs.documents[0];
            await databases.updateDocument(dbId, profColId, doc.$id, {
                summary: doc.summary + "\n\nLatest GitHub Projects: " + projectStrings
            });
            console.log('Profile updated with GitHub projects!');
        }
    } catch (e) {
        console.error('GitHub sync failed:', e.message);
    }
}

module.exports = { syncGitHubProjects };
