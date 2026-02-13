const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle } = require('docx');
const fs = require('fs');

async function createResumeWord(outputPath, data) {
    const primaryColor = '1e40af';
    const textColor = '1f2937';
    const mutedColor = '6b7280';

    const createSectionHeader = (title) => [
        new Paragraph({ spacing: { before: 200, after: 100 } }),
        new Paragraph({
            children: [
                new TextRun({ text: title.toUpperCase(), bold: true, size: 24, color: primaryColor })
            ],
            border: {
                bottom: { color: primaryColor, space: 1, size: 6, style: BorderStyle.SINGLE }
            }
        }),
        new Paragraph({ spacing: { after: 100 } })
    ];

    const children = [
        new Paragraph({
            children: [new TextRun({ text: data.name || "Name", bold: true, size: 48 })],
            alignment: AlignmentType.CENTER,
            spacing: { after: 100 }
        }),
        new Paragraph({
            children: [
                new TextRun({ 
                    text: [data.email, data.phone, data.location].filter(Boolean).join('  |  '),
                    size: 18, 
                    color: mutedColor 
                })
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 50 }
        })
    ];

    const linkParts = [];
    if (data.linkedin) linkParts.push(`LinkedIn: ${data.linkedin}`);
    if (data.github) linkParts.push(`GitHub: ${data.github}`);
    if (data.portfolio) linkParts.push(`Portfolio: ${data.portfolio}`);
    if (linkParts.length > 0) {
        children.push(new Paragraph({
            children: [new TextRun({ text: linkParts.join('  |  '), size: 16, color: primaryColor })],
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 }
        }));
    }

    if (data.summary) {
        children.push(...createSectionHeader('Professional Summary'));
        children.push(new Paragraph({
            children: [new TextRun({ text: data.summary, size: 20 })],
            spacing: { after: 100 }
        }));
    }

    if (data.skills && data.skills.length > 0) {
        children.push(...createSectionHeader('Technical Skills'));
        const skillsText = Array.isArray(data.skills) ? data.skills.join('  •  ') : data.skills;
        children.push(new Paragraph({
            children: [new TextRun({ text: skillsText, size: 20 })],
            spacing: { after: 100 }
        }));
    }

    if (data.workExperience && data.workExperience.length > 0) {
        children.push(...createSectionHeader('Professional Experience'));
        data.workExperience.forEach((exp, idx) => {
            children.push(new Paragraph({
                children: [new TextRun({ text: exp.title || "Role", bold: true, size: 22 })],
                spacing: { after: 50 }
            }));
            children.push(new Paragraph({
                children: [new TextRun({ 
                    text: `${exp.company || 'Company'}${exp.location ? ' | ' + exp.location : ''}${exp.duration ? ' | ' + exp.duration : ''}`,
                    size: 18, 
                    color: mutedColor 
                })],
                spacing: { after: 50 }
            }));
            
            if (exp.bullets && exp.bullets.length > 0) {
                exp.bullets.forEach(bullet => {
                    children.push(new Paragraph({
                        children: [new TextRun({ 
                            text: bullet.startsWith('•') ? bullet : `• ${bullet}`,
                            size: 18 
                        })],
                        indent: { left: 200 },
                        spacing: { after: 30 }
                    }));
                });
            }
            if (idx < data.workExperience.length - 1) {
                children.push(new Paragraph({ spacing: { after: 100 } }));
            }
        });
    }

    if (data.projects && data.projects.length > 0) {
        children.push(...createSectionHeader('Projects'));
        data.projects.forEach((proj, idx) => {
            children.push(new Paragraph({
                children: [new TextRun({ text: proj.name || "Project Name", bold: true, size: 20 })],
                spacing: { after: 30 }
            }));
            if (proj.description) {
                children.push(new Paragraph({
                    children: [new TextRun({ text: proj.description, size: 18 })],
                    spacing: { after: 30 }
                }));
            }
            if (proj.tech && proj.tech.length > 0) {
                children.push(new Paragraph({
                    children: [new TextRun({ 
                        text: `Technologies: ${Array.isArray(proj.tech) ? proj.tech.join(', ') : proj.tech}`,
                        size: 16, 
                        color: primaryColor 
                    })],
                    spacing: { after: 50 }
                }));
            }
            if (idx < data.projects.length - 1) {
                children.push(new Paragraph({ spacing: { after: 100 } }));
            }
        });
    }

    if (data.education) {
        children.push(...createSectionHeader('Education'));
        children.push(new Paragraph({
            children: [new TextRun({ text: typeof data.education === 'string' ? data.education : JSON.stringify(data.education), size: 20 })],
            spacing: { after: 100 }
        }));
    }

    if (data.certifications) {
        children.push(...createSectionHeader('Certifications'));
        children.push(new Paragraph({
            children: [new TextRun({ text: data.certifications, size: 20 })],
            spacing: { after: 100 }
        }));
    }

    if (data.languages) {
        children.push(...createSectionHeader('Languages'));
        children.push(new Paragraph({
            children: [new TextRun({ text: data.languages, size: 20 })],
            spacing: { after: 100 }
        }));
    }

    const doc = new Document({
        sections: [{
            properties: {
                page: {
                    margin: { top: 720, right: 720, bottom: 720, left: 720 }
                }
            },
            children
        }]
    });

    const buffer = await Packer.toBuffer(doc);
    fs.writeFileSync(outputPath, buffer);
    return outputPath;
}

module.exports = { createResumeWord };
