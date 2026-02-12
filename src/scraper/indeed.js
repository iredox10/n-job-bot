const axios = require('axios');
const cheerio = require('cheerio');

async function scrapeIndeed(keywords) {
    const jobs = [];
    const url = `https://ng.indeed.com/jobs?q=${encodeURIComponent(keywords)}&l=Nigeria`;

    try {
        console.log(`Searching Indeed: ${url}`);
        const { data } = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });

        const $ = cheerio.load(data);

        $('.job_seen_beacon').each((i, el) => {
            const title = $(el).find('h2.jobTitle span').text().trim();
            const link = 'https://ng.indeed.com' + $(el).find('h2.jobTitle a').attr('href');
            const company = $(el).find('[data-testid="company-name"]').text().trim();
            
            if (title && link) {
                jobs.push({ title, company, link, source: 'Indeed' });
            }
        });

        return jobs;
    } catch (error) {
        console.error('Indeed scrape failed (Might be blocked by Cloudflare):', error.message);
        return [];
    }
}

module.exports = { scrapeIndeed };
