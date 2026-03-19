require('dotenv').config();
const aiService = require('./services/aiService');

(async () => {
    try {
        const res = await aiService.summarize([{sender: 'user', content: 'What is the context?'}]);
        console.log("RESULT:", res);
    } catch (e) {
        console.error("ERROR:", e);
    }
})();
