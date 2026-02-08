const axios = require('axios');
const cheerio = require('cheerio');

async function testScrape() {
    const url = 'https://www.myjobmag.com/jobs-by-field/web-development';
    try {
        const { data } = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });
        const $ = cheerio.load(data);
        console.log('Title:', $('title').text());
        
        $('.job-info').each((i, el) => {
            const title = $(el).find('h2 a').text().trim();
            console.log('Found:', title);
        });
    } catch (e) {
        console.error(e.message);
        if (e.response) console.log(e.response.status);
    }
}
testScrape();
