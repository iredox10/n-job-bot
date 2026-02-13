const { scrapeMyJobMag, getJobDetails } = require('./src/scraper');
const { scrapeHotNigerianJobs, getHotJobDetails } = require('./src/scraper/hotjobs');
const { scrapeIndeed } = require('./src/scraper/indeed');
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

async function getMasterData() {
    try {
        const dbId = process.env.DATABASE_ID;
        const profColId = process.env.PROFILE_COLLECTION_ID;
        
        if (profColId) {
            const response = await databases.listDocuments(dbId, profColId, [Query.limit(1)]);
            if (response.documents.length > 0) {
                const doc = response.documents[0];
                return {
                    name: doc.name,
                    email: doc.email,
                    phone: doc.phone,
                    location: doc.location || "Nigeria",
                    title: doc.title || "Full Stack Web Developer",
                    experience: [
                        {
                            role: doc.title,
                            company: "Various",
                            description: doc.summary
                        }
                    ],
                    skills: doc.skills
                };
            }
        }
    } catch (e) {
        console.warn('Could not fetch profile from Appwrite, using fallback.');
    }

    return {
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
}

const { sendTelegramAlert } = require('./src/notifications/telegram');

async function runJobBot() {
    console.log('--- Starting Job Search ---');
    
    const dbId = process.env.DATABASE_ID;
    const colId = process.env.JOBS_COLLECTION_ID;

    const MASTER_DATA = await getMasterData();
    console.log(`Applying as: ${MASTER_DATA.name} (${MASTER_DATA.title})`);

    const myJobMagJobs = await scrapeMyJobMag(process.env.JOB_KEYWORDS);
    const hotJobs = await scrapeHotNigerianJobs(process.env.JOB_KEYWORDS);
    const indeedJobs = await scrapeIndeed(process.env.JOB_KEYWORDS);
    
    const allJobs = [...myJobMagJobs, ...hotJobs, ...indeedJobs];
    console.log(`Found ${allJobs.length} potential jobs in total.`);

    for (const job of allJobs) {
        try {
            const existing = await databases.listDocuments(dbId, colId, [
                Query.equal('link', job.link)
            ]);

            if (existing.total > 0) {
                console.log(`Skipping ${job.title}: Already in database.`);
                continue;
            }

            console.log(`\nProcessing: ${job.title} at ${job.company}`);
            
            let details = job.source === 'HotNigerianJobs' 
                ? await getHotJobDetails(job.link)
                : await getJobDetails(job.link);

            const hasEmail = details && details.email;
            if (!hasEmail) {
                console.log('No contact email found - will generate content for manual application.');
            } else {
                console.log(`Found email: ${details.email}`);
            }

            console.log('Generating tailored CV...');

            let aiContent = await generateTailoredContent(details?.description || job.title, MASTER_DATA);
            
            if (aiContent && aiContent.coverLetter) {
                // Manual fallback for common placeholders
                aiContent.coverLetter = aiContent.coverLetter
                    .replace(/\[Your Name\]/gi, MASTER_DATA.name)
                    .replace(/\[Your Email\]/gi, MASTER_DATA.email)
                    .replace(/\[Your Phone Number\]/gi, MASTER_DATA.phone)
                    .replace(/\[Your Address\]/gi, MASTER_DATA.location)
                    .replace(/\[Date\]/gi, new Date().toLocaleDateString())
                    .replace(/\[Company Name\]/gi, job.company);
            }
            
            const isApprovalMode = process.env.APPROVAL_MODE === 'true';
            const canAutoApply = hasEmail && !isApprovalMode;
            
            const jobData = {
                title: job.title,
                company: job.company,
                link: job.link,
                email: details?.email || '',
                applied: canAutoApply,
                status: canAutoApply ? 'sent' : 'draft',
                cover_letter: aiContent ? aiContent.coverLetter : '',
                interview_prep: aiContent ? JSON.stringify({
                    questions: aiContent.interviewPrep,
                    summary: aiContent.summary,
                    highlights: aiContent.highlights
                }) : ''
            };

            // Create Appwrite document
            let doc;
            try {
                doc = await databases.createDocument(dbId, colId, ID.unique(), jobData);
            } catch (e) {
                console.log('Appwrite logging failed:', e.message);
            }

            if (doc) {
                const statusMsg = canAutoApply ? 'Auto-applied' : (hasEmail ? 'Draft (Awaiting Review)' : 'Draft (Manual Apply via Link)');
                await sendTelegramAlert(`🚀 <b>New Job Found!</b>\n\n<b>Title:</b> ${job.title}\n<b>Company:</b> ${job.company}\n<b>Status:</b> ${statusMsg}\n\n<a href="${job.link}">View Job</a>`);
            }

            if (canAutoApply && aiContent) {
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

                if (success && doc) {
                    console.log('Successfully applied!');
                    await databases.updateDocument(dbId, colId, doc.$id, {
                        applied: true,
                        status: 'sent'
                    });
                }
            } else {
                console.log(`Draft saved: ${hasEmail ? 'Awaiting approval' : 'Apply manually via job link'}.`);
            }
        } catch (err) {
            console.error(`Error processing ${job.title}:`, err.message);
        }
    }
}

runJobBot();
