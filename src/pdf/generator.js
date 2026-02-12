const PDFDocument = require('pdfkit');
const fs = require('fs');

async function createResumePDF(outputPath, data) {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ margin: 50 });
        const stream = fs.createWriteStream(outputPath);

        doc.pipe(stream);

        // Header
        doc.fontSize(20).text(data.name || "Name", { align: 'center' });
        doc.fontSize(10).text(`${data.email || ""} | ${data.phone || ""} | ${data.location || ""}`, { align: 'center' });
        doc.moveDown();

        // Summary
        doc.fontSize(14).text('Professional Summary', { underline: true });
        doc.fontSize(11).text(data.summary || "No summary provided.");
        doc.moveDown();

        // Tailored Highlights
        if (data.highlights && data.highlights.length > 0) {
            doc.fontSize(14).text('Key Qualifications', { underline: true });
            data.highlights.forEach(h => {
                doc.fontSize(11).text(`• ${h}`);
            });
            doc.moveDown();
        }

        // Standard Experience
        if (data.experience && data.experience.length > 0) {
            doc.fontSize(14).text('Professional Experience', { underline: true });
            data.experience.forEach(exp => {
                doc.fontSize(12).text(`${exp.role || "Role"} at ${exp.company || "Company"}`, { bold: true });
                doc.fontSize(10).text(exp.description || "");
                doc.moveDown(0.5);
            });
        }

        // Education
        if (data.education) {
            doc.fontSize(14).text('Education', { underline: true });
            doc.fontSize(11).text(data.education);
            doc.moveDown();
        }

        doc.end();

        stream.on('finish', () => resolve(outputPath));
        stream.on('error', reject);
    });
}

module.exports = { createResumePDF };
