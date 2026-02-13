const OpenAI = require('openai');
require('dotenv').config();

const client = new OpenAI({
    baseURL: "https://models.inference.ai.azure.com",
    apiKey: process.env.GITHUB_TOKEN
});

async function generateTailoredContent(jobDescription, masterExperience) {
    try {
        const response = await client.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: `You are an expert resume writer and career coach. Your task is to create a FULLY TAILORED RESUME and cover letter for a specific job.

IMPORTANT RULES:
1. NEVER use placeholders like [Your Name], [Date], [Company Name] etc.
2. ALWAYS use the actual data provided in the user profile.
3. Tailor EVERY section to match the job description keywords and requirements.
4. Be specific and quantifiable in achievements where possible.
5. Return valid JSON only.`
                },
                {
                    role: "user",
                    content: `
JOB DESCRIPTION:
${jobDescription}

USER PROFILE (MASTER DATA):
${JSON.stringify(masterExperience, null, 2)}

Generate a JSON object with these EXACT fields:

1. "summary": A compelling 3-4 sentence professional summary that directly addresses the job requirements. Use keywords from the job description.

2. "skills": An array of 8-12 relevant skills extracted from the user's skills that match this job. Prioritize skills mentioned in the job description.

3. "workExperience": An array of 2-4 work experiences. Each item should have:
   - "title": Job title
   - "company": Company name
   - "location": Location (use "Nigeria" if not specified)
   - "duration": Time period (infer reasonable dates if not provided)
   - "bullets": Array of 3-5 achievement bullets tailored to THIS job. Start with action verbs. Include metrics where possible.

4. "projects": An array of 2-3 relevant projects. Each item should have:
   - "name": Project name
   - "description": 1-2 sentences describing the project and YOUR contribution
   - "tech": Array of technologies used

5. "coverLetter": A professional cover letter (3 paragraphs). Use the user's ACTUAL name, email, phone from profile. Address hiring manager professionally. Connect user's experience directly to job requirements.

6. "interviewPrep": An array of 5 objects, each with:
   - "question": A likely interview question for this specific role
   - "answer": A strong answer based on user's experience

Remember: NO placeholders. Use real data from the profile. Make everything relevant to THIS job.`
                }
            ],
            response_format: { type: "json_object" }
        });

        return JSON.parse(response.choices[0].message.content);
    } catch (error) {
        console.error('AI Tailoring failed:', error.message);
        return null;
    }
}

module.exports = { generateTailoredContent };
