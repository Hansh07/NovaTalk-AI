require('dotenv').config();
const aiService = require('./services/aiService');

const test = async () => {
  try {
    const text = 'Hello pappy what are u doing';
    console.log('Sending text:', text);
    const result = await aiService.translate(text, 'hi');
    require('fs').writeFileSync('translate-result.json', JSON.stringify(result, null, 2));
    console.log('Wrote to translate-result.json');
  } catch (err) {
    console.error('Error:', err);
  }
};

test();
