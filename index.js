const { scrapeMyJobMag, getJobDetails } = require('./src/scraper');
const { scrapeHotNigerianJobs, getHotJobDetails } = require('./src/scraper/hotjobs');
const { generateTailoredContent } = require('./src/ai/engine');
const { createResumePDF } = require('./src/pdf/generator');
const { sendApplication } = require('./src/mailer');
const { Client, Databases, ID, Query } = require('node-appwrite');
require('dotenv').config();

const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT.trim())
    .setProject(process.env.APPWRITE_PROJECT_ID.trim())
    .setKey(process.env.APPWRITE_API_KEY.trim());

const databases = new Databases(client);

// Master Data
const MASTER_DATA = {
    name: "Iredox",
    email: "iredoxtech@gmail.com",
    phone: "+234 800 000 0000",
    location: "Lagos, Nigeria",
    experience: [
        {
            role: "Full Stack Web Developer",
            company: "Personal Projects",
            description: "Developed various web applications using React, Node.js, and Appwrite. Specialized in automation bots and scalable architectures."
        }
    ]
};

async function runJobBot() {
    console.log('--- Starting Job Search ---');
    
    const dbId = process.env.DATABASE_ID;
    const colId = process.env.JOBS_COLLECTION_ID;

    // Try both scrapers
    const myJobMagJobs = await scrapeMyJobMag(process.env.JOB_KEYWORDS);
    const hotJobs = await scrapeHotNigerianJobs(process.env.JOB_KEYWORDS);
    
    const allJobs = [...myJobMagJobs, ...hotJobs];
    console.log(`Found ${allJobs.length} potential jobs in total.`);

    for (const job of allJobs) {
        try {
            // Check if we already processed this link
            const existing = await databases.listDocuments(dbId, colId, [
                Query.equal('link', job.link)
            ]);

            if (existing.total > 0) {
                console.log(`Skipping ${job.title}: Already in database.`);
                continue;
            }

            console.log(`\nProcessing: ${job.title} at ${job.company}`);
            
            const details = job.source === 'HotNigerianJobs' 
                ? await getHotJobDetails(job.link)
                : await getJobDetails(job.link);

            if (!details || !details.email) {
                console.log('Skipping: No contact email found.');
                // Log to DB anyway so we don't re-scan
                try {
                    await databases.createDocument(dbId, colId, ID.unique(), {
                        title: job.title,
                        company: job.company,
                        link: job.link,
                        applied: false
                    });
                } catch (e) {}
                continue;
            }

            console.log(`Found email: ${details.email}. Generating tailored CV...`);

            // Log to Appwrite first
            let doc;
            try {
                doc = await databases.createDocument(dbId, colId, ID.unique(), {
                    title: job.title,
                    company: job.company,
                    link: job.link,
                    applied: false
                });
            } catch (e) {
                console.log('Appwrite logging failed.');
            }

            let aiContent = await generateTailoredContent(details.description, MASTER_DATA.experience);
            
            if (!aiContent) {
                console.log('AI generation failed. Using default template.');
                aiContent = {
                    summary: "Experienced Web Developer looking for a challenging role in Nigeria.",
                    highlights: ["Expert in React and Node.js", "Proficient in Database Management", "Strong problem-solving skills", "Experienced in Nigerian Market"],
                    coverLetter: `Dear Hiring Manager at ${job.company},\n\nI am writing to express my interest in the ${job.title} position...`
                };
            }

            const pdfData = {
                ...MASTER_DATA,
                summary: aiContent.summary,
                highlights: aiContent.highlights
            };

            const pdfPath = `./resume_${Date.now()}.pdf`;
            await createResumePDF(pdfPath, pdfData);

            console.log('Sending application...');
            const success = await sendApplication(
                details.email, 
                `Application for ${job.title} - ${MASTER_DATA.name}`,
                aiContent.coverLetter,
                pdfPath
            );

            if (success) {
                console.log('Successfully applied!');
                if (doc) {
                    await databases.updateDocument(dbId, colId, doc.$id, {
                        applied: true
                    });
                }
            }
        } catch (err) {
            console.error(`Error processing ${job.title}:`, err.message);
        }
    }
}

runJobBot();
