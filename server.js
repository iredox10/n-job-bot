const express = require('express');
const { spawn } = require('child_process');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

app.post('/run-bot', (req, res) => {
    console.log('Starting Job Bot...');
    const bot = spawn('node', ['index.js']);

    bot.stdout.on('data', (data) => {
        console.log(`Bot: ${data}`);
    });

    bot.stderr.on('data', (data) => {
        console.error(`Bot Error: ${data}`);
    });

    bot.on('close', (code) => {
        console.log(`Bot finished with code ${code}`);
    });

    res.json({ status: 'started' });
});

app.listen(3001, () => {
    console.log('Bot Controller listening on port 3001');
});
