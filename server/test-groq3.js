require('dotenv').config();
const { default: OpenAI } = require('openai');
const fs = require('fs');

(async () => {
    try {
        const openai = new OpenAI({ 
          apiKey: process.env.OPENAI_API_KEY,
          baseURL: 'https://api.groq.com/openai/v1'
        });
        const response = await openai.chat.completions.create({
          model: 'llama3-70b-8192',
          messages: [{ role: 'system', content: 'test' }, { role: 'user', content: 'hello' }],
          max_tokens: 100
        });
        console.log("SUCCESS:", response.choices[0].message.content);
    } catch (e) {
        fs.writeFileSync('groq_err.json', JSON.stringify({
            message: e.message,
            status: e.status,
            error: e.error
        }, null, 2));
        console.error("SAVED ERROR TO JSON");
    }
})();
