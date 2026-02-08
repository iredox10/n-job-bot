const axios = require('axios');
const cheerio = require('cheerio');

async function scrapeMyJobMag(keywords) {
    const jobs = [];
    // Try search first
    const urls = [
        `https://www.myjobmag.com/search/jobs?q=${encodeURIComponent(keywords)}`,
        `https://www.myjobmag.com/jobs-by-field/information-technology`
    ];

    for (const searchUrl of urls) {
        try {
            console.log(`Searching MyJobMag: ${searchUrl}`);
            const { data } = await axios.get(searchUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                },
                timeout: 10000
            });

            const $ = cheerio.load(data);
            const foundBefore = jobs.length;

            $('.job-info, .job-list-items li, .mag-job-list li').each((i, el) => {
                const title = $(el).find('h2 a, .job-title a').first().text().trim();
                let link = $(el).find('h2 a, .job-title a').first().attr('href');
                const company = $(el).find('.job-list-sub-item, .company-name').first().text().trim();
                
                if (title && link) {
                    if (!link.startsWith('http')) link = 'https://www.myjobmag.com' + link;
                    // Check for duplicates
                    if (!jobs.find(j => j.link === link)) {
                        jobs.push({ title, company, link, source: 'MyJobMag' });
                    }
                }
            });
            console.log(`Found ${jobs.length - foundBefore} new jobs at ${searchUrl}`);
        } catch (error) {
            console.error(`Scraping MyJobMag failed at ${searchUrl}:`, error.message);
        }
    }
    return jobs;
}

async function getJobDetails(url) {
    try {
        const { data } = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
            },
            timeout: 15000
        });
        const $ = cheerio.load(data);
        
        // MyJobMag job description container
        const description = $('.job-details, .job-description, #job-details').text().trim();
        
        // Try to find an email in the text
        const emailMatch = description.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi);
        let email = emailMatch ? emailMatch[0] : null;

        // Ignore common support/service emails
        if (email && (email.includes('services@myjobmag.com') || email.includes('info@myjobmag.com'))) {
            email = null;
        }

        return { description, email };
    } catch (error) {
        console.error(`Failed to get job details for ${url}:`, error.message);
        return null;
    }
}

module.exports = { scrapeMyJobMag, getJobDetails };
