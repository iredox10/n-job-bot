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
                    content: "You are a professional career coach in Nigeria. Your task is to tailor a resume and cover letter for a specific job based on a user's master experience."
                },
                {
                    role: "user",
                    content: `
                    JOB DESCRIPTION:
                    ${jobDescription}

                    MASTER EXPERIENCE AND USER PROFILE:
                    ${JSON.stringify(masterExperience)}

                    Please generate a JSON object with:
                    1. "summary": A 3-sentence professional summary tailored to this job.
                    2. "highlights": 4 bullet points for the most relevant experience matching the job keywords.
                    3. "coverLetter": A professional cover letter. IMPORTANT: Use the user's name, email, and phone number from the provided profile data. DO NOT use placeholders like [Your Name] or [Date]. If you need a date, use today's date.
                    4. "interviewPrep": 5 potential interview questions specifically for this role and how the user should answer them based on their experience.
                    `
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
