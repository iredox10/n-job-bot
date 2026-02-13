const PDFDocument = require('pdfkit');
const fs = require('fs');

async function createResumePDF(outputPath, data) {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ 
            margin: 40,
            size: 'A4',
            info: {
                Title: `Resume - ${data.name}`,
                Author: data.name
            }
        });
        const stream = fs.createWriteStream(outputPath);
        doc.pipe(stream);

        const primaryColor = '#1e40af';
        const textColor = '#1f2937';
        const mutedColor = '#6b7280';
        const lineHeight = 1.4;

        const drawSectionHeader = (title) => {
            doc.moveDown(0.3);
            doc.fontSize(12).font('Helvetica-Bold').fillColor(primaryColor).text(title.toUpperCase());
            doc.moveTo(40, doc.y).lineTo(555, doc.y).stroke(primaryColor);
            doc.moveDown(0.3);
            doc.font('Helvetica').fillColor(textColor);
        };

        doc.fontSize(24).font('Helvetica-Bold').fillColor(textColor).text(data.name || "Name", { align: 'center' });
        
        doc.moveDown(0.2);
        let contactParts = [data.email, data.phone, data.location].filter(Boolean);
        doc.fontSize(9).font('Helvetica').fillColor(mutedColor).text(contactParts.join('  |  '), { align: 'center' });

        let linkParts = [];
        if (data.linkedin) linkParts.push(`LinkedIn: ${data.linkedin}`);
        if (data.github) linkParts.push(`GitHub: ${data.github}`);
        if (data.portfolio) linkParts.push(`Portfolio: ${data.portfolio}`);
        if (linkParts.length > 0) {
            doc.moveDown(0.1);
            doc.fontSize(8).fillColor(primaryColor).text(linkParts.join('  |  '), { align: 'center' });
        }

        doc.moveDown(0.5);

        if (data.summary) {
            drawSectionHeader('Professional Summary');
            doc.fontSize(10).font('Helvetica').fillColor(textColor).text(data.summary, { lineBreak: true, leading: 14 });
        }

        if (data.skills && data.skills.length > 0) {
            drawSectionHeader('Technical Skills');
            const skillsText = Array.isArray(data.skills) ? data.skills.join('  •  ') : data.skills;
            doc.fontSize(10).text(skillsText, { lineBreak: true, leading: 14 });
        }

        if (data.workExperience && data.workExperience.length > 0) {
            drawSectionHeader('Professional Experience');
            data.workExperience.forEach((exp, idx) => {
                doc.fontSize(11).font('Helvetica-Bold').fillColor(textColor).text(exp.title || "Role");
                doc.fontSize(9).font('Helvetica').fillColor(mutedColor).text(
                    `${exp.company || 'Company'}${exp.location ? ' | ' + exp.location : ''}${exp.duration ? ' | ' + exp.duration : ''}`
                );
                doc.moveDown(0.2);
                
                if (exp.bullets && exp.bullets.length > 0) {
                    exp.bullets.forEach(bullet => {
                        doc.fontSize(9).font('Helvetica').fillColor(textColor);
                        const bulletText = bullet.startsWith('•') ? bullet : `• ${bullet}`;
                        doc.text(bulletText, { indent: 10, leading: 12 });
                    });
                }
                if (idx < data.workExperience.length - 1) doc.moveDown(0.3);
            });
        }

        if (data.projects && data.projects.length > 0) {
            drawSectionHeader('Projects');
            data.projects.forEach((proj, idx) => {
                doc.fontSize(10).font('Helvetica-Bold').fillColor(textColor).text(proj.name || "Project Name");
                if (proj.description) {
                    doc.fontSize(9).font('Helvetica').fillColor(textColor).text(proj.description, { leading: 12 });
                }
                if (proj.tech && proj.tech.length > 0) {
                    doc.fontSize(8).font('Helvetica').fillColor(primaryColor).text(`Technologies: ${Array.isArray(proj.tech) ? proj.tech.join(', ') : proj.tech}`);
                }
                if (idx < data.projects.length - 1) doc.moveDown(0.3);
            });
        }

        if (data.education) {
            drawSectionHeader('Education');
            const eduText = typeof data.education === 'string' ? data.education : JSON.stringify(data.education);
            doc.fontSize(10).font('Helvetica').fillColor(textColor).text(eduText, { leading: 14 });
        }

        if (data.certifications) {
            drawSectionHeader('Certifications');
            doc.fontSize(10).font('Helvetica').fillColor(textColor).text(data.certifications, { leading: 14 });
        }

        if (data.languages) {
            drawSectionHeader('Languages');
            doc.fontSize(10).font('Helvetica').fillColor(textColor).text(data.languages, { leading: 14 });
        }

        doc.end();

        stream.on('finish', () => resolve(outputPath));
        stream.on('error', reject);
    });
}

module.exports = { createResumePDF };
