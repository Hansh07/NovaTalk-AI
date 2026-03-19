// controllers/aiController.js - AI feature handlers
const aiService = require('../services/aiService');
const fs = require('fs');

// POST /api/ai/chat - Chat with AI assistant
const chatWithAI = async (req, res) => {
  try {
    const { messages } = req.body;
    const response = await aiService.chat(messages);
    res.json({ response });
  } catch (error) {
    res.status(500).json({ message: 'AI service error', error: error.message });
  }
};

// POST /api/ai/smart-reply - Get smart reply suggestions
const getSmartReplies = async (req, res) => {
  try {
    const { context } = req.body;
    const suggestions = await aiService.smartReply(context);
    res.json({ suggestions });
  } catch (error) {
    res.status(500).json({ message: 'AI service error', error: error.message });
  }
};

// POST /api/ai/summarize - Summarize conversation
const summarizeConversation = async (req, res) => {
  try {
    const { messages } = req.body;
    const summary = await aiService.summarize(messages);
    res.json({ summary });
  } catch (error) {
    res.status(500).json({ message: 'AI service error', error: error.message });
  }
};

// POST /api/ai/grammar - Correct grammar
const correctGrammar = async (req, res) => {
  try {
    const { text } = req.body;
    const result = await aiService.correctGrammar(text);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'AI service error', error: error.message });
  }
};

// POST /api/ai/tone - Improve tone
const improveTone = async (req, res) => {
  try {
    const { text, targetTone } = req.body;
    const result = await aiService.improveTone(text, targetTone);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'AI service error', error: error.message });
  }
};

// POST /api/ai/translate - Translate text
const translateText = async (req, res) => {
  try {
    const { text, targetLang } = req.body;
    const result = await aiService.translate(text, targetLang);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'AI service error', error: error.message });
  }
};

// POST /api/ai/sentiment - Analyze sentiment
const analyzeSentiment = async (req, res) => {
  try {
    const { text } = req.body;
    const result = await aiService.analyzeSentiment(text);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'AI service error', error: error.message });
  }
};

// POST /api/ai/explain-code - Explain code snippet
const explainCode = async (req, res) => {
  try {
    const { code } = req.body;
    const explanation = await aiService.explainCode(code);
    res.json({ explanation });
  } catch (error) {
    res.status(500).json({ message: 'AI service error', error: error.message });
  }
};

// POST /api/ai/transcribe - Transcribe audio to text
const transcribeAudioFile = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No audio file provided' });
    
    // Rename file to include .webm extension so Groq accepts it
    const newPath = req.file.path + '.webm';
    fs.renameSync(req.file.path, newPath);
    
    const text = await aiService.transcribeAudio(newPath);
    
    // Cleanup temp file if exists
    if (fs.existsSync(newPath)) fs.unlinkSync(newPath);
    
    res.json({ text });
  } catch (error) {
    res.status(500).json({ message: 'AI transcription error', error: error.message });
  }
};

module.exports = {
  chatWithAI, getSmartReplies, summarizeConversation,
  correctGrammar, improveTone, translateText,
  analyzeSentiment, explainCode, transcribeAudioFile,
};
