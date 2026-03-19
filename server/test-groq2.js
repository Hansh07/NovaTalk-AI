require('dotenv').config();
const aiService = require('./services/aiService');
const fs = require('fs');

(async () => {
    // wait for AI service to initialize
    await new Promise(resolve => setTimeout(resolve, 1000));
    try {
        const res = await aiService.summarize([{sender: 'user', content: 'What is the context?'}]);
    } catch (e) {
        fs.writeFileSync('groq_err.json', JSON.stringify({
            message: e.message,
            stack: e.stack,
            response: e.response ? e.response.data : null
        }, null, 2));
    }
})();
