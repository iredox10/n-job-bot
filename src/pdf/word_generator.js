const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } = require('docx');
const fs = require('fs');

async function createResumeWord(outputPath, data) {
    const doc = new Document({
        sections: [{
            properties: {},
            children: [
                new Paragraph({
                    text: data.name,
                    heading: HeadingLevel.TITLE,
                    alignment: AlignmentType.CENTER,
                }),
                new Paragraph({
                    children: [
                        new TextRun(`${data.email} | ${data.phone} | ${data.location}`),
                    ],
                    alignment: AlignmentType.CENTER,
                }),
                new Paragraph({ text: "", spacing: { after: 200 } }),

                new Paragraph({
                    text: "Professional Summary",
                    heading: HeadingLevel.HEADING_1,
                }),
                new Paragraph({
                    text: data.summary,
                    spacing: { after: 200 },
                }),

                new Paragraph({
                    text: "Key Qualifications",
                    heading: HeadingLevel.HEADING_1,
                }),
                ...data.highlights.map(h => new Paragraph({
                    text: h,
                    bullet: { level: 0 },
                })),
                new Paragraph({ text: "", spacing: { after: 200 } }),

                new Paragraph({
                    text: "Professional Experience",
                    heading: HeadingLevel.HEADING_1,
                }),
                ...data.experience.flatMap(exp => [
                    new Paragraph({
                        children: [
                            new TextRun({ text: exp.role, bold: true }),
                            new TextRun({ text: ` at ${exp.company}` }),
                        ],
                    }),
                    new Paragraph({
                        text: exp.description,
                        spacing: { after: 150 },
                    })
                ]),
            ],
        }],
    });

    const buffer = await Packer.toBuffer(doc);
    fs.writeFileSync(outputPath, buffer);
    return outputPath;
}

module.exports = { createResumeWord };
