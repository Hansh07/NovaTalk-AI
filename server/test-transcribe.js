require('dotenv').config();
const fs = require('fs');
const OpenAI = require('openai').default;

const test = async () => {
  try {
    const openai = new OpenAI({ 
      apiKey: process.env.OPENAI_API_KEY,
      baseURL: 'https://api.groq.com/openai/v1'
    });
    
    // We'll just write a tiny dummy file to simulate
    fs.writeFileSync('dummy.wav', 'dummy content');
    
    console.log('Testing whisper on Groq...');
    const response = await openai.audio.transcriptions.create({
      file: fs.createReadStream('dummy.wav'),
      model: 'whisper-large-v3',
    });
    
    console.log('Response:', response);
  } catch (err) {
    console.error('EXPECTED GROQ ERROR:', err.message);
    if(err.response) {
       console.error(err.response.data);
    }
  } finally {
    if(fs.existsSync('dummy.wav')) fs.unlinkSync('dummy.wav');
  }
};

test();
