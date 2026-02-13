const express = require('express');
const { spawn } = require('child_process');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { Client, Databases, ID } = require('node-appwrite');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const ENV_PATH = path.join(__dirname, '.env');

// Appwrite setup
const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT.trim())
    .setProject(process.env.APPWRITE_PROJECT_ID.trim())
    .setKey(process.env.APPWRITE_API_KEY.trim());
const databases = new Databases(client);

const { applyToJob } = require('./src/logic/apply');
const { syncGitHubProjects } = require('./src/logic/github_sync');
const { createResumePDF } = require('./src/pdf/generator');
const { createResumeWord } = require('./src/pdf/word_generator');
const { generateTailoredContent } = require('./src/ai/engine');

// Trigger Bot
app.post('/api/run-bot', (req, res) => {
    console.log('Bot Triggered via API');
    const bot = spawn('node', ['index.js'], { detached: true, stdio: 'ignore' });
    bot.unref();
    res.json({ status: 'started' });
});

// Download Resume
app.post('/api/download-resume', async (req, res) => {
    try {
        const { format, job, profile } = req.body;
        const timestamp = Date.now();
        const safeCompany = (job.company || 'Company').replace(/\s+/g, '_');
        const filename = `Resume_${safeCompany}_${timestamp}`;
        
        let aiData = {};
        if (job.interview_prep) {
            try {
                aiData = JSON.parse(job.interview_prep);
            } catch(e) {
                console.log('Error parsing interview_prep:', e.message);
            }
        }

        let workExperience = [];
        if (aiData.workExperience && aiData.workExperience.length > 0) {
            workExperience = aiData.workExperience;
        } else if (profile.work_history) {
            const parts = profile.work_history.split('\n').filter(p => p.trim());
            workExperience = parts.map(p => {
                const [titlePart, ...rest] = p.split('|');
                const [title, company] = (titlePart || '').split(' at ').map(s => s.trim());
                const duration = rest.find(r => r.includes('-') || r.includes('Present'))?.trim() || '';
                const bullets = rest.filter(r => !r.includes('-') && !r.includes('Present')).map(b => b.trim()).filter(Boolean);
                return {
                    title: title || '',
                    company: company || '',
                    duration: duration,
                    bullets: bullets.length > 0 ? bullets : [rest.join(' ').trim()].filter(Boolean)
                };
            }).filter(e => e.title);
        }

        if (workExperience.length === 0) {
            workExperience = [{
                title: profile.title || "Software Developer",
                company: "Professional Experience",
                duration: "",
                bullets: [profile.summary || "Web development projects"]
            }];
        }

        let projects = [];
        if (aiData.projects && aiData.projects.length > 0) {
            projects = aiData.projects;
        } else if (profile.projects) {
            const projParts = profile.projects.split('\n').filter(p => p.trim());
            projects = projParts.map(p => {
                const [name, ...rest] = p.split(':');
                const desc = rest.join(':').split('-')[0]?.trim() || '';
                const techPart = rest.join(':').split('-')[1]?.trim() || '';
                return {
                    name: name?.trim() || '',
                    description: desc,
                    tech: techPart ? techPart.split(',').map(t => t.trim()) : []
                };
            }).filter(p => p.name);
        }

        const data = {
            name: profile.name || "User",
            email: profile.email || "",
            phone: profile.phone || "",
            location: profile.location || "Nigeria",
            summary: aiData.summary || profile.summary || "Experienced Developer",
            skills: aiData.skills || (profile.skills ? profile.skills.split(',').map(s => s.trim()) : []),
            workExperience: workExperience,
            projects: projects,
            education: profile.education || "",
            certifications: profile.certifications || "",
            languages: profile.languages || "",
            linkedin: profile.linkedin || "",
            github: profile.github || "",
            portfolio: profile.portfolio || ""
        };

        console.log('Generating resume with AI data:', !!aiData.workExperience);

        if (format === 'pdf') {
            const filePath = path.join(__dirname, `${filename}.pdf`);
            await createResumePDF(filePath, data);
            res.download(filePath, (err) => {
                if (!err && fs.existsSync(filePath)) fs.unlinkSync(filePath);
            });
        } else {
            const filePath = path.join(__dirname, `${filename}.docx`);
            await createResumeWord(filePath, data);
            res.download(filePath, (err) => {
                if (!err && fs.existsSync(filePath)) fs.unlinkSync(filePath);
            });
        }
    } catch (e) {
        console.error('Download error:', e.message);
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/sync-github', async (req, res) => {
    try {
        const { username } = req.body;
        await syncGitHubProjects(username);
        res.json({ status: 'success' });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Manual Apply Endpoint
app.post('/api/apply', async (req, res) => {
    try {
        const { jobId, coverLetter, masterData } = req.body;
        const result = await applyToJob(jobId, coverLetter, masterData);
        res.json(result);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Generate AI Review Endpoint
app.post('/api/generate-review', async (req, res) => {
    try {
        const { jobDescription, masterData } = req.body;
        const result = await generateTailoredContent(jobDescription, masterData);
        if (result) {
            res.json(result);
        } else {
            res.status(500).json({ error: 'Failed to generate review' });
        }
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Scrape Job Details Endpoint
app.post('/api/scrape-job', async (req, res) => {
    try {
        const { link } = req.body;
        const { getJobDetails } = require('./src/scraper');
        const { getHotJobDetails } = require('./src/scraper/hotjobs');
        
        let details;
        if (link.includes('hotnigerianjobs')) {
            details = await getHotJobDetails(link);
        } else {
            details = await getJobDetails(link);
        }
        
        res.json({ description: details?.description || '' });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Initialize Database
app.post('/api/init-db', async (req, res) => {
    try {
        const dbId = process.env.DATABASE_ID;
        const collections = await databases.listCollections(dbId);
        let profileCol = collections.collections.find(c => c.name === 'Profile');
        
        if (!profileCol) {
            profileCol = await databases.createCollection(dbId, ID.unique(), 'Profile');
            const attrs = [
                { key: 'name', type: 'string', size: 255 },
                { key: 'email', type: 'string', size: 255 },
                { key: 'phone', type: 'string', size: 255 },
                { key: 'location', type: 'string', size: 255 },
                { key: 'title', type: 'string', size: 255 },
                { key: 'skills', type: 'string', size: 1000 },
                { key: 'summary', type: 'string', size: 2000 }
            ];
            for (const attr of attrs) {
                await databases.createStringAttribute(dbId, profileCol.$id, attr.key, attr.size, true);
            }
            
            // Save to .env
            let envContent = fs.readFileSync(ENV_PATH, 'utf8');
            if (!envContent.includes('PROFILE_COLLECTION_ID')) {
                envContent += `\nPROFILE_COLLECTION_ID = "${profileCol.$id}"`;
                fs.writeFileSync(ENV_PATH, envContent);
            }
        }
        res.json({ status: 'success', id: profileCol.$id });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Settings API
app.get('/api/settings', (req, res) => {
    res.json({
        keywords: process.env.JOB_KEYWORDS || 'Web Developer',
        gmail_user: process.env.GMAIL_USER || '',
    });
});

app.post('/api/settings', (req, res) => {
    try {
        const { keywords, gmail_user } = req.body;
        let envContent = fs.readFileSync(ENV_PATH, 'utf8');
        if (keywords) envContent = envContent.replace(/JOB_KEYWORDS=.*/, `JOB_KEYWORDS="${keywords}"`);
        if (gmail_user) envContent = envContent.replace(/GMAIL_USER=.*/, `GMAIL_USER="${gmail_user}"`);
        fs.writeFileSync(ENV_PATH, envContent);
        res.json({ status: 'success' });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

const PORT = 3001;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Bot Control API running on http://0.0.0.0:${PORT}`);
});
