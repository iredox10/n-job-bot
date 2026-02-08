const axios = require('axios');
const cheerio = require('cheerio');

async function scrapeHotNigerianJobs(keywords) {
    const jobs = [];
    const searchUrl = `https://www.hotnigerianjobs.com/search.php?keywords=${encodeURIComponent(keywords)}&field=all&location=all`;

    try {
        const { data } = await axios.get(searchUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });

        const $ = cheerio.load(data);

        $('.my-listing').each((i, el) => {
            const title = $(el).find('h4 a').text().trim();
            const link = $(el).find('h4 a').attr('href');
            const company = $(el).find('.company').text().trim();
            
            if (title && link) {
                jobs.push({ title, company, link, source: 'HotNigerianJobs' });
            }
        });

        return jobs;
    } catch (error) {
        console.error('Scraping HotNigerianJobs failed:', error.message);
        return [];
    }
}

async function getHotJobDetails(url) {
    try {
        const { data } = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });
        const $ = cheerio.load(data);
        const description = $('#job-details').text().trim() || $('.job-details').text().trim() || $('body').text();
        const emailMatch = description.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi);
        const email = emailMatch ? emailMatch[0] : null;

        return { description, email };
    } catch (error) {
        console.error('Failed to get HotJob details:', error.message);
        return null;
    }
}

module.exports = { scrapeHotNigerianJobs, getHotJobDetails };
