const { createResumePDF } = require('./src/pdf/generator');
const path = require('path');

const testData = {
    name: "Test User",
    email: "test@example.com",
    phone: "123456789",
    location: "Lagos",
    summary: "Testing summary",
    highlights: ["Point 1", "Point 2"],
    experience: [{ role: "Dev", company: "TestCo", description: "Doing stuff" }]
};

const out = path.join(__dirname, 'test.pdf');
createResumePDF(out, testData)
    .then(() => console.log('PDF Created at', out))
    .catch(err => console.error('PDF Failed', err));
