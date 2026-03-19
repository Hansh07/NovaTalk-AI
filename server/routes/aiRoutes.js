// routes/aiRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { aiLimiter } = require('../middleware/rateLimiter');
const {
  chatWithAI, getSmartReplies, summarizeConversation,
  correctGrammar, improveTone, translateText,
  analyzeSentiment, explainCode, transcribeAudioFile,
} = require('../controllers/aiController');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

router.use(protect);
router.use(aiLimiter);

router.post('/chat', chatWithAI);
router.post('/smart-reply', getSmartReplies);
router.post('/summarize', summarizeConversation);
router.post('/grammar', correctGrammar);
router.post('/tone', improveTone);
router.post('/translate', translateText);
router.post('/sentiment', analyzeSentiment);
router.post('/explain-code', explainCode);
router.post('/transcribe', upload.single('audio'), transcribeAudioFile);

module.exports = router;
