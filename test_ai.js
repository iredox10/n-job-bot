const OpenAI = require('openai');
require('dotenv').config();

const client = new OpenAI({
    baseURL: "https://models.inference.ai.azure.com",
    apiKey: process.env.GITHUB_TOKEN.trim()
});

async function testAI() {
    try {
        const response = await client.chat.completions.create({
            model: "gpt-4o",
            messages: [{ role: "user", content: "Say hello" }]
        });
        console.log('AI Response:', response.choices[0].message.content);
    } catch (e) {
        console.error('AI Test Failed:', e.message);
    }
}
testAI();
