// services/aiService.js - OpenAI-powered AI service layer
// Provides chat, summarization, translation, sentiment, moderation, and more

class AIService {
  constructor() {
    this.fs = require('fs');
    // We'll use dynamic import or graceful fallback if OpenAI isn't configured
    this.openai = null;
    this.isConfigured = false;
    this._init();
  }

  async _init() {
    try {
      if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'sk-demo-key') {
        const { default: OpenAI } = await import('openai');
        this.openai = new OpenAI({ 
          apiKey: process.env.OPENAI_API_KEY,
          baseURL: 'https://api.groq.com/openai/v1'
        });
        this.isConfigured = true;
        console.log('✅ Groq AI service initialized');
      } else {
        console.log('⚠️  OpenAI not configured — using mock AI responses');
      }
    } catch (e) {
      console.log('⚠️  OpenAI init failed — using mock AI responses');
    }
  }

  // Chat with AI assistant
  async chat(messages, systemPrompt = 'You are Nexus AI, a helpful assistant inside a chat platform.') {
    if (!this.isConfigured) return this._mockChat(messages);
    try {
      const response = await this.openai.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'system', content: systemPrompt }, ...messages],
        max_tokens: 1000,
      });
      return response.choices[0].message.content;
    } catch (e) {
      console.error('Groq Chat Error:', e.message);
      return this._mockChat(messages);
    }
  }

  // Generate smart reply suggestions
  async smartReply(conversationContext) {
    if (!this.isConfigured) {
      return ['Sounds great! 👍', 'Let me think about that...', 'Can you elaborate?'];
    }
    try {
      const response = await this.openai.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [{
          role: 'system',
          content: 'Generate 3 short smart reply suggestions for the conversation. Return as JSON array of strings.',
        }, {
          role: 'user',
          content: conversationContext,
        }],
        max_tokens: 150,
      });
      return this._parseJSON(response.choices[0].message.content);
    } catch (e) {
      return ['Sounds great! 👍', 'Let me think about that...', 'Can you elaborate?'];
    }
  }

  // Summarize a conversation
  async summarize(messages) {
    if (!this.isConfigured) return 'This conversation covered several important topics including project planning and team coordination.';
    try {
      const response = await this.openai.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [{
          role: 'system',
          content: 'Summarize this conversation in 2-3 sentences.',
        }, {
          role: 'user',
          content: messages.map(m => `${m.sender}: ${m.content}`).join('\n'),
        }],
        max_tokens: 200,
      });
      return response.choices[0].message.content;
    } catch (e) {
      console.error('Groq Summarize Error:', e.message);
      return 'Unable to generate summary at this time.';
    }
  }

  // Grammar correction
  async correctGrammar(text) {
    if (!this.isConfigured) return { corrected: text, suggestions: ['No suggestions available in demo mode.'] };
    try {
      const response = await this.openai.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [{
          role: 'system',
          content: 'Correct the grammar. Return JSON: {"corrected": "...", "suggestions": ["..."]}',
        }, { role: 'user', content: text }],
        max_tokens: 300,
      });
      return this._parseJSON(response.choices[0].message.content);
    } catch (e) {
      return { corrected: text, suggestions: [] };
    }
  }

  // Tone improvement
  async improveTone(text, targetTone = 'professional') {
    if (!this.isConfigured) return { improved: text, tone: targetTone };
    try {
      const response = await this.openai.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [{
          role: 'system',
          content: `Rewrite the text in a ${targetTone} tone. Return JSON: {"improved": "...", "tone": "..."}`,
        }, { role: 'user', content: text }],
        max_tokens: 300,
      });
      return this._parseJSON(response.choices[0].message.content);
    } catch (e) {
      return { improved: text, tone: targetTone };
    }
  }

  // Translate text
  async translate(text, targetLang = 'en') {
    if (!this.isConfigured) return { translated: text, detectedLang: 'en', targetLang };
    try {
      const response = await this.openai.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [{
          role: 'system',
          content: `Detect the language and translate to ${targetLang}. Return JSON: {"translated": "...", "detectedLang": "...", "targetLang": "..."}`,
        }, { role: 'user', content: text }],
        max_tokens: 300,
      });
      return this._parseJSON(response.choices[0].message.content);
    } catch (e) {
      return { translated: text, detectedLang: 'unknown', targetLang };
    }
  }

  // Sentiment analysis
  async analyzeSentiment(text) {
    if (!this.isConfigured) {
      const sentiments = ['positive', 'negative', 'neutral', 'mixed'];
      const label = sentiments[Math.floor(Math.random() * sentiments.length)];
      return { label, score: Math.random().toFixed(2) };
    }
    try {
      const response = await this.openai.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [{
          role: 'system',
          content: 'Analyze sentiment. Return JSON: {"label": "positive|negative|neutral|mixed", "score": 0.0-1.0}',
        }, { role: 'user', content: text }],
        max_tokens: 50,
      });
      return this._parseJSON(response.choices[0].message.content);
    } catch (e) {
      console.error('Groq Sentiment Error:', e.message);
      return { label: 'neutral', score: 0.5 };
    }
  }

  // Toxicity detection
  async detectToxicity(text) {
    if (!this.isConfigured) return { isToxic: false, score: 0, categories: [] };
    try {
      const response = await this.openai.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [{
          role: 'system',
          content: 'Detect toxicity. Return JSON: {"isToxic": bool, "score": 0.0-1.0, "categories": []}',
        }, { role: 'user', content: text }],
        max_tokens: 100,
      });
      return this._parseJSON(response.choices[0].message.content);
    } catch (e) {
      console.error('Groq Toxicity Error:', e.message);
      return { isToxic: false, score: 0, categories: [] };
    }
  }

  // Code snippet explanation
  async explainCode(code) {
    if (!this.isConfigured) return 'This code appears to define a function that processes data. (Demo mode — connect OpenAI for real explanations.)';
    try {
      const response = await this.openai.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [{
          role: 'system',
          content: 'Explain this code snippet clearly and concisely.',
        }, { role: 'user', content: code }],
        max_tokens: 500,
      });
      return response.choices[0].message.content;
    } catch (e) {
      return 'Unable to explain code at this time.';
    }
  }

  // Audio transcription
  async transcribeAudio(filePath) {
    if (!this.isConfigured) return 'This is a demo transcription. Real audio requires API key.';
    try {
      const response = await this.openai.audio.transcriptions.create({
        file: this.fs.createReadStream(filePath),
        model: 'whisper-large-v3',
      });
      return response.text;
    } catch (e) {
      console.error('Groq Transcribe Error:', e.message);
      return 'Unable to transcribe audio at this time.';
    }
  }

  // Safe JSON extraction from LLM Markdown responses
  _parseJSON(content) {
    try {
      if (!content) return {};
      // Strip markdown codeblocks
      const cleaned = content.replace(/```(?:json)?\n?/gi, '').replace(/```\n?/g, '').trim();
      return JSON.parse(cleaned);
    } catch (e) {
      console.error('JSON Parse Error:', e.message, 'Content:', content);
      throw e;
    }
  }

  // Mock chat response for demo mode
  _mockChat(messages) {
    const lastMsg = messages[messages.length - 1]?.content || '';
    const responses = [
      'I\'d be happy to help you with that! Here\'s what I think...',
      'Great question! Based on the context, I suggest...',
      'Let me analyze that for you. Here are my thoughts...',
      'That\'s an interesting point. Consider the following approach...',
    ];
    return responses[Math.floor(Math.random() * responses.length)] +
      '\n\n*Note: This is a demo response. AI is not configured perfectly.*';
  }
}

module.exports = new AIService();
